/**
 * VulnTrack Risk Engine Validation Experiment
 *
 * Evaluates multi-factor contextual risk scoring against CVSS-only prioritization.
 * Uses exact formulas, default weights, and safeguard overrides from RiskEngineService.
 */

const fs = require('fs');
const path = require('path');

// Default system weights
const WEIGHTS = {
  cvss: 0.30,
  epss: 0.20,
  kev: 0.20,
  assetCriticality: 0.15,
  businessImpact: 0.10,
  exposure: 0.05,
};

const THRESHOLDS = { p1: 70, p2: 50, p3: 30 };

const EXPOSURE_VALUES = {
  internetFacingProduction: 1.0,
  internetFacingNonProduction: 0.7,
  internal: 0.4,
  isolatedTest: 0.1,
};

function normalizeUsers(count = 0) {
  if (count <= 10) return 0.1;
  if (count <= 100) return 0.3;
  if (count <= 1000) return 0.6;
  if (count <= 10000) return 0.8;
  return 1.0;
}

function normalizeExposure(asset, vuln) {
  const isInternet = asset?.internetFacing ?? vuln?.internetFacing ?? false;
  const env = (asset?.environment || 'production').toLowerCase();
  if (isInternet && env === 'production') return EXPOSURE_VALUES.internetFacingProduction;
  if (isInternet && env !== 'production') return EXPOSURE_VALUES.internetFacingNonProduction;
  if (env === 'test' || env === 'development') return EXPOSURE_VALUES.isolatedTest;
  return EXPOSURE_VALUES.internal;
}

function calculateRisk(vuln, asset) {
  const cvssScore = vuln.cvss?.baseScore ?? 5.0;
  const cvssN = Math.min(1.0, Math.max(0.0, cvssScore / 10.0));
  const epssN = Math.min(1.0, Math.max(0.0, vuln.threat?.epss ?? 0.0));
  const kevN = vuln.threat?.inKev ? 1.0 : 0.0;

  const rawCrit = asset?.criticality ?? 3;
  const assetCriticalityN = Math.min(1.0, Math.max(0.0, (rawCrit - 1) / 4.0));

  const rawSens = asset?.dataSensitivity ?? 3;
  const dataSensitivityN = (rawSens - 1) / 4.0;
  const usersN = normalizeUsers(vuln.affectedUsersCount);
  const businessImpactN = Math.min(1.0, Math.max(0.0, 0.5 * dataSensitivityN + 0.5 * usersN));

  const exposureN = normalizeExposure(asset, vuln);

  const rawScore = 100 * (
    WEIGHTS.cvss * cvssN +
    WEIGHTS.epss * epssN +
    WEIGHTS.kev * kevN +
    WEIGHTS.assetCriticality * assetCriticalityN +
    WEIGHTS.businessImpact * businessImpactN +
    WEIGHTS.exposure * exposureN
  );

  const score = Math.round(Math.min(100, Math.max(0, rawScore)) * 10) / 10;

  let priority = 'P4';
  if (score >= THRESHOLDS.p1) priority = 'P1';
  else if (score >= THRESHOLDS.p2) priority = 'P2';
  else if (score >= THRESHOLDS.p3) priority = 'P3';

  const isInternet = asset?.internetFacing ?? vuln?.internetFacing ?? false;
  const overrides = [];

  // Override 1: CISA KEV on internet-facing asset -> P1
  if (vuln.threat?.inKev && isInternet && priority !== 'P1') {
    priority = 'P1';
    overrides.push('Elevated to P1: Active CISA KEV on internet-facing asset');
  }

  // Override 2: CVSS >= 9.0 -> P2 floor
  if (cvssScore >= 9.0 && (priority === 'P3' || priority === 'P4')) {
    priority = 'P2';
    overrides.push('Floored at P2: CVSS >= 9.0 (Critical theoretical severity)');
  }

  // Pure CVSS baseline priority mapping
  let cvssPriority = 'P4';
  if (cvssScore >= 9.0) cvssPriority = 'P1';      // Critical (9.0 - 10.0)
  else if (cvssScore >= 7.0) cvssPriority = 'P2'; // High (7.0 - 8.9)
  else if (cvssScore >= 4.0) cvssPriority = 'P3'; // Medium (4.0 - 6.9)
  else cvssPriority = 'P4';                       // Low (0.1 - 3.9)

  return {
    score,
    priority,
    cvssScore,
    cvssPriority,
    epss: vuln.threat?.epss ?? 0.0,
    inKev: vuln.threat?.inKev ?? false,
    assetCriticality: rawCrit,
    environment: asset?.environment || 'production',
    isInternetFacing: isInternet,
    overrides,
    breakdown: {
      cvssContribution: Math.round(100 * WEIGHTS.cvss * cvssN * 10) / 10,
      epssContribution: Math.round(100 * WEIGHTS.epss * epssN * 10) / 10,
      kevContribution: Math.round(100 * WEIGHTS.kev * kevN * 10) / 10,
      assetContribution: Math.round(100 * WEIGHTS.assetCriticality * assetCriticalityN * 10) / 10,
      bizContribution: Math.round(100 * WEIGHTS.businessImpact * businessImpactN * 10) / 10,
      expContribution: Math.round(100 * WEIGHTS.exposure * exposureN * 10) / 10,
    }
  };
}

