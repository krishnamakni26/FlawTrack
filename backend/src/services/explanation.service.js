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

    // Summary statement
    reasons.push(
      `Assigned ${priority} with an aggregated risk index of ${Math.round(score)}/100.`
    );

    // CVSS explanation
    if (cvssBaseScore !== null && cvssBaseScore !== undefined) {
      reasons.push(
        `Technical Severity: CVSS base score ${cvssBaseScore} (${cvssSeverity || 'Standard'}).`
      );
    } else {
      reasons.push('Technical Severity: CVSS unassigned, baseline impact applied.');
    }

    // Threat intelligence (EPSS & KEV)
    if (inKev) {
      reasons.push('Threat Factor: Active weaponization confirmed in CISA Known Exploited Vulnerabilities (KEV) catalog.');
    } else if (epss > 0.5) {
      const pct = Math.round((1 - (epssPercentile || 0.95)) * 100);
      reasons.push(`Threat Factor: Elevated exploitation probability (EPSS ${(epss * 100).toFixed(1)}%, top ${pct}% wild exploit potential).`);
    } else if (epss > 0.1) {
      reasons.push(`Threat Factor: Moderate exploitation probability (EPSS ${(epss * 100).toFixed(1)}%).`);
    } else {
      reasons.push('Threat Factor: Low active exploitation observed in the wild.');
    }

    // Asset & Context exposure
    if (asset) {
      const facing = asset.internetFacing ? 'Internet-facing' : 'Internal';
      reasons.push(
        `Asset Context: ${facing} ${asset.environment || 'production'} environment on '${asset.name}' (Criticality ${asset.criticality}/5, Data Sensitivity ${asset.dataSensitivity}/5).`
      );
    } else {
      reasons.push(
        `Asset Context: Exposure factor estimated at ${Math.round(exposureN * 100)}% based on submission telemetry.`
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
