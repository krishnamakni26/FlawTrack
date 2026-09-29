const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ThreatIntel = require('../models/ThreatIntel');
const env = require('../config/env');
const logger = require('../utils/logger');

class ThreatIntelService {
  static inMemoryKev = null;
  static inMemoryKevFetchedAt = null;

  /**
   * Load local offline KEV data snapshot
   */
  static getOfflineKev() {
    try {
      const filePath = path.resolve(__dirname, '../../scripts/data/cisa_kev_offline.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.warn(`Failed to read offline KEV snapshot: ${err.message}`);
    }
    return { vulnerabilities: [] };
  }

  /**
   * Load local offline EPSS data snapshot
   */
  static getOfflineEpss(cveId) {
    try {
      const filePath = path.resolve(__dirname, '../../scripts/data/epss_offline.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const match = parsed.data?.find((d) => d.cve?.toUpperCase() === cveId?.toUpperCase());
        if (match) {
          return {
            epss: parseFloat(match.epss) || 0,
            percentile: parseFloat(match.percentile) || 0,
          };
        }
      }
    } catch (err) {
      logger.warn(`Failed to read offline EPSS snapshot: ${err.message}`);
    }
    return { epss: 0.05, percentile: 0.30 }; // Sensible baseline default
  }

  /**
   * Refresh or retrieve CISA KEV catalog (memory + DB cache)
   */
  static async fetchKevCatalog() {
    // If memory cache is fresh (less than 6 hours old), return it
    if (
      ThreatIntelService.inMemoryKev &&
      ThreatIntelService.inMemoryKevFetchedAt &&
      Date.now() - ThreatIntelService.inMemoryKevFetchedAt < 6 * 60 * 60 * 1000
    ) {
      return ThreatIntelService.inMemoryKev;
    }

    if (env.THREAT_INTEL_MODE === 'offline') {
      const offline = ThreatIntelService.getOfflineKev();
      ThreatIntelService.inMemoryKev = new Map(
        offline.vulnerabilities.map((v) => [v.cveID.toUpperCase(), v])
      );
      ThreatIntelService.inMemoryKevFetchedAt = Date.now();
      return ThreatIntelService.inMemoryKev;
    }

    try {
      logger.info('Fetching CISA Known Exploited Vulnerabilities catalog from live feed...');
      const response = await axios.get(
        'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
        { timeout: 10000 }
      );

      if (response.data && Array.isArray(response.data.vulnerabilities)) {
        ThreatIntelService.inMemoryKev = new Map(
          response.data.vulnerabilities.map((v) => [v.cveID.toUpperCase(), v])
        );
        ThreatIntelService.inMemoryKevFetchedAt = Date.now();
        logger.info(`Loaded ${ThreatIntelService.inMemoryKev.size} KEV entries into memory`);
        return ThreatIntelService.inMemoryKev;
      }
    } catch (err) {
      logger.warn(`Live CISA KEV fetch failed (${err.message}). Falling back to local offline snapshot.`);
    }

    const offline = ThreatIntelService.getOfflineKev();
    ThreatIntelService.inMemoryKev = new Map(
      offline.vulnerabilities.map((v) => [v.cveID.toUpperCase(), v])
    );
    ThreatIntelService.inMemoryKevFetchedAt = Date.now();
    return ThreatIntelService.inMemoryKev;
  }

  /**
   * Fetch EPSS data from FIRST.org API with offline fallback
   */
  static async fetchEpss(cveId) {
    if (!cveId) return { epss: 0, percentile: 0 };

    if (env.THREAT_INTEL_MODE === 'offline') {
      return ThreatIntelService.getOfflineEpss(cveId);
    }

    try {
      const response = await axios.get(
        `https://api.first.org/data/v1/epss?cve=${encodeURIComponent(cveId)}`,
        { timeout: 5000 }
      );

      if (response.data?.data?.[0]) {
        const item = response.data.data[0];
        return {
          epss: parseFloat(item.epss) || 0,
          percentile: parseFloat(item.percentile) || 0,
        };
      }
    } catch (err) {
      logger.warn(`Live EPSS fetch for ${cveId} failed (${err.message}). Using offline fallback.`);
    }

    return ThreatIntelService.getOfflineEpss(cveId);
  }

  /**
   * Fetch CVSS from NVD if available
   */
  static async fetchNvdCvss(cveId) {
    if (!cveId || env.THREAT_INTEL_MODE === 'offline') return null;

    try {
      const response = await axios.get(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`,
        { timeout: 7000 }
      );

      const metrics = response.data?.vulnerabilities?.[0]?.cve?.metrics;
      const cvssV31 = metrics?.cvssMetricV31?.[0]?.cvssData;
      if (cvssV31) {
        return {
          baseScore: cvssV31.baseScore,
          vector: cvssV31.vectorString,
        };
      }
    } catch (err) {
      logger.debug(`NVD lookup for ${cveId} failed or timed out: ${err.message}`);
    }
    return null;
  }

  /**
   * Comprehensive threat intel retrieval for a CVE with caching
   */
  static async getThreatIntelForCve(cveId) {
    if (!cveId) {
      return {
        cveId: null,
        epss: 0,
        epssPercentile: 0,
        inKev: false,
        kevDateAdded: null,
        lastCheckedAt: new Date(),
        isStale: false,
      };
    }

    const cleanCve = cveId.trim().toUpperCase();

    // Check DB Cache (fresh within 24 hours)
    try {
      const cached = await ThreatIntel.findOne({ cveId: cleanCve });
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (cached && cached.fetchedAt > twentyFourHoursAgo) {
        return {
          cveId: cached.cveId,
          epss: cached.epss,
          epssPercentile: cached.percentile,
          inKev: cached.inKev,
          kevDateAdded: cached.kevDateAdded,
          cvssBaseScore: cached.cvssBaseScore,
          cvssVector: cached.cvssVector,
          lastCheckedAt: cached.fetchedAt,
          isStale: false,
        };
      }
    } catch (err) {
      logger.warn(`Failed reading ThreatIntel cache for ${cleanCve}: ${err.message}`);
    }

    // Fetch fresh data
    const kevCatalog = await ThreatIntelService.fetchKevCatalog();
    const kevEntry = kevCatalog.get(cleanCve);
    const inKev = !!kevEntry;
    const kevDateAdded = kevEntry?.dateAdded ? new Date(kevEntry.dateAdded) : null;
    const kevRequiredAction = kevEntry?.requiredAction || '';

    const epssData = await ThreatIntelService.fetchEpss(cleanCve);
    const nvdData = await ThreatIntelService.fetchNvdCvss(cleanCve);

    // Update DB Cache
    try {
      await ThreatIntel.findOneAndUpdate(
        { cveId: cleanCve },
        {
          cveId: cleanCve,
          epss: epssData.epss,
          percentile: epssData.percentile,
          inKev,
          kevDateAdded,
          kevRequiredAction,
          cvssBaseScore: nvdData?.baseScore || null,
          cvssVector: nvdData?.vector || null,
          source: env.THREAT_INTEL_MODE === 'offline' ? 'offline_snapshot' : 'live_api',
          fetchedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      logger.warn(`Failed updating ThreatIntel cache for ${cleanCve}: ${err.message}`);
    }

    return {
      cveId: cleanCve,
      epss: epssData.epss,
      epssPercentile: epssData.percentile,
      inKev,
      kevDateAdded,
      cvssBaseScore: nvdData?.baseScore || null,
      cvssVector: nvdData?.vector || null,
      lastCheckedAt: new Date(),
      isStale: false,
    };
  }
}

module.exports = ThreatIntelService;