// 7 Representative Case Scenarios
const testCases = [
  {
    caseId: 'CASE-1',
    description: 'High CVSS RCE on offline test sandbox (Zero EPSS, Non-KEV)',
    vuln: {
      title: 'Remote Code Execution in legacy dev sandbox',
      cvss: { baseScore: 9.8 },
      threat: { epss: 0.015, inKev: false },
      affectedUsersCount: 0,
      internetFacing: false,
    },
    asset: {
      name: 'Dev-Worker-Node-04',
      criticality: 1,
      dataSensitivity: 1,
      environment: 'development',
      internetFacing: false,
    }
  },
  {
    caseId: 'CASE-2',
    description: 'Moderate CVSS Auth Bypass on Prod Gateway (Active KEV, High EPSS)',
    vuln: {
      title: 'Authentication Bypass via Header Injection',
      cvss: { baseScore: 6.5 },
      threat: { epss: 0.885, inKev: true },
      affectedUsersCount: 25000,
      internetFacing: true,
    },
    asset: {
      name: 'API-Gateway-Prod-01',
      criticality: 5,
      dataSensitivity: 5,
      environment: 'production',
      internetFacing: true,
    }
  },
  {
    caseId: 'CASE-3',
    description: 'Identical CVE-2023-34362 on Internet-facing Prod vs Internal Test Asset',
    vuln: {
      title: 'MOVEit Transfer SQLi / RCE',
      cvss: { baseScore: 8.8 },
      threat: { epss: 0.942, inKev: true },
      affectedUsersCount: 15000,
      internetFacing: true,
    },
    asset: {
      name: 'Customer-File-Transfer-Prod',
      criticality: 5,
      dataSensitivity: 5,
      environment: 'production',
      internetFacing: true,
    }
  },
  {
    caseId: 'CASE-4',
    description: 'Identical CVE-2023-34362 on Internal Isolated Test Asset',
    vuln: {
      title: 'MOVEit Transfer SQLi / RCE (Isolated Replica)',
      cvss: { baseScore: 8.8 },
      threat: { epss: 0.942, inKev: true },
      affectedUsersCount: 0,
      internetFacing: false,
    },
    asset: {
      name: 'QA-Isolated-Test-Node',
      criticality: 2,
      dataSensitivity: 1,
      environment: 'test',
      internetFacing: false,
    }
  },
  {
    caseId: 'CASE-5',
    description: 'Medium CVSS Path Traversal with Active KEV Exploitation (Override Trigger)',
    vuln: {
      title: 'Directory Traversal Arbitrary File Read',
      cvss: { baseScore: 5.3 },
      threat: { epss: 0.720, inKev: true },
      affectedUsersCount: 200,
      internetFacing: true,
    },
    asset: {
      name: 'Public-Web-Frontend',
      criticality: 3,
      dataSensitivity: 3,
      environment: 'production',
      internetFacing: true,
    }
  },
  {
    caseId: 'CASE-6',
    description: 'High CVSS Local Privilege Escalation without exploitability on Internal Database',
    vuln: {
      title: 'Kernel Privilege Escalation via race condition',
      cvss: { baseScore: 7.8 },
      threat: { epss: 0.032, inKev: false },
      affectedUsersCount: 50,
      internetFacing: false,
    },
    asset: {
      name: 'Internal-Postgres-Replica',
      criticality: 4,
      dataSensitivity: 4,
      environment: 'production',
      internetFacing: false,
    }
  },
  {
    caseId: 'CASE-7',
    description: 'Low CVSS Denial of Service on Public Production Edge',
    vuln: {
      title: 'Slowloris HTTP Request Flood DoS',
      cvss: { baseScore: 3.5 },
      threat: { epss: 0.045, inKev: false },
      affectedUsersCount: 5000,
      internetFacing: true,
    },
    asset: {
      name: 'Edge-Reverse-Proxy',
      criticality: 3,
      dataSensitivity: 2,
      environment: 'production',
      internetFacing: true,
    }
  }
];

