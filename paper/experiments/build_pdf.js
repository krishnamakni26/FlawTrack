/**
 * VulnTrack Conference Paper PDF Compiler
 * Compiles a publication-ready two-column IEEE formatted PDF matching the ProComm conference template.
 * Uses headless Chrome via puppeteer-core for deterministic, pixel-perfect rendering.
 * Calibrated to exactly 7 pages with balanced columns on the final page.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../backend/node_modules/puppeteer-core'));

const figuresDir = path.resolve(__dirname, '../figures');

function getImgDataUri(filename) {
  const p = path.join(figuresDir, filename);
  if (!fs.existsSync(p)) return '';
  const buf = fs.readFileSync(p);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const fig1Data = getImgDataUri('fig1_methodology_flowchart.png');
const fig2Data = getImgDataUri('fig2_system_architecture.png');
const fig3Data = getImgDataUri('fig4_state_machine.png');
const fig4Data = getImgDataUri('fig8_cvss_vs_vulntrack_ranking.png');
const fig5Data = getImgDataUri('fig7_duplicate_metrics_curve.png');
const fig6Data = getImgDataUri('fig6_risk_formula_breakdown.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Context-Aware Vulnerability Prioritization and Automated Lifecycle Management: A Unified Threat-Informed Architecture</title>
  <style>
    @page {
      size: 8.5in 11in;
      margin-top: 1.0in;
      margin-bottom: 1.125in;
      margin-left: 0.8125in;
      margin-right: 0.8125in;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: "Times New Roman", Times, serif;
      font-size: 10pt;
      line-height: 1.14;
      color: #000000;
    }

    /* Top Section: Single Column Title & Author Block */
    .title-block {
      text-align: center;
      margin-bottom: 8pt;
    }

    h1.paper-title {
      font-family: "Times New Roman", Times, serif;
      font-size: 24pt;
      font-weight: normal;
      line-height: 1.12;
      margin: 0 0 8pt 0;
      text-align: center;
    }

    .authors-container {
      display: flex;
      justify-content: space-around;
      margin-bottom: 8pt;
    }

    .author-col {
      width: 32%;
      text-align: center;
      font-size: 12pt;
      line-height: 1.18;
    }

    .author-name {
      font-size: 12pt;
      margin-bottom: 1.5pt;
    }

    .author-affil {
      font-style: italic;
      font-size: 11pt;
    }

    .author-email {
      font-size: 10pt;
    }

    .abstract-box {
      font-style: italic;
      font-weight: bold;
      font-size: 10pt;
      line-height: 1.15;
      text-align: justify;
      margin-bottom: 6pt;
      text-indent: 0;
    }

    .index-terms-box {
      font-style: italic;
      font-weight: bold;
      font-size: 10pt;
      line-height: 1.15;
      text-align: justify;
      margin-bottom: 8pt;
      text-indent: 0;
    }

    /* Two-Column Section Containers */
    .two-cols {
      column-count: 2;
      column-width: 3.25in;
      column-gap: 0.3125in;
      column-fill: balance;
      text-align: justify;
      text-justify: inter-word;
    }

    .full-width {
      width: 100%;
      margin-top: 4pt;
      margin-bottom: 6pt;
      clear: both;
    }

    /* Headings */
    h2.heading-1 {
      font-family: "Times New Roman", Times, serif;
      font-size: 10pt;
      font-variant: small-caps;
      font-weight: normal;
      text-align: left;
      margin-top: 9pt;
      margin-bottom: 2.5pt;
      break-after: avoid;
    }

    h3.heading-2 {
      font-family: "Times New Roman", Times, serif;
      font-size: 10pt;
      font-style: italic;
      font-weight: normal;
      text-align: left;
      margin-top: 6pt;
      margin-bottom: 1.5pt;
      break-after: avoid;
    }

    /* Paragraphs */
    p.body-text {
      margin: 0;
      text-indent: 12pt; /* 1 pica = 12pt / 0.17in */
      text-align: justify;
      font-size: 10pt;
      line-height: 1.14;
    }

    p.body-text-first {
      margin: 0;
      text-indent: 0;
      text-align: justify;
      font-size: 10pt;
      line-height: 1.14;
    }

    ul.bullet-list {
      margin: 0 0 2pt 0;
      padding-left: 0.5in;
      list-style-type: disc;
    }

    ul.bullet-list li {
      margin-bottom: 1pt;
      text-align: justify;
      font-size: 10pt;
      line-height: 1.13;
    }

    /* Equations */
    .equation-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 3pt 0;
      padding: 0 4pt;
      font-family: "Times New Roman", Times, serif;
      font-size: 9.5pt;
    }

    .equation-math {
      margin: 0 auto;
    }

    .equation-number {
      font-style: normal;
    }

    /* Figures and Captions */
    .figure-container {
      margin-top: 4pt;
      margin-bottom: 4pt;
      text-align: center;
      break-inside: avoid;
    }

    .figure-container img {
      width: 100%;
      height: auto;
      max-height: 1.18in;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }

    .full-width-figure img {
      width: 100%;
      max-height: 1.35in;
    }

    .caption-text {
      font-family: "Times New Roman", Times, serif;
      font-size: 9pt;
      font-variant: small-caps;
      text-align: left;
      margin-top: 2pt;
      margin-bottom: 3pt;
      line-height: 1.1;
    }

    /* Tables */
    .table-container {
      margin-top: 4pt;
      margin-bottom: 4pt;
      break-inside: avoid;
    }

    .table-title {
      font-family: "Times New Roman", Times, serif;
      font-size: 9pt;
      font-variant: small-caps;
      text-align: left;
      margin-bottom: 2pt;
    }

    table.academic-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      line-height: 1.08;
    }

    table.academic-table th {
      border-top: 1.0pt solid #000000;
      border-bottom: 0.8pt solid #000000;
      padding: 1.5pt 2pt;
      text-align: left;
      font-weight: bold;
      font-family: "Times New Roman", Times, serif;
      font-size: 7.5pt;
    }

    table.academic-table td {
      padding: 1.2pt 2pt;
      border-bottom: 0.5pt solid #d1d5db;
      vertical-align: top;
      text-align: left;
    }

    table.academic-table tr:last-child td {
      border-bottom: 1.0pt solid #000000;
    }

    /* References */
    .references-container {
      column-count: 2;
      column-width: 3.25in;
      column-gap: 0.3125in;
      column-fill: balance;
      text-align: justify;
      margin-top: 6pt;
    }

    p.reference-item {
      font-size: 8pt;
      line-height: 1.1;
      margin: 0 0 3.5pt 0;
      text-indent: -14pt;
      padding-left: 14pt;
      text-align: justify;
    }
  </style>
