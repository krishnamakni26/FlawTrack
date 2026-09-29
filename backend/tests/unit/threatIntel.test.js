const ThreatIntelService = require('../../src/services/threatIntel.service');
const ThreatIntel = require('../../src/models/ThreatIntel');

describe('ThreatIntelService', () => {
  beforeEach(async () => {
    process.env.THREAT_INTEL_MODE = 'offline';
  });

  describe('Offline lookup & fallback', () => {
    it('returns known KEV data for Log4Shell in offline mode', async () => {
      const data = await ThreatIntelService.getThreatIntelForCve('CVE-2021-44228');
      expect(data).toBeDefined();
      expect(data.cveId).toBe('CVE-2021-44228');
      expect(data.inKev).toBe(true);
      expect(data.epss).toBeGreaterThan(0.5);
    });

    it('returns safe fallback defaults for non-existent CVE', async () => {
      const data = await ThreatIntelService.getThreatIntelForCve('CVE-9999-99999');
      expect(data).toBeDefined();
      expect(data.cveId).toBe('CVE-9999-99999');
      expect(data.inKev).toBe(false);
      expect(data.epss).toBe(0.05);
    });

    it('caches data in ThreatIntel model', async () => {
      const cve = 'CVE-2021-44228';
      await ThreatIntelService.getThreatIntelForCve(cve);
      const cached = await ThreatIntel.findOne({ cveId: cve });
      expect(cached).toBeDefined();
      expect(cached.cveId).toBe(cve);
      expect(cached.inKev).toBe(true);
    });

    it('returns default null object if no cveId provided', async () => {
      const res = await ThreatIntelService.getThreatIntelForCve(null);
      expect(res).toBeDefined();
      expect(res.cveId).toBeNull();
      expect(res.inKev).toBe(false);
    });
  });

  describe('EPSS and KEV individual helpers', () => {
    it('fetches KEV catalog Map', async () => {
      const kevMap = await ThreatIntelService.fetchKevCatalog();
      expect(kevMap).toBeDefined();
      expect(kevMap.has('CVE-2021-44228')).toBe(true);
      expect(kevMap.has('CVE-0000-00000')).toBe(false);
    });

    it('fetches EPSS data', async () => {
      const epssInfo = await ThreatIntelService.fetchEpss('CVE-2021-44228');
      expect(epssInfo).toBeDefined();
      expect(epssInfo.epss).toBeGreaterThan(0);
      expect(epssInfo.percentile).toBeGreaterThan(0);
    });
  });
});