const results = testCases.map(tc => {
  const evaluated = calculateRisk(tc.vuln, tc.asset);
  return {
    caseId: tc.caseId,
    description: tc.description,
    cvssBase: evaluated.cvssScore,
    cvssOnlyPriority: evaluated.cvssPriority,
    epss: evaluated.epss,
    inKev: evaluated.inKev,
    assetCriticality: evaluated.assetCriticality,
    environment: evaluated.environment,
    internetFacing: evaluated.isInternetFacing,
    vulnTrackScore: evaluated.score,
    vulnTrackPriority: evaluated.priority,
    overrides: evaluated.overrides,
    breakdown: evaluated.breakdown,
    rankingDifference: `${evaluated.cvssPriority} -> ${evaluated.priority}`,
    analysis: evaluated.cvssPriority === evaluated.priority
      ? 'Maintained'
      : (evaluated.cvssPriority < evaluated.priority ? 'Deprioritized (Avoids alert fatigue)' : 'Elevated (Threat/Asset risk)')
  };
});

// Write outputs to evidence
const outJson = path.resolve(__dirname, '../evidence/risk_comparison_results.json');
const outTxt = path.resolve(__dirname, '../evidence/risk_comparison_table.txt');

fs.writeFileSync(outJson, JSON.stringify(results, null, 2));

let tableStr = '='.repeat(105) + '\n';
tableStr += 'VULNTRACK MULTI-FACTOR RISK ENGINE VS CVSS-ONLY COMPARISON\n';
tableStr += '='.repeat(105) + '\n';
tableStr += [
  'Case ID'.padEnd(9),
  'CVSS'.padEnd(6),
  'EPSS'.padEnd(7),
  'KEV'.padEnd(6),
  'AssetCrit'.padEnd(11),
  'Exposure'.padEnd(14),
  'CVSS-Tier'.padEnd(11),
  'Score'.padEnd(7),
  'VulnTrack'.padEnd(11),
  'Shift / Effect'.padEnd(20)
].join(' ') + '\n';
tableStr += '-'.repeat(105) + '\n';

results.forEach(r => {
  tableStr += [
    r.caseId.padEnd(9),
    r.cvssBase.toFixed(1).padEnd(6),
    r.epss.toFixed(3).padEnd(7),
    (r.inKev ? 'YES' : 'NO').padEnd(6),
    (r.assetCriticality + '/5').padEnd(11),
    (r.internetFacing ? 'Public Prod' : (r.environment === 'test' ? 'Test Sandbox' : 'Internal')).padEnd(14),
    r.cvssOnlyPriority.padEnd(11),
    r.vulnTrackScore.toFixed(1).padEnd(7),
    r.vulnTrackPriority.padEnd(11),
    (r.cvssOnlyPriority !== r.vulnTrackPriority ? `${r.cvssOnlyPriority} => ${r.vulnTrackPriority} (${r.analysis.split(' ')[0]})` : 'Unchanged').padEnd(20)
  ].join(' ') + '\n';
});
tableStr += '='.repeat(105) + '\n';

fs.writeFileSync(outTxt, tableStr);
console.log(tableStr);
console.log(`Results saved to ${outJson} and ${outTxt}`);
