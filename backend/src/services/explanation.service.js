/**
 * Risk Explanation Service
 * Generates transparent, human-readable rationales for computed priority and risk score
 */

class ExplanationService {
  /**
   * Produce explanatory narrative and bullet points for the risk assessment
   */
  static generateExplanation({
    score,
    priority,
    cvssBaseScore,
    cvssSeverity,
    epss,
    epssPercentile,
    inKev,
    asset,
    businessImpactN,
    exposureN,
    overridesApplied = [],
  }) {
    const reasons = [];

    const scoreSafe = Math.round(Number(score) || 0);
    const prioritySafe = priority || 'P4';

    // Summary statement
    reasons.push(
      `Assigned ${prioritySafe} with an aggregated risk index of ${scoreSafe}/100.`
    );

    // CVSS explanation
    if (cvssBaseScore !== null && cvssBaseScore !== undefined && !isNaN(cvssBaseScore)) {
      reasons.push(
        `Technical Severity: CVSS base score ${cvssBaseScore} (${cvssSeverity || 'Standard'}).`
      );
    } else {
      reasons.push('Technical Severity: CVSS unassigned, baseline impact applied.');
    }

    // Threat intelligence (EPSS & KEV)
    const epssVal = Number(epss) || 0;
    if (inKev) {
      reasons.push('Threat Factor: Active weaponization confirmed in CISA Known Exploited Vulnerabilities (KEV) catalog.');
    } else if (epssVal > 0.5) {
      const pct = Math.round((1 - (epssPercentile || 0.95)) * 100);
      reasons.push(`Threat Factor: Elevated exploitation probability (EPSS ${(epssVal * 100).toFixed(1)}%, top ${pct}% wild exploit potential).`);
    } else if (epssVal > 0.1) {
      reasons.push(`Threat Factor: Moderate exploitation probability (EPSS ${(epssVal * 100).toFixed(1)}%).`);
    } else {
      reasons.push('Threat Factor: Low active exploitation observed in the wild.');
    }

    // Asset & Context exposure
    if (asset) {
      const facing = asset.internetFacing ? 'Internet-facing' : 'Internal';
      const crit = asset.criticality ?? 3;
      const sens = asset.dataSensitivity ?? 3;
      reasons.push(
        `Asset Context: ${facing} ${asset.environment || 'production'} environment on '${asset.name || 'Unnamed Asset'}' (Criticality ${crit}/5, Data Sensitivity ${sens}/5).`
      );
    } else {
      const expPercent = Math.round((Number(exposureN) || 0.4) * 100);
      reasons.push(
        `Asset Context: Exposure factor estimated at ${expPercent}% based on submission telemetry.`
      );
    }

    // Override alerts
    if (overridesApplied.length > 0) {
      for (const override of overridesApplied) {
        reasons.push(`Security Policy Safeguard: ${override}`);
      }
    }

    return reasons;
  }
}

module.exports = ExplanationService;
