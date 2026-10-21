/**
 * CVSS v3.1 Specification Compliant Calculator
 * Reference: https://www.first.org/cvss/v3.1/specification-document
 */

class CvssService {
  /**
   * Official CVSS v3.1 Rounding function
   * Rounds up to the nearest single decimal digit (e.g. 4.02 -> 4.1)
   */
  static roundUp(input) {
    const intInput = Math.round(input * 100000);
    if (intInput % 10000 === 0) {
      return intInput / 100000;
    }
    return (Math.floor(intInput / 10000) + 1) / 10;
  }

  /**
   * Qualitative Severity Rating Scale
   */
  static getSeverity(score) {
    if (score === 0) return 'None';
    if (score < 4.0) return 'Low';
    if (score < 7.0) return 'Medium';
    if (score < 9.0) return 'High';
    return 'Critical';
  }

  /**
   * Parse and validate CVSS v3.1 vector string
   */
  static parseVector(vectorStr) {
    if (!vectorStr || typeof vectorStr !== 'string') {
      throw new Error('Vector string must be a non-empty string');
    }

    let trimmed = vectorStr.trim();
    if (!trimmed.startsWith('CVSS:3.1/') && !trimmed.startsWith('CVSS:3.0/')) {
      if (trimmed.startsWith('AV:')) {
        trimmed = 'CVSS:3.1/' + trimmed;
      } else {
        throw new Error("Vector must start with 'CVSS:3.1/' or 'AV:'");
      }
    }

    const parts = trimmed.split('/');
    const metrics = {};

    for (let i = 1; i < parts.length; i++) {
      const [key, val] = parts[i].split(':');
      if (key && val) {
        metrics[key.toUpperCase()] = val.toUpperCase();
      }
    }

    const required = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'];
    for (const req of required) {
      if (!metrics[req]) {
        throw new Error(`Missing required CVSS metric: ${req}`);
      }
    }

    return metrics;
  }

  /**
   * Calculate CVSS v3.1 Base Score from metric weights
   */
  static calculateFromMetrics(m) {
    // Attack Vector (AV)
    const avWeights = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
    const av = avWeights[m.AV];
    if (av === undefined) throw new Error(`Invalid Attack Vector (AV): ${m.AV}`);

    // Attack Complexity (AC)
    const acWeights = { L: 0.77, H: 0.44 };
    const ac = acWeights[m.AC];
    if (ac === undefined) throw new Error(`Invalid Attack Complexity (AC): ${m.AC}`);

    // Scope (S)
    const scopeChanged = m.S === 'C';
    if (m.S !== 'U' && m.S !== 'C') throw new Error(`Invalid Scope (S): ${m.S}`);

    // Privileges Required (PR)
    let pr;
    if (!scopeChanged) {
      const prWeights = { N: 0.85, L: 0.62, H: 0.27 };
      pr = prWeights[m.PR];
    } else {
      const prWeights = { N: 0.85, L: 0.68, H: 0.5 };
      pr = prWeights[m.PR];
    }
    if (pr === undefined) throw new Error(`Invalid Privileges Required (PR): ${m.PR}`);

    // User Interaction (UI)
    const uiWeights = { N: 0.85, R: 0.62 };
    const ui = uiWeights[m.UI];
    if (ui === undefined) throw new Error(`Invalid User Interaction (UI): ${m.UI}`);

    // Confidentiality, Integrity, Availability (C, I, A)
    const ciaWeights = { N: 0, L: 0.22, H: 0.56 };
    const c = ciaWeights[m.C];
    const i = ciaWeights[m.I];
    const a = ciaWeights[m.A];

    if (c === undefined) throw new Error(`Invalid Confidentiality (C): ${m.C}`);
    if (i === undefined) throw new Error(`Invalid Integrity (I): ${m.I}`);
    if (a === undefined) throw new Error(`Invalid Availability (A): ${m.A}`);

    // ISS = 1 - [ (1 - ImpactConf) * (1 - ImpactInteg) * (1 - ImpactAvail) ]
    const iss = 1 - (1 - c) * (1 - i) * (1 - a);

    let impact;
    if (!scopeChanged) {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    const exploitability = 8.22 * av * ac * pr * ui;

    let baseScore;
    if (impact <= 0) {
      baseScore = 0.0;
    } else if (!scopeChanged) {
      baseScore = CvssService.roundUp(Math.min(impact + exploitability, 10));
    } else {
      baseScore = CvssService.roundUp(Math.min(1.08 * (impact + exploitability), 10));
    }

    return {
      baseScore: Math.round(baseScore * 10) / 10,
      severity: CvssService.getSeverity(baseScore),
      metrics: m,
      exploitability: Math.round(exploitability * 10) / 10,
      impact: Math.round(impact * 10) / 10,
    };
  }

  /**
   * Calculate CVSS v3.1 score directly from a vector string
   */
  static calculateFromVector(vectorStr) {
    const metrics = CvssService.parseVector(vectorStr);
    const result = CvssService.calculateFromMetrics(metrics);
    return {
      vector: vectorStr.trim(),
      ...result,
      version: '3.1',
    };
  }
}

module.exports = CvssService;