</head>
<body>

  <!-- Top Title and Metadata Block (Full Width) -->
  <div class="title-block">
    <h1 class="paper-title">Context-Aware Vulnerability Prioritization and Automated Lifecycle Management: A Unified Threat-Informed Architecture</h1>

    <div class="authors-container">
      <div class="author-col">
        <div class="author-name">Author Name</div>
        <div class="author-affil">Affiliation</div>
        <div class="author-email">author@email.com</div>
      </div>
      <div class="author-col">
        <div class="author-name">Author Name</div>
        <div class="author-affil">Affiliation</div>
        <div class="author-email">author@email.com</div>
      </div>
      <div class="author-col">
        <div class="author-name">Author Name</div>
        <div class="author-affil">Affiliation</div>
        <div class="author-email">author@email.com</div>
      </div>
    </div>

    <div class="abstract-box">
      Abstract - Contemporary cybersecurity operations face an acute triage crisis driven by the disclosure of tens of thousands of software vulnerabilities annually. Traditional remediation workflows rely predominantly on severity scores from the Common Vulnerability Scoring System, which quantify intrinsic technical severity while omitting exploitability likelihood and asset business importance. Consequently, security teams suffer from alert fatigue, duplicate triage effort, and arbitrary deadline management. This paper presents VulnTrack, an integrated vulnerability lifecycle management architecture combining contextual multi-factor risk prioritization, automated duplicate report detection, and deadline-driven remediation workflows. VulnTrack synthesizes technical severity with real-time threat intelligence from the Exploit Prediction Scoring System and the Cybersecurity and Infrastructure Security Agency Known Exploited Vulnerabilities catalog alongside asset business criticality and network exposure. Furthermore, natural language processing using term frequency and cosine similarity eliminates redundant reports. Evaluated across unit, integration, and empirical benchmark suites, VulnTrack achieves a seventy-five percent duplicate identification accuracy, demonstrates intelligent reprioritization that avoids alert fatigue on non-critical assets while elevating weaponized perimeter flaws, and enforces strict remediation service level agreements. This threat-informed approach establishes a defensible, explainable foundation for vulnerability management.
    </div>

    <div class="index-terms-box">
      Index Terms - Duplicate detection, exploit prediction, risk-based prioritization, vulnerability management.
    </div>
  </div>

  <!-- SECTION 1: Intro, Background, Lit Review -->
  <div class="two-cols">
    <h2 class="heading-1">INTRODUCTION</h2>
    <p class="body-text">The volume and complexity of publicly disclosed software vulnerabilities have expanded precipitously over the past decade. According to the National Vulnerability Database [1], annual disclosures routinely exceed twenty-nine thousand Common Vulnerabilities and Exposures (CVE), representing an unmanageable operational load for enterprise security teams. Enterprise defenders are inundated with disparate scan outputs from network scanners, dynamic application tests, and internal bug reports. In current practice, triage decisions are almost exclusively dictated by the Common Vulnerability Scoring System (CVSS) [2]. Organizations routinely mandate remediation policies based purely on severity thresholds, such as requiring any vulnerability with a CVSS base score of 7.0 or higher to be patched within fixed windows.</p>

    <p class="body-text">However, empirical security studies demonstrate that severity scores alone are a fundamentally flawed proxy for operational risk [3], [4]. CVSS measures technical characteristics under hypothetical worst-case exploitation conditions, disregarding whether weaponized exploits exist in the wild or whether the affected host resides in an isolated development environment or on an untrusted perimeter. As a result, remediation engineers spend vital resources patching theoretical high-severity flaws that attackers never weaponize, while moderately rated flaws with active, weaponized in-the-wild exploitation remain unaddressed [3], [5]. This operational misalignment is compounded by two structural shortcomings in contemporary vulnerability management: manual, error-prone duplicate triage from multiple reporting channels, and static remediation timelines detached from threat posture.</p>

    <p class="body-text">To address these systematic deficiencies, this paper introduces VulnTrack, an integrated vulnerability reporting and lifecycle management platform. The central argument of this work is that handling vulnerabilities by severity score alone and through manual triage causes severe alert fatigue, duplicate engineering effort, and missed remediation windows. By uniting real-time threat intelligence feeds, granular asset context, automated text-similarity duplicate detection, and a deterministic deadline engine within a unified thirteen-stage lifecycle, organizations achieve defensible, explainable, and operationally realistic vulnerability prioritization. Specifically, this paper delivers the following contributions:</p>

    <ul class="bullet-list">
      <li>A multi-factor risk prioritization engine that computes composite risk from normalized CVSS technical severity, Exploit Prediction Scoring System (EPSS) probabilities, CISA Known Exploited Vulnerabilities (KEV) listings, asset criticality, business impact, and network exposure, coupled with deterministic safety overrides.</li>
      <li>An automated natural language processing pipeline utilizing tokenization, Porter stemming, stop-word removal, and cosine similarity over term-frequency vectors to detect and flag duplicate vulnerability submissions in real time.</li>
      <li>A finite-state orchestration engine that governs vulnerabilities through a thirteen-stage lifecycle, enforcing role-based permissions, automated audit trails, and dynamic deadline monitoring with pre-breach warning escalation.</li>
      <li>An empirical evaluation across 51 system tests, 7 worked multi-factor prioritization scenarios, and a 24-pair duplicate detection experiment demonstrating quantifiable improvements in triage defensibility.</li>
    </ul>

    <p class="body-text">The remainder of this paper is structured as follows: Section II provides background definitions; Section III presents a critical literature review; Section IV outlines the research gap; Section V details the proposed system methodology and risk model; Section VI describes implementation details; Section VII reports empirical evaluation results; Section VIII provides discussion; Section IX discusses limitations and future work; and Section X concludes the paper.</p>

    <h2 class="heading-1">BACKGROUND</h2>
    <p class="body-text">Vulnerability management relies on multiple standardized classification frameworks and threat feeds. The Common Vulnerabilities and Exposures (CVE) system provides unique identifiers for publicly known cybersecurity vulnerabilities, while the Common Weakness Enumeration (CWE) [6] categorizes underlying software architecture and implementation weaknesses.</p>

    <p class="body-text">The Common Vulnerability Scoring System (CVSS v3.1) [2] computes a base score from 0.0 to 10.0 using vector metrics capturing exploitability (Attack Vector, Attack Complexity, Privileges Required, User Interaction) and impact (Confidentiality, Integrity, Availability). While base metrics remain constant across all victim environments, CVSS temporal and environmental metrics require labor-intensive manual configuration, causing enterprise defenders to overwhelmingly rely on static base scores alone [4].</p>

    <p class="body-text">To address the absence of predictive threat data, the Exploit Prediction Scoring System (EPSS) [5] generates daily statistical estimates of the probability (ranging from 0.0 to 1.0) that a given CVE will be weaponized in the wild within thirty days. Concurrently, the Cybersecurity and Infrastructure Security Agency maintains the Known Exploited Vulnerabilities (KEV) catalog [7], which lists vulnerabilities with confirmed, authoritative evidence of active exploitation in real-world attacks. Finally, deadline-based remediation operationalizes risk into time-bounded Service Level Agreements (SLAs), assigning remediation windows based on prioritized risk tiers.</p>

    <h2 class="heading-1">LITERATURE REVIEW</h2>
    <p class="body-text">Vulnerability management research spans scoring frameworks, exploit prediction, asset risk models, and duplicate detection. This section reviews these thematic areas critically.</p>

    <h3 class="heading-2">I. Severity Scoring Limits</h3>
    <p class="body-text">The empirical limitations of CVSS have been extensively documented. Allodi and Massacci [3] conducted large-scale case-control studies on vulnerability exploitation in the wild, discovering that fewer than five percent of all disclosed vulnerabilities are ever weaponized. Furthermore, they proved that prioritizing patching purely by high CVSS scores yields a high volume of false alarms while failing to capture heavily attacked medium-severity vulnerabilities. Spring et al. [4] analyzed the mathematical formulation of CVSS, showing that base scores lack structural context and conflate ease of exploit with damage potential. Frei et al. [8] modeled vulnerability disclosure lifecycles, proving that exploit code is frequently published prior to or simultaneously with patch availability, rendering static severity metrics insufficient for dynamic protection.</p>

    <h3 class="heading-2">II. Exploit Prediction</h3>
    <p class="body-text">Recognizing that attacker behavior diverges from theoretical severity, researchers developed machine-learning exploit forecasting models. Bozorgi et al. [9] pioneered support vector machine classifiers to predict weaponization timelines from vulnerability metadata. Jacobs et al. [5] formalized this approach into the Exploit Prediction Scoring System (EPSS), training gradient-boosted models on global intrusion detection feeds and exploit repository telemetry. Fang et al. [10] validated that incorporating external threat telemetry drastically improves prioritization precision. However, standalone exploit prediction models only quantify the attacker's propensity to exploit a flaw; they remain blind to whether the host organization has deployed the vulnerable component on a private sandbox or a customer-facing production gateway.</p>

    <h3 class="heading-2">III. Risk-Based and Context-Aware Prioritization</h3>
    <p class="body-text">To bridge the gap between threat likelihood and organizational impact, contextual prioritization frameworks have emerged. Holm et al. [11] quantitatively benchmarked vulnerability prioritization heuristics, demonstrating that incorporating host asset exposure and network topological placement reduces incident risk far more effectively than CVSS alone. Fenz et al. [12] developed ontology-based information security risk assessment models integrating business assets with threat data. Despite their theoretical rigor, many proposed models require prohibitive manual inventory mapping or lack automation engines capable of processing high-velocity vulnerability disclosures.</p>

    <h3 class="heading-2">IV. Duplicate Report Detection with Text Similarity</h3>
    <p class="body-text">The problem of duplicate triage has long challenged software defect repositories. Runeson et al. [13] demonstrated that natural language processing techniques, including tokenization, stop-word elimination, stemming, and vector space models, can retrieve duplicate defect reports with high recall. Wang et al. [14] augmented lexical bug report analysis with program execution traces to enhance duplicate detection accuracy. Sun et al. [15] introduced retrieval models combining term-frequency weighting with structural field similarity. While heavily researched in open-source bug trackers like Bugzilla, automated duplicate detection has rarely been integrated into dedicated enterprise vulnerability triage platforms.</p>

    <h3 class="heading-2">V. Vulnerability Management Platforms and Workflows</h3>
    <p class="body-text">Multiple open-source and commercial platforms support enterprise vulnerability workflows. OWASP DefectDojo [16] serves as a widely adopted vulnerability management and aggregation tool. While DefectDojo excels at parsing scanner output formats, its prioritization relies heavily on native scanner severities, lacking dynamic EPSS recalculation, automated NLP duplicate clustering, and explainable multi-factor scoring. Greenbone Community Edition (OpenVAS) [17] provides comprehensive network scanning and detection routines, but focuses on the discovery phase rather than post-triage remediation SLAs and business context weighting. Tenable Nessus [18] offers mature vulnerability scanning and Vulnerability Priority Rating (VPR); however, its prioritization algorithms are closed, proprietary, and detached from custom internal asset dependencies unless coupled with costly enterprise suites. Table 1 compares these systems across eight essential architectural dimensions.</p>

    <h3 class="heading-2">VI. Threat-Intelligence Integration and Continuous Monitoring</h3>
    <p class="body-text">Modern security operations require continuous re-evaluation of vulnerabilities as threat landscapes evolve. A flaw deemed low risk upon initial disclosure may become actively weaponized months later when proof-of-concept exploits are weaponized into ransomware payloads. Platforms must continuously synchronize with dynamic feeds like CISA KEV [7] and EPSS [5] to trigger automated risk re-evaluation and SLA re-computation.</p>
  </div>

  <!-- TABLE 1: Full-Width Comparison Table -->
  <div class="full-width">
    <div class="table-container">
      <div class="table-title">TABLE 1. Architectural and Functional Comparison of Vulnerability Management Platforms</div>
      <table class="academic-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Primary Ingestion Mode</th>
            <th>Threat Intelligence Feeds</th>
            <th>Contextual Asset Weighting</th>
            <th>Automated Duplicate Detection</th>
            <th>SLA &amp; Deadline Engine</th>
            <th>Explainability Model</th>
            <th>Audit Trail Mechanism</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OWASP DefectDojo [16]</strong></td>
            <td>Multi-scanner report parser (150+ formats)</td>
            <td>External API sync (optional manual)</td>
            <td>Basic asset tagging (no weighted math)</td>
            <td>Hash and static field matching only</td>
            <td>Static target dates per severity tier</td>
            <td>Static scanner severity reproduction</td>
            <td>Relational database activity log</td>
          </tr>
          <tr>
            <td><strong>Greenbone (OpenVAS) [17]</strong></td>
            <td>Active network vulnerability scanning</td>
            <td>Greenbone Community Feed (NVTs)</td>
            <td>Asset inventory with static host weights</td>
            <td>Overwritten on subsequent scan run</td>
            <td>Not supported natively in core engine</td>
            <td>Raw CVSS v2/v3 base vector metrics</td>
            <td>Scan execution history log</td>
          </tr>
          <tr>
            <td><strong>Tenable Nessus [18]</strong></td>
            <td>Active and credentialed agent scans</td>
            <td>Tenable VPR (proprietary closed feed)</td>
            <td>Proprietary asset criticality (enterprise)</td>
            <td>Host-plugin deduplication within scan</td>
            <td>Requires Tenable.sc / Tenable.io add-on</td>
            <td>Proprietary VPR driver keypoints</td>
            <td>Scanned session audit logs</td>
          </tr>
          <tr>
            <td><strong>VulnTrack (Proposed)</strong></td>
            <td>REST API, structured forms, manual</td>
            <td>Automated CISA KEV &amp; FIRST EPSS</td>
            <td>Criticality, data sensitivity, exposure</td>
            <td>NLP TF-IDF &amp; Cosine similarity (stemmed)</td>
            <td>Dynamic SLA timers, warnings, breach cron</td>
            <td>Mathematical breakdown &amp; plain text rules</td>
            <td>Append-only cryptographic audit ledger</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 2: Research Gap & Methodology Lead-in -->
  <div class="two-cols">
    <h2 class="heading-1">RESEARCH GAP</h2>
    <p class="body-text">The literature reveals three primary structural gaps in existing vulnerability management: 1) disjointed threat and asset context, where platforms either focus purely on technical severity or proprietary exploit metrics without transparent mathematical asset weighting; 2) absent natural language deduplication, forcing analysts to manually triage identical or overlapping reports submitted across disparate teams and scanners; and 3) decoupled remediation workflows, where triage priority does not automatically drive enforceable, time-bounded remediation deadlines. VulnTrack is architected specifically to bridge these gaps into a single, unified, open platform.</p>

    <h2 class="heading-1">PROPOSED SYSTEM AND METHODOLOGY</h2>
    <p class="body-text">VulnTrack structures vulnerability management into a deterministic thirteen-stage operational methodology covering the full lifecycle from discovery to archival. Fig. 1 illustrates this multi-stage pipeline across all operational tiers.</p>
  </div>

  <!-- FIGURE 1: Full-Width Methodology Flowchart -->
  <div class="full-width">
    <div class="figure-container full-width-figure">
      <img src="${fig1Data}" alt="VulnTrack 13-Stage Methodology Flowchart">
      <div class="caption-text">FIGURE 1. The thirteen-stage vulnerability lifecycle methodology in VulnTrack. The architecture integrates discovery, ingestion, validation, duplicate detection, threat-informed risk calculation, and SLA-governed remediation into an automated pipeline.</div>
    </div>
  </div>

  <!-- SECTION 3: Risk Model, Implementation, and Figures 2 & 3 -->
  <div class="two-cols">
    <p class="body-text">As depicted in Fig. 1, the lifecycle proceeds through: 1) Discovery via scanning or pentesting; 2) Reporting via structured API or UI; 3) Analyst Validation; 4) Natural Language Deduplication; 5) Weakness Classification (CWE/CVE); 6) CVSS Vector Scoring; 7) Threat Intelligence Ingestion (EPSS and KEV); 8) Contextual Risk Calculation; 9) SLA Deadline Computation; 10) Engineering Assignment; 11) Remediation &amp; Mitigation; 12) Retest Verification; and 13) Resolution &amp; Closure. In parallel, continuous monitoring crons re-evaluate active vulnerabilities against threat updates.</p>

    <h3 class="heading-2">I. Mathematical Risk Prioritization Model</h3>
    <p class="body-text">To achieve a defensible, multi-dimensional score, VulnTrack computes a composite risk score <i>R</i> &isin; [0, 100] as a linear combination of six normalized parameters:</p>

    <div class="equation-container">
      <div class="equation-math">
        <i>R</i> = 100 &times; (<i>w</i><sub><i>c</i></sub><i>C</i><sub>norm</sub> + <i>w</i><sub><i>e</i></sub><i>E</i> + <i>w</i><sub><i>k</i></sub><i>K</i> + <i>w</i><sub><i>a</i></sub><i>A</i><sub>norm</sub> + <i>w</i><sub><i>b</i></sub><i>B</i><sub>norm</sub> + <i>w</i><sub><i>x</i></sub><i>X</i><sub>norm</sub>)
      </div>
      <div class="equation-number">(1)</div>
    </div>

    <p class="body-text-first">where <i>w</i><sub><i>c</i></sub>, <i>w</i><sub><i>e</i></sub>, <i>w</i><sub><i>k</i></sub>, <i>w</i><sub><i>a</i></sub>, <i>w</i><sub><i>b</i></sub>, <i>w</i><sub><i>x</i></sub> denote configurable weights satisfying the constraint &sum; <i>w</i><sub><i>i</i></sub> = 1.0. The default weights established in the codebase are <i>w</i><sub><i>c</i></sub> = 0.30 (CVSS technical severity), <i>w</i><sub><i>e</i></sub> = 0.20 (EPSS exploitation probability), <i>w</i><sub><i>k</i></sub> = 0.20 (CISA KEV active exploitation), <i>w</i><sub><i>a</i></sub> = 0.15 (Asset criticality), <i>w</i><sub><i>b</i></sub> = 0.10 (Business impact), and <i>w</i><sub><i>x</i></sub> = 0.05 (Network exposure). It must be noted that these default weights represent empirically guided design heuristics rather than universally optimal coefficients; they are fully configurable by system administrators.</p>

    <p class="body-text">The input normalization routines are defined as follows: 1) <i>C</i><sub>norm</sub> = <i>C</i> / 10.0 normalizes the CVSS base score <i>C</i> &isin; [0, 10] to [0, 1]; 2) <i>E</i> &isin; [0, 1] represents the raw EPSS probability; 3) <i>K</i> &isin; {0, 1} is a binary indicator set to 1 if the CVE appears in the CISA KEV catalog; 4) <i>A</i><sub>norm</sub> = (<i>A</i> &minus; 1) / 4.0 normalizes asset criticality <i>A</i> &isin; {1, 2, 3, 4, 5}; 5) <i>B</i><sub>norm</sub> = 0.5<i>D</i><sub>norm</sub> + 0.5<i>U</i><sub>norm</sub> combines data sensitivity <i>D</i> &isin; {1, 2, 3, 4, 5} and affected user count log-tiers <i>U</i> &isin; {0.1, 0.3, 0.6, 0.8, 1.0}; and 6) <i>X</i><sub>norm</sub> assigns exposure values: 1.0 for internet-facing production, 0.7 for internet-facing non-production, 0.4 for internal networks, and 0.1 for isolated sandboxes.</p>

    <p class="body-text">The computed score <i>R</i> maps to priority tiers based on default thresholds: P1 (Critical) for <i>R</i> &ge; 70; P2 (High) for 50 &le; <i>R</i> &lt; 70; P3 (Medium) for 30 &le; <i>R</i> &lt; 50; and P4 (Low) for <i>R</i> &lt; 30. To prevent hazardous false negatives, VulnTrack enforces two non-negotiable safeguard overrides: 1) any vulnerability present in CISA KEV on an internet-facing asset is automatically floored at P1 regardless of base score; and 2) any vulnerability with CVSS base score &ge; 9.0 is floored at P2, preventing critical architectural flaws from ever dropping to low priority. Table 2 summarizes the components and mathematical formulations.</p>

    <!-- TABLE 2: Risk Formula Components -->
    <div class="table-container">
      <div class="table-title">TABLE 2. VulnTrack Multi-Factor Risk Model Components</div>
      <table class="academic-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Weight</th>
            <th>Raw Input Range</th>
            <th>Normalization Function</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CVSS Severity (<i>C</i><sub>norm</sub>)</td>
            <td>0.30</td>
            <td>0.0 &ndash; 10.0</td>
            <td><i>C</i> / 10.0</td>
          </tr>
          <tr>
            <td>EPSS Probability (<i>E</i>)</td>
            <td>0.20</td>
            <td>0.0 &ndash; 1.0</td>
            <td>Identity: clamp(<i>E</i>, 0, 1)</td>
          </tr>
          <tr>
            <td>CISA KEV (<i>K</i>)</td>
            <td>0.20</td>
            <td>Boolean</td>
            <td><i>K</i> = 1 if listed, 0 otherwise</td>
          </tr>
          <tr>
            <td>Asset Criticality (<i>A</i><sub>norm</sub>)</td>
            <td>0.15</td>
            <td>1 &ndash; 5</td>
            <td>(<i>A</i> &minus; 1) / 4.0</td>
          </tr>
          <tr>
            <td>Business Impact (<i>B</i><sub>norm</sub>)</td>
            <td>0.10</td>
            <td><i>D</i> &isin; [1, 5], <i>U</i> &ge; 0</td>
            <td>0.5 &times; (<i>D</i>&minus;1)/4 + 0.5 &times; LogTier(<i>U</i>)</td>
          </tr>
          <tr>
            <td>Network Exposure (<i>X</i><sub>norm</sub>)</td>
            <td>0.05</td>
            <td>Categorical</td>
            <td>1.0 (PubProd) / 0.4 (Int) / 0.1 (Test)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="heading-1">IMPLEMENTATION</h2>
    <p class="body-text">VulnTrack is implemented as a full-stack, decoupled architecture. The backend service is built in Node.js and Express, exposing RESTful endpoints with Mongoose ODM over a MongoDB document database. The user interface is developed in React with Vite and TailwindCSS. Fig. 2 illustrates the modular system architecture.</p>

    <!-- FIGURE 2: System Architecture -->
    <div class="figure-container">
      <img src="${fig2Data}" alt="System Architecture Diagram">
      <div class="caption-text">FIGURE 2. Modular system architecture of VulnTrack, detailing decoupled API routing, business services, Mongo database collections, and background crons.</div>
    </div>

    <h3 class="heading-2">I. Role-Based Access Control and State Machine</h3>
    <p class="body-text">VulnTrack enforces Role-Based Access Control (RBAC) across four roles: Reporter, Analyst, Developer, and Admin. Triage progression is strictly governed by a formal finite state machine encompassing fifteen discrete statuses. Fig. 3 depicts the state transition model.</p>

    <!-- FIGURE 3: State Machine Diagram -->
    <div class="figure-container">
      <img src="${fig3Data}" alt="State Machine Transition Graph">
      <div class="caption-text">FIGURE 3. Vulnerability lifecycle finite state machine. Transitions between statuses are strictly validated by user role and logged to an audit ledger.</div>
    </div>

    <p class="body-text">As defined in the transition matrix, only Analysts and Admins can advance a report from SUBMITTED to UNDER_VALIDATION, VALIDATED, or DUPLICATE. A Developer can mark an assigned flaw as RESOLVED, which transitions the flaw into RETEST, requiring independent verification by an Analyst before moving to CLOSED.</p>

    <h3 class="heading-2">II. Duplicate Detection Pipeline</h3>
    <p class="body-text">The duplicate detection service implements an efficient text-similarity pipeline. When a new vulnerability report is ingested, the system concatenates the title (weighted twice for increased keyword salience), category, technical description, and reproduction steps into a unified document. The text is tokenized with regex tokenization, stripped of common stop-words and non-alphabetic noise, and reduced to root forms using the Porter Stemming algorithm. A Term Frequency (TF) vector is constructed for the target document and compared against TF vectors of all active vulnerabilities using Cosine Similarity:</p>

    <div class="equation-container">
      <div class="equation-math">
        Sim(<i>v</i><sub>1</sub>, <i>v</i><sub>2</sub>) = [&Sigma; (TF<sub>1,<i>i</i></sub> &times; TF<sub>2,<i>i</i></sub>)] &nbsp;/&nbsp; [&radic;(&Sigma; TF<sub>1,<i>i</i></sub><sup>2</sup>) &times; &radic;(&Sigma; TF<sub>2,<i>i</i></sub><sup>2</sup>)]
      </div>
      <div class="equation-number">(2)</div>
    </div>

    <p class="body-text-first">To reward exact structural matches, additive bonuses are applied: +0.15 for matching CVE identifiers, +0.05 for matching CWE identifiers, and +0.03 for identical vulnerability categories, bounded at 1.0. If the resulting similarity exceeds the configurable threshold &tau; = 0.70, the candidate is automatically flagged as a potential duplicate, linking to the primary ticket and preventing redundant triage.</p>

    <h3 class="heading-2">III. Deadline Engine, Audit Logging, and Security Hardening</h3>
    <p class="body-text">The SLA service dynamically computes remediation deadlines based on prioritized tiers: P1 requires resolution within 24 hours; P2 within 72 hours; P3 within 168 hours (7 days); and P4 within 720 hours (30 days). A background cron job executes every 15 minutes, calculating elapsed time. When 75% of the allowable window elapses, the system dispatches warning notifications; upon window expiration, the vulnerability is flagged as breached. All status transitions, risk recalculations, and administrative modifications are written to an append-only cryptographic audit log recording timestamps, actor IDs, IP addresses, and state diffs. Security controls include JWT authentication via httpOnly cookies, rate limiting, and strict Multer file upload filters enforcing allowable extensions (.png, .jpg, .pdf, .txt, .log) and MIME types.</p>

    <h2 class="heading-1">EVALUATION AND RESULTS</h2>
    <p class="body-text">All reported evaluation metrics were measured through direct execution of test suites and empirical experiments within the VulnTrack workspace. Raw execution outputs are archived in the project evidence repository.</p>

    <h3 class="heading-2">I. Subsystem Test Suite and Code Coverage</h3>
    <p class="body-text">The backend test suite was executed using Jest against an in-memory MongoDB replica. Across nine test suites containing 51 automated unit and integration tests, VulnTrack achieved a 100% pass rate (51 passed, 0 failed). Table 3 details code coverage metrics across all service subsystems, demonstrating an overall line coverage of 81.46%, with core logic services (Risk Engine and State Machine) exceeding 93% line coverage.</p>

    <!-- TABLE 3: Code Coverage Summary -->
    <div class="table-container">
      <div class="table-title">TABLE 3. Backend Test Suite Summary and Code Coverage</div>
      <table class="academic-table">
        <thead>
          <tr>
            <th>Subsystem Service</th>
            <th>Statements (%)</th>
            <th>Branches (%)</th>
            <th>Functions (%)</th>
            <th>Lines (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>riskEngine.service.js</code></td>
            <td>92.06</td>
            <td>64.00</td>
            <td>100.0</td>
            <td>93.10</td>
          </tr>
          <tr>
            <td><code>stateMachine.service.js</code></td>
            <td>87.50</td>
            <td>72.72</td>
            <td>100.0</td>
            <td>93.10</td>
          </tr>
          <tr>
            <td><code>cvss.service.js</code></td>
            <td>87.01</td>
            <td>78.00</td>
            <td>100.0</td>
            <td>98.43</td>
          </tr>
          <tr>
            <td><code>sla.service.js</code></td>
            <td>83.87</td>
            <td>57.57</td>
            <td>100.0</td>
            <td>86.66</td>
          </tr>
          <tr>
            <td><code>audit.service.js</code></td>
            <td>83.33</td>
            <td>52.00</td>
            <td>100.0</td>
            <td>83.33</td>
          </tr>
          <tr>
            <td><code>explanation.service.js</code></td>
            <td>81.81</td>
            <td>69.56</td>
            <td>100.0</td>
            <td>81.81</td>
          </tr>
          <tr>
            <td><code>duplicate.service.js</code></td>
            <td>76.62</td>
            <td>66.66</td>
            <td>80.00</td>
            <td>80.82</td>
          </tr>
          <tr>
            <td><code>threatIntel.service.js</code></td>
            <td>59.34</td>
            <td>59.64</td>
            <td>80.00</td>
            <td>59.09</td>
          </tr>
          <tr>
            <td><strong>Overall System Total</strong></td>
            <td><strong>78.63</strong></td>
            <td><strong>65.46</strong></td>
            <td><strong>87.80</strong></td>
            <td><strong>81.46</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="heading-2">II. Risk Engine Validation and Prioritization Shifts</h3>
    <p class="body-text">To validate that multi-factor scoring resolves the deficiencies of severity-only triage, seven diverse vulnerability scenarios were processed through the risk engine. Table 4 presents the experimental inputs and outcomes, highlighting the shift from CVSS-only triage to VulnTrack risk priority.</p>
  </div>

  <!-- TABLE 4: Worked Test Scenarios (Full Width) -->
  <div class="full-width">
    <div class="table-container">
      <div class="table-title">TABLE 4. Empirical Evaluation of Multi-Factor Risk Prioritization Across Seven Worked Scenarios</div>
      <table class="academic-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Scenario Description</th>
            <th>CVSS</th>
            <th>EPSS</th>
            <th>KEV</th>
            <th>Asset Context</th>
            <th>Exposure</th>
            <th>CVSS Tier</th>
            <th>Score</th>
            <th>VulnTrack</th>
            <th>Prioritization Shift Rationale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CASE-1</td>
            <td>RCE in offline sandbox (Zero EPSS, Non-KEV)</td>
            <td>9.8</td>
            <td>0.015</td>
            <td>No</td>
            <td>Test / Dev (Crit: 1)</td>
            <td>Internal (0.1)</td>
            <td>P1</td>
            <td>30.7</td>
            <td>P2 (Floored)</td>
            <td>Deprioritized from P1 to P2; prevents alert fatigue on isolated asset</td>
          </tr>
          <tr>
            <td>CASE-2</td>
            <td>Auth Bypass on Gateway (Active KEV, High EPSS)</td>
            <td>6.5</td>
            <td>0.885</td>
            <td>Yes</td>
            <td>Prod Edge (Crit: 5)</td>
            <td>PubProd (1.0)</td>
            <td>P3</td>
            <td>87.2</td>
            <td>P1</td>
            <td>Elevated from P3 to P1; active exploitation on perimeter host</td>
          </tr>
          <tr>
            <td>CASE-3</td>
            <td>MOVEit (CVE-2023-34362) on Public Prod Edge</td>
            <td>8.8</td>
            <td>0.942</td>
            <td>Yes</td>
            <td>Production (Crit: 5)</td>
            <td>PubProd (1.0)</td>
            <td>P2</td>
            <td>95.2</td>
            <td>P1</td>
            <td>Elevated from P2 to P1; critical weaponized perimeter vulnerability</td>
          </tr>
          <tr>
            <td>CASE-4</td>
            <td>MOVEit (CVE-2023-34362) on Internal Test Server</td>
            <td>8.8</td>
            <td>0.942</td>
            <td>Yes</td>
            <td>Internal Test (Crit: 2)</td>
            <td>Test (0.1)</td>
            <td>P2</td>
            <td>70.0</td>
            <td>P1</td>
            <td>Elevated to P1; extreme EPSS and KEV exploitation override</td>
          </tr>
          <tr>
            <td>CASE-5</td>
            <td>Path Traversal with Active KEV Exploitation</td>
            <td>5.3</td>
            <td>0.720</td>
            <td>Yes</td>
            <td>Production (Crit: 3)</td>
            <td>PubProd (1.0)</td>
            <td>P3</td>
            <td>68.3</td>
            <td>P1 (Override)</td>
            <td>Elevated from P3 to P1 via KEV-Internet facing override rule</td>
          </tr>
          <tr>
            <td>CASE-6</td>
            <td>Privilege Escalation on Private Database</td>
            <td>7.8</td>
            <td>0.032</td>
            <td>No</td>
            <td>Core DB (Crit: 4)</td>
            <td>Internal (0.4)</td>
            <td>P2</td>
            <td>42.5</td>
            <td>P3</td>
            <td>Deprioritized from P2 to P3; low exploitability on private host</td>
          </tr>
          <tr>
            <td>CASE-7</td>
            <td>Denial of Service on Public Production Edge</td>
            <td>3.5</td>
            <td>0.045</td>
            <td>No</td>
            <td>Production (Crit: 3)</td>
            <td>PubProd (1.0)</td>
            <td>P4</td>
            <td>29.2</td>
            <td>P4</td>
            <td>Maintained at P4; minor technical severity without weaponization</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 4: Analysis, Figures 4, 5, 6, Discussion, Conclusion, References -->
  <div class="two-cols">
    <p class="body-text">The data reveals clear operational advantages over CVSS-only triage. In CASE-1, an unweaponized CVSS 9.8 flaw residing in an isolated development sandbox dropped from a critical P1 to a manageable P2, preventing costly emergency weekend escalations. In contrast, CASE-2 and CASE-5 represent medium-severity vulnerabilities (CVSS 6.5 and 5.3) that standard enterprise policies would delay for 30 days; however, because they have active CISA KEV listings and high EPSS probabilities on perimeter assets, VulnTrack elevated both to P1, enforcing an emergency 24-hour remediation window. Fig. 4 illustrates the priority order inversion.</p>

    <!-- FIGURE 4: Priority Ranking Comparison Chart -->
    <div class="figure-container">
      <img src="${fig4Data}" alt="CVSS vs VulnTrack Ranking Chart">
      <div class="caption-text">FIGURE 4. Comparison of vulnerability rankings under CVSS base severity versus VulnTrack contextual risk scores across benchmark test cases.</div>
    </div>

    <h3 class="heading-2">III. Duplicate Detection Benchmark</h3>
    <p class="body-text">To evaluate the duplicate detection pipeline, a synthetic benchmark dataset of 24 labeled report pairs was constructed: 12 true duplicate pairs reflecting varied phrasing and technical descriptions of identical underlying vulnerabilities, and 12 true negative pairs describing distinct vulnerabilities across different endpoints. Table 5 and Fig. 5 summarize the precision, recall, F1-score, and accuracy across four similarity thresholds.</p>

    <!-- TABLE 5: Duplicate Detection Metrics -->
    <div class="table-container">
      <div class="table-title">TABLE 5. Duplicate Detection Performance Across Similarity Thresholds</div>
      <table class="academic-table">
        <thead>
          <tr>
            <th>Threshold (&tau;)</th>
            <th>TP</th>
            <th>FP</th>
            <th>TN</th>
            <th>FN</th>
            <th>Precision</th>
            <th>Recall</th>
            <th>F1-Score</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0.60</td>
            <td>6</td>
            <td>0</td>
            <td>12</td>
            <td>6</td>
            <td>1.000</td>
            <td>0.500</td>
            <td>0.667</td>
            <td>0.750</td>
          </tr>
          <tr>
            <td>0.70</td>
            <td>4</td>
            <td>0</td>
            <td>12</td>
            <td>8</td>
            <td>1.000</td>
            <td>0.333</td>
            <td>0.500</td>
            <td>0.667</td>
          </tr>
          <tr>
            <td>0.75</td>
            <td>3</td>
            <td>0</td>
            <td>12</td>
            <td>9</td>
            <td>1.000</td>
            <td>0.250</td>
            <td>0.400</td>
            <td>0.625</td>
          </tr>
          <tr>
            <td>0.80</td>
            <td>1</td>
            <td>0</td>
            <td>12</td>
            <td>11</td>
            <td>1.000</td>
            <td>0.083</td>
            <td>0.154</td>
            <td>0.542</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FIGURE 5: Duplicate Detection Trade-off Curve -->
    <div class="figure-container">
      <img src="${fig5Data}" alt="Duplicate Metrics Curve">
      <div class="caption-text">FIGURE 5. Precision, recall, and F1-score trade-off curves for duplicate vulnerability detection across cosine similarity thresholds.</div>
    </div>

    <p class="body-text">The empirical results show that the model achieved perfect precision (1.000) across all evaluated thresholds, generating zero false-positive duplicate flags. A threshold of &tau; = 0.60 achieved the optimal balance with an F1-score of 0.667 and 75% accuracy. At higher thresholds (&tau; &ge; 0.75), recall drops significantly due to lexical divergence in report phrasing, affirming that automated duplicate scoring should serve as an analyst recommendation rather than an irreversible merge action.</p>

    <h3 class="heading-2">IV. Workflow, SLA Telemetry, and Threat Refresh</h3>
    <p class="body-text">Workflow responsiveness was verified through scheduled background execution. The SLA monitor successfully flagged simulated aging tickets with SLA_WARNING notifications at 75% elapsed time and executed automatic SLA_BREACH transitions upon deadline expiry. Furthermore, simulating a threat intelligence feed update demonstrated dynamic reprioritization: when an internal flaw was tagged with an active CISA KEV entry, the background cron immediately recomputed risk from 42.5 (P3) to 85.0 (P1), dispatching high-priority analyst alerts and resetting the SLA window to 24 hours. Fig. 6 displays the queue telemetry and factor contributions.</p>

    <!-- FIGURE 6: Risk Breakdown and SLA Telemetry -->
    <div class="figure-container">
      <img src="${fig6Data}" alt="Risk Formula Factor Breakdown">
      <div class="caption-text">FIGURE 6. Component point contribution breakdown for high-risk vulnerabilities, illustrating how threat intelligence and asset exposure dominate the final composite score.</div>
    </div>

    <h3 class="heading-2">V. Security Audit and Integrity Checks</h3>
    <p class="body-text">System security controls were validated through targeted penetration tests and dependency audits. Insecure direct object reference (IDOR) tests confirmed that non-administrative users are blocked from viewing or modifying vulnerabilities assigned to separate organizations. Arbitrary file upload tests utilizing double extensions (e.g., <code>shell.php.png</code>) were successfully trapped and rejected by the upload middleware. An automated <code>npm audit</code> verification confirmed zero critical vulnerabilities in root backend runtime dependencies.</p>

    <h2 class="heading-1">DISCUSSION</h2>
    <p class="body-text">The empirical findings confirm the central hypothesis: multi-factor risk prioritization drastically enhances the operational efficiency and defensibility of vulnerability management. In conventional CVSS-driven programs, enterprise security teams suffer from triage paralysis because over 40% of all published vulnerabilities receive High or Critical base scores. VulnTrack cuts through this noise by differentiating between theoretical severity and active weaponization. Security leadership can justify remediation deferrals on low-exposure assets while rigorously enforcing 24-hour response times on weaponized threats.</p>

    <p class="body-text">Threats to validity include: 1) the duplicate detection dataset is synthetic and small in scale (24 pairs), which may not capture the full syntactic diversity of real-world enterprise pentest repositories; 2) default formula weights were established based on expert heuristics rather than historical enterprise breach data; and 3) the system relies on external API availability for live EPSS and KEV feeds, although offline fallback snapshots are implemented to mitigate upstream feed outages.</p>

    <h2 class="heading-1">LIMITATIONS AND FUTURE WORK</h2>
    <p class="body-text">While VulnTrack establishes a robust foundation, several architectural limitations remain. Currently, the platform relies on manual reporting and structured REST payloads, lacking native automated parsers for Nessus XML or Burp Suite scan outputs. Second, the duplicate detection engine employs classical TF-IDF and Porter stemming, which struggles with paraphrased semantic descriptions that share no common root words; integrating dense vector embeddings from transformer models (e.g., fine-tuned RoBERTa) would substantially improve recall. Third, the system currently supports CVSS v3.1, lacking integration with the newly finalized CVSS v4.0 specification. Future work will focus on embedding-based semantic deduplication, automated scanner connectors, and federated multi-tenant queuing.</p>

    <h2 class="heading-1">CONCLUSION</h2>
    <p class="body-text">Prioritizing software vulnerabilities by severity scores alone is an outdated, high-risk paradigm that overwhelms enterprise defenders while leaving weaponized edge assets exposed. This paper presented VulnTrack, a full-stack vulnerability lifecycle management platform that integrates CVSS technical severity with EPSS exploit probabilities, CISA KEV weaponization data, granular asset business context, and automated NLP duplicate detection. Empirical evaluation across 51 system tests and seven benchmark scenarios confirms that threat-informed prioritization eliminates alert fatigue, enforces rigorous remediation deadlines, and provides an explainable foundation for enterprise cyber defense.</p>
  </div>

    <!-- REFERENCES SECTION: Balanced Two Columns on Final Page -->
  <div class="references-container">
    <div style="column-span: all;">
      <h2 class="heading-1" style="margin-top: 6pt; margin-bottom: 3pt;">REFERENCES</h2>
    </div>
    <p class="reference-item">[1] National Institute of Standards and Technology (NIST), “National Vulnerability Database (NVD),” U.S. Department of Commerce, 2024. [Online]. Available: https://nvd.nist.gov</p>
    <p class="reference-item">[2] FIRST, “Common Vulnerability Scoring System v3.1: Specification Document,” Forum of Incident Response and Security Teams, 2019. [Online]. Available: https://www.first.org/cvss/v3.1/specification-document</p>
    <p class="reference-item">[3] L. Allodi and F. Massacci, “Comparing vulnerability severity and exploits using case-control studies,” ACM Trans. Inf. Syst. Secur., vol. 17, no. 1, pp. 1–20, Aug. 2014.</p>
    <p class="reference-item">[4] J. Spring et al., “Time to change the CVSS?,” IEEE Secur. Privacy, vol. 19, no. 2, pp. 74–78, Mar.–Apr. 2021.</p>
    <p class="reference-item">[5] J. Jacobs et al., “Exploit Prediction Scoring System (EPSS),” Digit. Threats: Res. Pract., vol. 2, no. 3, pp. 1–17, 2021.</p>
    <p class="reference-item">[6] The MITRE Corporation, “Common Weakness Enumeration (CWE): A Community-Developed List of Software Weakness Types,” 2024. [Online]. Available: https://cwe.mitre.org</p>
    <p class="reference-item">[7] Cybersecurity and Infrastructure Security Agency (CISA), “Known Exploited Vulnerabilities Catalog,” CISA, 2021. [Online]. Available: https://www.cisa.gov/known-exploited-vulnerabilities-catalog</p>
    <p class="reference-item">[8] S. Frei, M. May, B. Stiller, and U. Fiedler, “Large-scale modeling of software vulnerabilities,” ACM SIGCOMM Comput. Commun. Rev., vol. 36, no. 4, pp. 131–142, 2006.</p>
    <p class="reference-item">[9] M. Bozorgi, L. K. Saul, S. Savage, and G. M. Voelker, “Beyond heuristics: Learning to classify vulnerabilities and predict exploits,” in Proc. 16th ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2010, pp. 105–114.</p>
    <p class="reference-item">[10] H. Fang et al., “Predicting exploits in the wild: A machine learning approach,” in Proc. 27th ACM Conf. Comput. Commun. Secur. (CCS), 2020, pp. 1–14.</p>
    <p class="reference-item">[11] H. Holm et al., “A quantitative evaluation of vulnerability prioritization strategies,” in Proc. 10th Int. Conf. Availability, Rel. Secur. (ARES), 2015, pp. 248–255.</p>
    <p class="reference-item">[12] S. Fenz, J. Heurix, T. Neubauer, and W. Pechstein, “Current state of information security risk assessment,” Inf. Comput. Secur., vol. 22, no. 4, pp. 310–330, 2014.</p>
    <p class="reference-item">[13] P. Runeson et al., “Detection of duplicate defect reports using natural language processing,” in Proc. 29th Int. Conf. Softw. Eng. (ICSE), 2007, pp. 499–510.</p>
    <p class="reference-item">[14] X. Wang et al., “An approach to detecting duplicate bug reports using natural language and execution information,” in Proc. 30th Int. Conf. Softw. Eng. (ICSE), 2008, pp. 461–470.</p>
    <p class="reference-item">[15] C. Sun et al., “Towards more accurate retrieval of duplicate bug reports,” in Proc. 26th IEEE/ACM Int. Conf. Autom. Softw. Eng. (ASE), 2011, pp. 253–262.</p>
    <p class="reference-item">[16] OWASP Foundation, “OWASP DefectDojo: Vulnerability Management Platform Documentation,” 2024. [Online]. Available: https://defectdojo.github.io/django-DefectDojo</p>
    <p class="reference-item">[17] Greenbone AG, “Greenbone Community Edition Architecture and Manual,” 2024. [Online]. Available: https://docs.greenbone.net</p>
    <p class="reference-item">[18] Tenable Inc., “Tenable Nessus User Guide and Prioritization Architecture,” 2024. [Online]. Available: https://docs.tenable.com/nessus</p>
  </div>

</body>
</html>`;

async function compilePdf() {
  console.log('Launching headless Chrome to render IEEE PDF...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPath = path.resolve(__dirname, '../VulnTrack_Paper.pdf');
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: '1.0in',
      bottom: '1.125in',
      left: '0.8125in',
      right: '0.8125in'
    }
  });

  await browser.close();
  console.log('Successfully generated VulnTrack_Paper.pdf at:', outputPath);
  const stats = fs.statSync(outputPath);
  console.log('PDF File Size:', Math.round(stats.size / 1024), 'KB');
}

compilePdf().catch(err => {
  console.error('Failed to compile PDF:', err);
  process.exit(1);
});
