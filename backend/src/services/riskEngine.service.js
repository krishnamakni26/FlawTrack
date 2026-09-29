const Setting = require('../models/Setting');
const ExplanationService = require('./explanation.service');
const { PRIORITIES, DEFAULT_RISK_WEIGHTS } = require('../config/constants');

class RiskEngineService {
  /**
   * Validate that risk weights sum to 1.0 (within epsilon tolerance)
   */
  static validateWeights(weights) {
    const sum = Object.values(weights).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    if (Math.abs(sum - 1.0) > 0.005) {
      throw new Error(`Risk weights must sum to 1.0 (Current sum: ${sum.toFixed(3)})`);
    }
    return true;
  }

  /**
   * Normalize affected users into [0, 1] range using log tiers
   */
  static normalizeAffectedUsers(count = 0) {
    if (count <= 10) return 0.1;
    if (count <= 100) return 0.3;
    if (count <= 1000) return 0.6;
    if (count <= 10000) return 0.8;
    return 1.0;
  }

  /**
   * Normalize exposure factor based on environment and internet facing status
   */
  static normalizeExposure(asset, vuln, exposureValues) {
    const isInternetFacing = asset?.internetFacing ?? vuln?.internetFacing ?? false;
    const env = (asset?.environment || 'production').toLowerCase();

    if (isInternetFacing && env === 'production') {
      return exposureValues.internetFacingProduction ?? 1.0;
    }
    if (isInternetFacing && env !== 'production') {
      return exposureValues.internetFacingNonProduction ?? 0.7;
    }
    if (env === 'test' || env === 'development') {
      return exposureValues.isolatedTest ?? 0.1;
    }
    return exposureValues.internal ?? 0.4;
  }

  /**
   * Execute full risk calculation
   */
  static async calculateRisk(vuln, asset = null, customSettings = null) {
    const settings = customSettings || (await Setting.getSettings());
    const weights = settings.riskWeights || DEFAULT_RISK_WEIGHTS;
    const thresholds = settings.priorityThresholds;
    const exposureValues = settings.exposureValues;

    RiskEngineService.validateWeights(weights);

    // 1. Normalized technical severity (CVSS 0-10 -> 0-1)
    const cvssScore = vuln.cvss?.baseScore ?? 5.0;
    const cvssN = Math.min(1.0, Math.max(0.0, cvssScore / 10.0));

    // 2. Normalized exploitation probability (EPSS 0-1)
    const epssN = Math.min(1.0, Math.max(0.0, vuln.threat?.epss ?? 0.0));

    // 3. Known Exploited Vulnerability indicator (KEV binary 0 or 1)
    const kevN = vuln.threat?.inKev ? 1.0 : 0.0;

    // 4. Asset Criticality (1-5 -> 0-1)
    const rawCriticality = asset?.criticality ?? vuln.context?.assetCriticality ?? 3;
    const assetCriticalityN = Math.min(1.0, Math.max(0.0, (rawCriticality - 1) / 4.0));

    // 5. Business Impact (affected users + data sensitivity)
    const rawDataSensitivity = asset?.dataSensitivity ?? vuln.context?.dataSensitivity ?? 3;
    const dataSensitivityN = (rawDataSensitivity - 1) / 4.0;
    const usersN = RiskEngineService.normalizeAffectedUsers(vuln.affectedUsersCount);
    const businessImpactN = Math.min(1.0, Math.max(0.0, 0.5 * dataSensitivityN + 0.5 * usersN));

    // 6. Exposure Factor
    const exposureN = RiskEngineService.normalizeExposure(asset, vuln, exposureValues);

    // Weighted Formula Calculation (0 to 100)
    const rawScore =
      100 *
      (weights.cvss * cvssN +
        weights.epss * epssN +
        weights.kev * kevN +
        weights.assetCriticality * assetCriticalityN +
        weights.businessImpact * businessImpactN +
        weights.exposure * exposureN);

    const score = Math.round(Math.min(100, Math.max(0, rawScore)) * 10) / 10;

    // Base Priority from thresholds
    let priority;
    if (score >= thresholds.p1) {
      priority = PRIORITIES.P1;
    } else if (score >= thresholds.p2) {
      priority = PRIORITIES.P2;
    } else if (score >= thresholds.p3) {
      priority = PRIORITIES.P3;
    } else {
      priority = PRIORITIES.P4;
    }

    // Safeguard Overrides
    const overridesApplied = [];
    const isInternetFacing = asset?.internetFacing ?? vuln.internetFacing ?? false;

    // Override 1: CISA KEV on internet-facing asset is floored at P1
    if (vuln.threat?.inKev && isInternetFacing && priority !== PRIORITIES.P1) {
      priority = PRIORITIES.P1;
      overridesApplied.push('Elevated to P1: Active CISA KEV exploitation on an internet-facing asset.');
    }

    // Override 2: CVSS >= 9.0 is floored at P2
    if (cvssScore >= 9.0 && (priority === PRIORITIES.P3 || priority === PRIORITIES.P4)) {
      priority = PRIORITIES.P2;
      overridesApplied.push('Floored at P2: CVSS base score exceeds 9.0 (Critical technical severity).');
    }

    // Component weighted breakdown points
    const breakdown = {
      cvssWeight: Math.round(100 * weights.cvss * cvssN * 10) / 10,
      epssWeight: Math.round(100 * weights.epss * epssN * 10) / 10,
      kevWeight: Math.round(100 * weights.kev * kevN * 10) / 10,
      assetCriticalityWeight: Math.round(100 * weights.assetCriticality * assetCriticalityN * 10) / 10,
      businessImpactWeight: Math.round(100 * weights.businessImpact * businessImpactN * 10) / 10,
      exposureWeight: Math.round(100 * weights.exposure * exposureN * 10) / 10,
    };

    // Human-readable explanation generator
    const explanation = ExplanationService.generateExplanation({
      score,
      priority,
      cvssBaseScore: vuln.cvss?.baseScore,
      cvssSeverity: vuln.cvss?.severity,
      epss: vuln.threat?.epss,
      epssPercentile: vuln.threat?.epssPercentile,
      inKev: vuln.threat?.inKev,
      asset,
      businessImpactN,
      exposureN,
      overridesApplied,
    });

    return {
      score,
      priority,
      breakdown,
      explanation,
      overridesApplied,
      calculatedAt: new Date(),
    };
  }
}

module.exports = RiskEngineService;
