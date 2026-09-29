/**
 * VulnTrack Figure Generator
 * Generates publication-ready SVG and PNG figures for the IEEE paper.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const figuresDir = path.resolve(__dirname, '../figures');
if (!fs.existsSync(figuresDir)) {
  fs.mkdirSync(figuresDir, { recursive: true });
}

// -------------------------------------------------------------
// Figure 1: 13-Stage Methodology Flowchart
// -------------------------------------------------------------
const fig1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" width="1200" height="680" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
    <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="dangerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.15"/>
    </filter>
  </defs>

  <text x="600" y="40" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 1. The 13-Stage Vulnerability Management &amp; Prioritization Lifecycle in VulnTrack</text>

  <!-- Row 1: Stages 1 to 5 (Ingestion, Validation, Deduplication, Classification) -->
  <!-- Stage 1 -->
  <g filter="url(#shadow)">
    <rect x="40" y="80" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="50" y="105" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 1</text>
    <text x="50" y="128" font-size="16" font-weight="bold" fill="#ffffff">Discovery</text>
    <text x="50" y="150" font-size="11" fill="#e2e8f0">Nessus / Burp / Nmap / Pentest</text>
  </g>

  <line x1="230" y1="125" x2="270" y2="125" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 2 -->
  <g filter="url(#shadow)">
    <rect x="270" y="80" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="280" y="105" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 2</text>
    <text x="280" y="128" font-size="16" font-weight="bold" fill="#ffffff">Reporting</text>
    <text x="280" y="150" font-size="11" fill="#e2e8f0">Structured Metadata &amp; PoC</text>
  </g>

  <line x1="460" y1="125" x2="500" y2="125" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 3 -->
  <g filter="url(#shadow)">
    <rect x="500" y="80" width="190" height="90" rx="8" fill="url(#warnGrad)"/>
    <text x="510" y="105" font-size="12" font-weight="bold" fill="#fef3c7">STAGE 3</text>
    <text x="510" y="128" font-size="16" font-weight="bold" fill="#ffffff">Validation</text>
    <text x="510" y="150" font-size="11" fill="#fef3c7">Analyst Triage &amp; Needs-Info</text>
  </g>

  <line x1="690" y1="125" x2="730" y2="125" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 4 -->
  <g filter="url(#shadow)">
    <rect x="730" y="80" width="190" height="90" rx="8" fill="url(#accentGrad)"/>
    <text x="740" y="105" font-size="12" font-weight="bold" fill="#99f6e4">STAGE 4</text>
    <text x="740" y="128" font-size="16" font-weight="bold" fill="#ffffff">Deduplication</text>
    <text x="740" y="150" font-size="11" fill="#ccfbf1">TF-IDF &amp; Cosine Similarity</text>
  </g>

  <line x1="920" y1="125" x2="960" y2="125" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 5 -->
  <g filter="url(#shadow)">
    <rect x="960" y="80" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="970" y="105" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 5</text>
    <text x="970" y="128" font-size="16" font-weight="bold" fill="#ffffff">Classification</text>
    <text x="970" y="150" font-size="11" fill="#e2e8f0">CVE / CWE Taxonomies</text>
  </g>

  <!-- Connect Row 1 to Row 2 -->
  <path d="M 1055 170 L 1055 220 L 1055 250" fill="none" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Row 2: Stages 6 to 9 (Multi-Factor Scoring & Prioritization) -->
  <!-- Stage 6 -->
  <g filter="url(#shadow)">
    <rect x="960" y="250" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="970" y="275" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 6</text>
    <text x="970" y="298" font-size="16" font-weight="bold" fill="#ffffff">CVSS Severity</text>
    <text x="970" y="320" font-size="11" fill="#e2e8f0">Official CVSS v3.1 Vector</text>
  </g>

  <line x1="960" y1="295" x2="920" y2="295" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 7 -->
  <g filter="url(#shadow)">
    <rect x="730" y="250" width="190" height="90" rx="8" fill="url(#dangerGrad)"/>
    <text x="740" y="275" font-size="12" font-weight="bold" fill="#fecaca">STAGE 7</text>
    <text x="740" y="298" font-size="16" font-weight="bold" fill="#ffffff">Threat Intel</text>
    <text x="740" y="320" font-size="11" fill="#fee2e2">Live EPSS &amp; CISA KEV Feeds</text>
  </g>

  <line x1="730" y1="295" x2="690" y2="295" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 8 -->
  <g filter="url(#shadow)">
    <rect x="500" y="250" width="190" height="90" rx="8" fill="url(#accentGrad)"/>
    <text x="510" y="275" font-size="12" font-weight="bold" fill="#99f6e4">STAGE 8</text>
    <text x="510" y="298" font-size="16" font-weight="bold" fill="#ffffff">Asset Context</text>
    <text x="510" y="320" font-size="11" fill="#ccfbf1">Criticality, Reach, Exposure</text>
  </g>

  <line x1="500" y1="295" x2="460" y2="295" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 9 -->
  <g filter="url(#shadow)">
    <rect x="270" y="250" width="190" height="90" rx="8" fill="url(#warnGrad)"/>
    <text x="280" y="275" font-size="12" font-weight="bold" fill="#fef3c7">STAGE 9</text>
    <text x="280" y="298" font-size="16" font-weight="bold" fill="#ffffff">Risk Score</text>
    <text x="280" y="320" font-size="11" fill="#fef3c7">P1–P4 + Explainability AI</text>
  </g>

  <!-- Connect Row 2 to Row 3 -->
  <path d="M 365 340 L 365 390 L 135 390 L 135 420" fill="none" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Row 3: Stages 10 to 13 (SLA, Remediation, Retest, Continuous Monitoring) -->
  <!-- Stage 10 -->
  <g filter="url(#shadow)">
    <rect x="40" y="420" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="50" y="445" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 10</text>
    <text x="50" y="468" font-size="16" font-weight="bold" fill="#ffffff">SLA &amp; Assign</text>
    <text x="50" y="490" font-size="11" fill="#e2e8f0">Countdown Clock (24h–720h)</text>
  </g>

  <line x1="230" y1="465" x2="270" y2="465" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 11 -->
  <g filter="url(#shadow)">
    <rect x="270" y="420" width="190" height="90" rx="8" fill="url(#primaryGrad)"/>
    <text x="280" y="445" font-size="12" font-weight="bold" fill="#93c5fd">STAGE 11</text>
    <text x="280" y="468" font-size="16" font-weight="bold" fill="#ffffff">Remediation</text>
    <text x="280" y="490" font-size="11" fill="#e2e8f0">Engineering Mitigation Notes</text>
  </g>

  <line x1="460" y1="465" x2="500" y2="465" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 12 -->
  <g filter="url(#shadow)">
    <rect x="500" y="420" width="190" height="90" rx="8" fill="url(#warnGrad)"/>
    <text x="510" y="445" font-size="12" font-weight="bold" fill="#fef3c7">STAGE 12</text>
    <text x="510" y="468" font-size="16" font-weight="bold" fill="#ffffff">Re-test Audit</text>
    <text x="510" y="490" font-size="11" fill="#fef3c7">Verified Close / Reopen Loop</text>
  </g>

  <line x1="690" y1="465" x2="730" y2="465" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Stage 13 -->
  <g filter="url(#shadow)">
    <rect x="730" y="420" width="220" height="90" rx="8" fill="url(#dangerGrad)"/>
    <text x="740" y="445" font-size="12" font-weight="bold" fill="#fecaca">STAGE 13</text>
    <text x="740" y="468" font-size="16" font-weight="bold" fill="#ffffff">Continuous Monitor</text>
    <text x="740" y="490" font-size="11" fill="#fee2e2">Cron Refresh &amp; Priority Elevation</text>
  </g>

  <!-- Reopen feedback loop from 12 back to 10 -->
  <path d="M 595 510 L 595 560 L 135 560 L 135 510" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrow)"/>
  <text x="365" y="580" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">Failed Retest Triggers Reopen &amp; Reassignment Loop</text>

  <!-- Continuous Monitoring loop back to Stage 9 -->
  <path d="M 840 420 L 840 370 L 365 370 L 365 340" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrow)"/>
  <text x="600" y="385" text-anchor="middle" font-size="11" font-weight="bold" fill="#0284c7">Threat Intel Refresh Triggers Risk Recalculation</text>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig1_methodology_flowchart.svg'), fig1Svg);

// -------------------------------------------------------------
// Figure 2: System Architecture Diagram
// -------------------------------------------------------------
const fig2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" width="1200" height="720" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <filter id="boxShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="2" stdDeviation="2.5" flood-opacity="0.12"/>
    </filter>
  </defs>

  <text x="600" y="35" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 2. VulnTrack Three-Tier Enterprise System Architecture</text>

  <!-- Tier 1: Client Layer -->
  <rect x="50" y="65" width="1100" height="150" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <text x="70" y="95" font-size="14" font-weight="bold" fill="#1e293b">PRESENTATION TIER (React 18 + Vite SPA)</text>
  
  <rect x="80" y="115" width="190" height="80" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="175" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#0369a1">Role-Based Views</text>
  <text x="175" y="170" text-anchor="middle" font-size="11" fill="#0284c7">Reporter, Analyst, Admin</text>

  <rect x="290" y="115" width="190" height="80" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="385" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#0369a1">Triage &amp; Prioritization</text>
  <text x="385" y="170" text-anchor="middle" font-size="11" fill="#0284c7">Queue, Filters, Matrix</text>

  <rect x="500" y="115" width="190" height="80" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="595" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#0369a1">Explainability Modal</text>
  <text x="595" y="170" text-anchor="middle" font-size="11" fill="#0284c7">Decomposition &amp; Override Audit</text>

  <rect x="710" y="115" width="190" height="80" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="805" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#0369a1">Duplicate Inspector</text>
  <text x="805" y="170" text-anchor="middle" font-size="11" fill="#0284c7">Side-by-Side Diff &amp; Score</text>

  <rect x="920" y="115" width="200" height="80" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="1020" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#0369a1">SLA Live Radar</text>
  <text x="1020" y="170" text-anchor="middle" font-size="11" fill="#0284c7">Breach Countdown &amp; Warning</text>

  <!-- Connect Tier 1 to Tier 2 -->
  <line x1="600" y1="215" x2="600" y2="255" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="610" y="240" font-size="11" font-weight="bold" fill="#475569">REST API (JSON over HTTPS / Bearer JWT)</text>

  <!-- Tier 2: Application Layer -->
  <rect x="50" y="255" width="1100" height="250" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="70" y="280" font-size="14" font-weight="bold" fill="#0f172a">APPLICATION TIER (Node.js + Express REST API Server)</text>

  <!-- Middleware strip -->
  <rect x="80" y="295" width="1040" height="35" rx="5" fill="#e2e8f0" stroke="#cbd5e1"/>
  <text x="600" y="318" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">Security Middleware: Helmet | CORS | RateLimiter | JWT Auth | RBAC Guard | Multer Safe Upload | Centralized Error Handler</text>

  <!-- Services Grid -->
  <rect x="80" y="345" width="240" height="70" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="200" y="372" text-anchor="middle" font-size="12" font-weight="bold" fill="#92400e">RiskEngineService</text>
  <text x="200" y="395" text-anchor="middle" font-size="10" fill="#78350f">Multi-factor normalization &amp; overrides</text>

  <rect x="345" y="345" width="240" height="70" rx="6" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="465" y="372" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f766e">DuplicateService</text>
  <text x="465" y="395" text-anchor="middle" font-size="10" fill="#115e59">TF-IDF Vectorizer &amp; Cosine Engine</text>

  <rect x="610" y="345" width="240" height="70" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="730" y="372" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">ThreatIntelService</text>
  <text x="730" y="395" text-anchor="middle" font-size="10" fill="#7f1d1d">EPSS &amp; CISA KEV Synchronizer</text>

  <rect x="875" y="345" width="245" height="70" rx="6" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5" filter="url(#boxShadow)"/>
  <text x="997" y="372" text-anchor="middle" font-size="12" font-weight="bold" fill="#5b21b6">SlaService &amp; StateMachine</text>
  <text x="997" y="395" text-anchor="middle" font-size="10" fill="#4c1d95">Lifecycle state validation &amp; timers</text>

  <!-- Background jobs -->
  <rect x="80" y="430" width="1040" height="55" rx="6" fill="#dbeafe" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="100" y="455" font-size="12" font-weight="bold" fill="#1e40af">Background Cron Workers (node-cron):</text>
  <text x="100" y="473" font-size="11" fill="#1e3a8a">• Daily Threat Intelligence Refresh (02:00 UTC)   • Hourly SLA Breach &amp; Warning Scanner   • Automated Email/In-App Alert Dispatcher</text>

  <!-- Connect Tier 2 to Tier 3 -->
  <line x1="350" y1="505" x2="350" y2="545" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>
  <line x1="850" y1="505" x2="850" y2="545" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Tier 3: Data & External Feeds -->
  <rect x="50" y="545" width="570" height="150" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
  <text x="70" y="575" font-size="14" font-weight="bold" fill="#1e293b">PERSISTENCE TIER (MongoDB Mongoose ODM)</text>
  <rect x="75" y="595" width="150" height="75" rx="5" fill="#ffffff" stroke="#94a3b8"/>
  <text x="150" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">Vulnerability &amp; Asset</text>
  <text x="150" y="645" text-anchor="middle" font-size="9" fill="#64748b">Compound Indexes</text>

  <rect x="240" y="595" width="150" height="75" rx="5" fill="#ffffff" stroke="#94a3b8"/>
  <text x="315" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">User &amp; Setting</text>
  <text x="315" y="645" text-anchor="middle" font-size="9" fill="#64748b">RBAC &amp; Config Store</text>

  <rect x="405" y="595" width="195" height="75" rx="5" fill="#ffffff" stroke="#94a3b8"/>
  <text x="502" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">AuditLog (Immutable)</text>
  <text x="502" y="645" text-anchor="middle" font-size="9" fill="#64748b">Append-only Action History</text>

  <rect x="650" y="545" width="500" height="150" rx="10" fill="#f8fafc" stroke="#dc2626" stroke-width="2"/>
  <text x="670" y="575" font-size="14" font-weight="bold" fill="#991b1b">EXTERNAL THREAT INTELLIGENCE APIS</text>
  <rect x="675" y="595" width="135" height="75" rx="5" fill="#ffffff" stroke="#f87171"/>
  <text x="742" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#b91c1c">FIRST.org EPSS</text>
  <text x="742" y="645" text-anchor="middle" font-size="9" fill="#7f1d1d">Exploit Probability API</text>

  <rect x="825" y="595" width="135" height="75" rx="5" fill="#ffffff" stroke="#f87171"/>
  <text x="892" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#b91c1c">CISA KEV</text>
  <text x="892" y="645" text-anchor="middle" font-size="9" fill="#7f1d1d">Active Wild Exploits</text>

  <rect x="975" y="595" width="155" height="75" rx="5" fill="#ffffff" stroke="#f87171"/>
  <text x="1052" y="625" text-anchor="middle" font-size="11" font-weight="bold" fill="#b91c1c">NIST NVD 2.0</text>
  <text x="1052" y="645" text-anchor="middle" font-size="9" fill="#7f1d1d">CVE CVSS Vectors</text>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig2_system_architecture.svg'), fig2Svg);

// -------------------------------------------------------------
// Figure 4: State Machine Diagram
// -------------------------------------------------------------
const fig4Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" width="1200" height="650" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>

  <text x="600" y="35" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 4. VulnTrack Vulnerability Status Finite State Machine (FSM)</text>

  <!-- Initial State: SUBMITTED -->
  <circle cx="90" cy="180" r="30" fill="#3b82f6"/>
  <text x="90" y="185" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">SUBMITTED</text>

  <line x1="120" y1="180" x2="190" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="155" y="170" text-anchor="middle" font-size="9" fill="#475569">Start Triage</text>

  <!-- State: UNDER_VALIDATION -->
  <rect x="190" y="150" width="140" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="260" y="185" text-anchor="middle" font-size="11" font-weight="bold" fill="#b45309">UNDER_VALIDATION</text>

  <!-- Branches from UNDER_VALIDATION -->
  <!-- Needs Info (up and loop back) -->
  <path d="M 230 150 L 230 90 L 150 90" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="80" y="60" width="130" height="50" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="145" y="90" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">NEEDS_INFO</text>
  <path d="M 145 110 L 145 140 L 210 160" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>
  <text x="145" y="130" text-anchor="middle" font-size="8" fill="#64748b">Reporter Reply</text>

  <!-- Rejected (down) -->
  <line x1="230" y1="210" x2="230" y2="280" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="175" y="280" width="110" height="45" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="230" y="307" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">REJECTED</text>

  <!-- Duplicate (down right) -->
  <line x1="290" y1="210" x2="290" y2="280" stroke="#a855f7" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="235" y="280" width="110" height="45" rx="6" fill="#f3e8ff" stroke="#a855f7" stroke-width="1.5"/>
  <text x="290" y="307" text-anchor="middle" font-size="11" font-weight="bold" fill="#6b21a8">DUPLICATE</text>

  <!-- Validated (forward) -->
  <line x1="330" y1="180" x2="390" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="360" y="170" text-anchor="middle" font-size="9" fill="#475569">Approve</text>

  <!-- State: VALIDATED -->
  <rect x="390" y="150" width="120" height="60" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
  <text x="450" y="185" text-anchor="middle" font-size="11" font-weight="bold" fill="#065f46">VALIDATED</text>

  <line x1="510" y1="180" x2="570" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="540" y="170" text-anchor="middle" font-size="9" fill="#475569">Calculate</text>

  <!-- State: PRIORITIZED -->
  <rect x="570" y="150" width="130" height="60" rx="8" fill="#fed7aa" stroke="#f97316" stroke-width="2"/>
  <text x="635" y="180" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">PRIORITIZED</text>
  <text x="635" y="198" text-anchor="middle" font-size="8" fill="#c2410c">SLA Starts</text>

  <!-- Branch: OPEN or ASSIGNED -->
  <line x1="700" y1="180" x2="760" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="760" y="150" width="110" height="60" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
  <text x="815" y="185" text-anchor="middle" font-size="11" font-weight="bold" fill="#3730a3">ASSIGNED</text>

  <line x1="870" y1="180" x2="930" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- State: IN_PROGRESS -->
  <rect x="930" y="150" width="130" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="995" y="185" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af">IN_PROGRESS</text>

  <!-- Next line: RESOLVED (downwards) -->
  <path d="M 995 210 L 995 380 L 930 380" fill="none" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="1005" y="295" font-size="9" fill="#475569">Patch Deployed</text>

  <!-- State: RESOLVED -->
  <rect x="800" y="350" width="130" height="60" rx="8" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
  <text x="865" y="385" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">RESOLVED</text>

  <line x1="800" y1="380" x2="740" y2="380" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="770" y="370" text-anchor="middle" font-size="9" fill="#475569">Trigger Retest</text>

  <!-- State: RETEST -->
  <rect x="610" y="350" width="130" height="60" rx="8" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <text x="675" y="385" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">RETEST</text>

  <!-- Verification Pass: VERIFIED -->
  <line x1="610" y1="380" x2="540" y2="380" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="575" y="370" text-anchor="middle" font-size="9" fill="#047857">Audit Pass</text>

  <rect x="410" y="350" width="130" height="60" rx="8" fill="#bbf7d0" stroke="#22c55e" stroke-width="2"/>
  <text x="475" y="385" text-anchor="middle" font-size="11" font-weight="bold" fill="#15803d">VERIFIED</text>

  <line x1="410" y1="380" x2="340" y2="380" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Final State: CLOSED -->
  <rect x="210" y="350" width="130" height="60" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
  <text x="275" y="385" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">CLOSED (End)</text>

  <!-- Verification Fail: REOPENED (loops back) -->
  <path d="M 675 410 L 675 490 L 815 490 L 815 210" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrow)"/>
  <rect x="685" y="470" width="120" height="40" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="745" y="495" text-anchor="middle" font-size="10" font-weight="bold" fill="#991b1b">REOPENED (Fail)</text>
  <text x="745" y="530" text-anchor="middle" font-size="9" fill="#dc2626">Reopen Counter++ &amp; Reassigned to Engineer</text>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig4_state_machine.svg'), fig4Svg);

// -------------------------------------------------------------
// Figure 6: Risk Formula Computation Diagram
// -------------------------------------------------------------
const fig6Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" width="1200" height="650" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="30%" stop-color="#3b82f6"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
  </defs>

  <text x="600" y="35" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 6. Multi-Factor Contextual Risk Scoring Decomposition &amp; Threshold Mapping</text>

  <!-- 6 Normalized Inputs on the Left -->
  <g transform="translate(60, 70)">
    <!-- Input 1 -->
    <rect x="0" y="0" width="220" height="55" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="15" y="24" font-size="11" font-weight="bold" fill="#1e40af">1. Technical Severity (CVSS)</text>
    <text x="15" y="42" font-size="10" fill="#475569">cvssN = cvssBase / 10.0 ∈ [0, 1]</text>

    <!-- Input 2 -->
    <rect x="0" y="65" width="220" height="55" rx="6" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
    <text x="15" y="89" font-size="11" font-weight="bold" fill="#9d174d">2. Exploit Probability (EPSS)</text>
    <text x="15" y="107" font-size="10" fill="#475569">epssN = epssScore ∈ [0, 1]</text>

    <!-- Input 3 -->
    <rect x="0" y="130" width="220" height="55" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="15" y="154" font-size="11" font-weight="bold" fill="#991b1b">3. Active Wild Exploits (KEV)</text>
    <text x="15" y="172" font-size="10" fill="#475569">kevN = 1.0 if in KEV else 0.0</text>

    <!-- Input 4 -->
    <rect x="0" y="195" width="220" height="55" rx="6" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
    <text x="15" y="219" font-size="11" font-weight="bold" fill="#166534">4. Asset Criticality</text>
    <text x="15" y="237" font-size="10" fill="#475569">assetCritN = (criticality - 1) / 4.0</text>

    <!-- Input 5 -->
    <rect x="0" y="260" width="220" height="55" rx="6" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
    <text x="15" y="284" font-size="11" font-weight="bold" fill="#854d0e">5. Business Impact Reach</text>
    <text x="15" y="302" font-size="10" fill="#475569">bizImpactN = 0.5·sens + 0.5·users</text>

    <!-- Input 6 -->
    <rect x="0" y="325" width="220" height="55" rx="6" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5"/>
    <text x="15" y="349" font-size="11" font-weight="bold" fill="#5b21b6">6. Network Exposure</text>
    <text x="15" y="367" font-size="10" fill="#475569">Prod Internet: 1.0 | Internal: 0.4</text>
  </g>

  <!-- Configurable Weights Matrix in Center -->
  <g transform="translate(350, 70)">
    <rect x="0" y="0" width="230" height="380" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <text x="115" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">WEIGHT MATRIX</text>
    <text x="115" y="48" text-anchor="middle" font-size="10" fill="#64748b">Sum = 1.00 (Configurable)</text>
    <line x1="20" y1="60" x2="210" y2="60" stroke="#cbd5e1"/>

    <text x="25" y="90" font-size="12" font-weight="bold" fill="#1e40af">w_cvss = 0.30</text>
    <text x="180" y="90" font-size="11" fill="#64748b">(30%)</text>

    <text x="25" y="150" font-size="12" font-weight="bold" fill="#9d174d">w_epss = 0.20</text>
    <text x="180" y="150" font-size="11" fill="#64748b">(20%)</text>

    <text x="25" y="210" font-size="12" font-weight="bold" fill="#991b1b">w_kev = 0.20</text>
    <text x="180" y="210" font-size="11" fill="#64748b">(20%)</text>

    <text x="25" y="270" font-size="12" font-weight="bold" fill="#166534">w_asset = 0.15</text>
    <text x="180" y="270" font-size="11" fill="#64748b">(15%)</text>

    <text x="25" y="325" font-size="12" font-weight="bold" fill="#854d0e">w_biz = 0.10</text>
    <text x="180" y="325" font-size="11" fill="#64748b">(10%)</text>

    <text x="25" y="365" font-size="12" font-weight="bold" fill="#5b21b6">w_exp = 0.05</text>
    <text x="180" y="365" font-size="11" fill="#64748b">(5%)</text>
  </g>

  <!-- Connect inputs to weights -->
  <line x1="280" y1="95" x2="350" y2="95" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="280" y1="160" x2="350" y2="160" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="280" y1="225" x2="350" y2="225" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="280" y1="290" x2="350" y2="290" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="280" y1="355" x2="350" y2="355" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="280" y1="415" x2="350" y2="415" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Weighted Sum Box -->
  <line x1="580" y1="260" x2="650" y2="260" stroke="#334155" stroke-width="3" marker-end="url(#arrow)"/>

  <g transform="translate(650, 180)">
    <rect x="0" y="0" width="220" height="160" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
    <text x="110" y="35" text-anchor="middle" font-size="13" font-weight="bold" fill="#38bdf8">CONTINUOUS SCORE</text>
    <text x="110" y="65" text-anchor="middle" font-size="11" fill="#e2e8f0">Score = 100 × ∑(w_i · x_i)</text>
    <text x="110" y="95" text-anchor="middle" font-size="24" font-weight="bold" fill="#ffffff">0.0 – 100.0</text>
    <text x="110" y="130" text-anchor="middle" font-size="10" fill="#94a3b8">Bounded Continuous Metric</text>
  </g>

  <!-- Connect Score to Priority Tiers -->
  <line x1="870" y1="260" x2="940" y2="260" stroke="#334155" stroke-width="3" marker-end="url(#arrow)"/>

  <!-- Priority Thresholds on Right -->
  <g transform="translate(940, 70)">
    <rect x="0" y="0" width="200" height="380" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <text x="100" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">OPERATIONAL TIERS</text>
    <line x1="15" y1="45" x2="185" y2="45" stroke="#cbd5e1"/>

    <!-- P1 -->
    <rect x="15" y="60" width="170" height="65" rx="5" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="25" y="85" font-size="13" font-weight="bold" fill="#991b1b">P1 CRITICAL</text>
    <text x="25" y="103" font-size="10" fill="#7f1d1d">Score ≥ 70.0 | SLA: 24h</text>
    <text x="25" y="117" font-size="9" fill="#991b1b">Immediate Escalation</text>

    <!-- P2 -->
    <rect x="15" y="140" width="170" height="65" rx="5" fill="#ffedd5" stroke="#f97316" stroke-width="1.5"/>
    <text x="25" y="165" font-size="13" font-weight="bold" fill="#9a3412">P2 HIGH</text>
    <text x="25" y="183" font-size="10" fill="#7c2d12">Score: 50.0–69.9 | SLA: 72h</text>
    <text x="25" y="197" font-size="9" fill="#9a3412">Next Sprint Patch</text>

    <!-- P3 -->
    <rect x="15" y="220" width="170" height="65" rx="5" fill="#fef9c3" stroke="#eab308" stroke-width="1.5"/>
    <text x="25" y="245" font-size="13" font-weight="bold" fill="#854d0e">P3 MEDIUM</text>
    <text x="25" y="263" font-size="10" fill="#713f12">Score: 30.0–49.9 | SLA: 168h</text>
    <text x="25" y="277" font-size="9" fill="#854d0e">Scheduled Maintenance</text>

    <!-- P4 -->
    <rect x="15" y="300" width="170" height="65" rx="5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
    <text x="25" y="325" font-size="13" font-weight="bold" fill="#334155">P4 LOW</text>
    <text x="25" y="343" font-size="10" fill="#475569">Score &lt; 30.0 | SLA: 720h</text>
    <text x="25" y="357" font-size="9" fill="#334155">Backlog Review</text>
  </g>

  <!-- Safeguard Overrides Banner at Bottom -->
  <g transform="translate(60, 480)">
    <rect x="0" y="0" width="1080" height="120" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
    <text x="30" y="32" font-size="14" font-weight="bold" fill="#991b1b">DETERMINISTIC SAFETY OVERRIDES (Guaranteed Risk Floors)</text>
    <line x1="30" y1="45" x2="1050" y2="45" stroke="#fca5a5"/>
    
    <text x="30" y="70" font-size="11" font-weight="bold" fill="#7f1d1d">• Active Wild Weaponization Floor (CISA KEV):</text>
    <text x="300" y="70" font-size="11" fill="#450a0a">If vuln.threat.inKev == true AND asset.isInternetFacing == true &rarr; Floor automatically at P1 Critical regardless of score.</text>

    <text x="30" y="98" font-size="11" font-weight="bold" fill="#7f1d1d">• Catastrophic Technical Severity Floor (CVSS):</text>
    <text x="300" y="98" font-size="11" fill="#450a0a">If vuln.cvss.baseScore ≥ 9.0 &rarr; Floor automatically at P2 High (Prevents severe RCE flaws from deprioritization to P3/P4).</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig6_risk_formula_breakdown.svg'), fig6Svg);

// -------------------------------------------------------------
// Figure 7: Duplicate Metrics Curve (Precision, Recall, F1 vs Threshold)
// -------------------------------------------------------------
// Data:
// 0.60 -> Prec: 1.00, Rec: 0.50, F1: 0.667
// 0.70 -> Prec: 1.00, Rec: 0.333, F1: 0.500
// 0.75 -> Prec: 1.00, Rec: 0.250, F1: 0.400
// 0.80 -> Prec: 1.00, Rec: 0.083, F1: 0.154

const fig7Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 550" width="900" height="550" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <text x="450" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">Fig. 7. Duplicate Detection Performance vs. Similarity Threshold</text>
  <text x="450" y="60" text-anchor="middle" font-size="12" fill="#64748b">Empirical Evaluation on 24 Labeled Synthetic Cybersecurity Finding Pairs</text>

  <!-- Plot Area: x: 120 to 800 (width 680), y: 100 to 440 (height 340) -->
  <!-- X mapped: 0.55 -> 120, 0.60 -> 233, 0.70 -> 460, 0.75 -> 573, 0.80 -> 686, 0.85 -> 800 -->
  <!-- Y mapped: 0.0 -> 440, 1.0 -> 100 (height 340, 1.0 = 340px) -->

  <!-- Grid lines -->
  <line x1="120" y1="440" x2="800" y2="440" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="120" y1="355" x2="800" y2="355" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="120" y1="270" x2="800" y2="270" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="120" y1="185" x2="800" y2="185" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="120" y1="100" x2="800" y2="100" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="120" y1="100" x2="120" y2="440" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Y axis ticks -->
  <text x="105" y="445" text-anchor="end" font-size="11" fill="#64748b">0.00</text>
  <text x="105" y="360" text-anchor="end" font-size="11" fill="#64748b">0.25</text>
  <text x="105" y="275" text-anchor="end" font-size="11" fill="#64748b">0.50</text>
  <text x="105" y="190" text-anchor="end" font-size="11" fill="#64748b">0.75</text>
  <text x="105" y="105" text-anchor="end" font-size="11" fill="#64748b">1.00</text>
  <text x="40" y="270" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155" transform="rotate(-90 40 270)">Metric Value (0.0 – 1.0)</text>

  <!-- X axis ticks -->
  <!-- 0.60: x = 233 -->
  <line x1="233" y1="440" x2="233" y2="446" stroke="#475569" stroke-width="1.5"/>
  <text x="233" y="465" text-anchor="middle" font-size="11" fill="#334155">0.60</text>

  <!-- 0.70: x = 460 -->
  <line x1="460" y1="440" x2="460" y2="446" stroke="#475569" stroke-width="1.5"/>
  <text x="460" y="465" text-anchor="middle" font-size="11" fill="#334155">0.70</text>

  <!-- 0.75: x = 573 (Operational Default) -->
  <line x1="573" y1="440" x2="573" y2="446" stroke="#475569" stroke-width="1.5"/>
  <text x="573" y="465" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f766e">0.75 (Default)</text>

  <!-- 0.80: x = 686 -->
  <line x1="686" y1="440" x2="686" y2="446" stroke="#475569" stroke-width="1.5"/>
  <text x="686" y="465" text-anchor="middle" font-size="11" fill="#334155">0.80</text>

  <text x="460" y="495" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Cosine Similarity Threshold (θ)</text>

  <!-- Precision Curve: constant 1.00 -> y = 100 -->
  <polyline points="233,100 460,100 573,100 686,100" fill="none" stroke="#2563eb" stroke-width="3"/>
  <circle cx="233" cy="100" r="5" fill="#2563eb"/>
  <circle cx="460" cy="100" r="5" fill="#2563eb"/>
  <circle cx="573" cy="100" r="5" fill="#2563eb"/>
  <circle cx="686" cy="100" r="5" fill="#2563eb"/>

  <!-- Recall Curve:
       0.60: 0.500 -> y = 440 - 0.500*340 = 270
       0.70: 0.333 -> y = 440 - 0.333*340 = 326.8
       0.75: 0.250 -> y = 440 - 0.250*340 = 355
       0.80: 0.083 -> y = 440 - 0.083*340 = 411.8
  -->
  <polyline points="233,270 460,326.8 573,355 686,411.8" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="6,3"/>
  <circle cx="233" cy="270" r="5" fill="#dc2626"/>
  <circle cx="460" cy="326.8" r="5" fill="#dc2626"/>
  <circle cx="573" cy="355" r="5" fill="#dc2626"/>
  <circle cx="686" cy="411.8" r="5" fill="#dc2626"/>

  <!-- F1-Score Curve:
       0.60: 0.667 -> y = 440 - 0.667*340 = 213.2
       0.70: 0.500 -> y = 440 - 0.500*340 = 270
       0.75: 0.400 -> y = 440 - 0.400*340 = 304
       0.80: 0.154 -> y = 440 - 0.154*340 = 387.6
  -->
  <polyline points="233,213.2 460,270 573,304 686,387.6" fill="none" stroke="#10b981" stroke-width="3"/>
  <circle cx="233" cy="213.2" r="5" fill="#10b981"/>
  <circle cx="460" cy="270" r="5" fill="#10b981"/>
  <circle cx="573" cy="304" r="5" fill="#10b981"/>
  <circle cx="686" cy="387.6" r="5" fill="#10b981"/>

  <!-- Operational Threshold Indicator Line -->
  <line x1="573" y1="90" x2="573" y2="440" stroke="#0f766e" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="578" y="140" font-size="10" font-weight="bold" fill="#0f766e">Default θ = 0.75</text>
  <text x="578" y="155" font-size="9" fill="#0f766e">Zero False Positives</text>

  <!-- Legend -->
  <g transform="translate(620, 100)">
    <rect x="0" y="0" width="160" height="95" rx="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <line x1="15" y1="25" x2="45" y2="25" stroke="#2563eb" stroke-width="3"/>
    <circle cx="30" cy="25" r="4" fill="#2563eb"/>
    <text x="55" y="29" font-size="11" font-weight="bold" fill="#1e3a8a">Precision (1.00)</text>

    <line x1="15" y1="50" x2="45" y2="50" stroke="#10b981" stroke-width="3"/>
    <circle cx="30" cy="50" r="4" fill="#10b981"/>
    <text x="55" y="54" font-size="11" font-weight="bold" fill="#065f46">F1-Score</text>

    <line x1="15" y1="75" x2="45" y2="75" stroke="#dc2626" stroke-width="3" stroke-dasharray="6,3"/>
    <circle cx="30" cy="75" r="4" fill="#dc2626"/>
    <text x="55" y="79" font-size="11" font-weight="bold" fill="#991b1b">Recall</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig7_duplicate_metrics_curve.svg'), fig7Svg);

// -------------------------------------------------------------
// Figure 8: Priority Ranking Comparison (CVSS vs VulnTrack)
// -------------------------------------------------------------
const fig8Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 550" width="1100" height="550" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <text x="550" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">Fig. 8. Priority Shift: Standard CVSS Base Severity vs. VulnTrack Contextual Risk Tiers</text>
  <text x="550" y="60" text-anchor="middle" font-size="12" fill="#64748b">Comparison of 7 Representative Findings Illustrating Deprioritization and Threat Elevation</text>

  <!-- Table Header -->
  <g transform="translate(60, 80)">
    <rect x="0" y="0" width="980" height="35" rx="5" fill="#1e293b"/>
    <text x="15" y="23" font-size="11" font-weight="bold" fill="#ffffff">CASE</text>
    <text x="80" y="23" font-size="11" font-weight="bold" fill="#ffffff">SCENARIO DESCRIPTION</text>
    <text x="440" y="23" font-size="11" font-weight="bold" fill="#ffffff">CVSS ONLY</text>
    <text x="560" y="23" font-size="11" font-weight="bold" fill="#ffffff">SCORE</text>
    <text x="640" y="23" font-size="11" font-weight="bold" fill="#ffffff">VULNTRACK</text>
    <text x="760" y="23" font-size="11" font-weight="bold" fill="#ffffff">TACTICAL SHIFT &amp; REASONING</text>
  </g>

  <!-- Row 1: CASE 1 (CVSS 9.8 on test) -->
  <g transform="translate(60, 125)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-1</text>
    <text x="80" y="23" font-size="11" fill="#334155">RCE on Offline Sandbox</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 9.8 | EPSS 0.015 | Non-KEV | Crit 1/5</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#fee2e2"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">P1 (Crit)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#0f172a">30.7</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#ffedd5"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">P2 (High)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#2563eb">P1 &rarr; P2 (Deprioritized; avoids alert fatigue)</text>
  </g>

  <!-- Row 2: CASE 2 (Auth bypass on prod gateway) -->
  <g transform="translate(60, 185)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#fef2f2" stroke="#fecaca"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-2</text>
    <text x="80" y="23" font-size="11" fill="#334155">Auth Bypass on Prod Gateway</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 6.5 | EPSS 0.885 | In KEV | Crit 5/5</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#fef9c3"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">P3 (Med)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#991b1b">87.2</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#fee2e2"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">P1 (Crit)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#dc2626">P3 &rarr; P1 (Elevated; prevents active exploitation)</text>
  </g>

  <!-- Row 3: CASE 3 (MOVEit Transfer Prod) -->
  <g transform="translate(60, 245)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-3</text>
    <text x="80" y="23" font-size="11" fill="#334155">MOVEit SQLi / RCE (Customer Prod)</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 8.8 | EPSS 0.942 | In KEV | Public Prod</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#ffedd5"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">P2 (High)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#991b1b">95.2</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#fee2e2"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">P1 (Crit)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#dc2626">P2 &rarr; P1 (Elevated; wild weaponization)</text>
  </g>

  <!-- Row 4: CASE 4 (MOVEit Test Sandbox) -->
  <g transform="translate(60, 305)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-4</text>
    <text x="80" y="23" font-size="11" fill="#334155">MOVEit SQLi / RCE (Test Sandbox)</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 8.8 | EPSS 0.942 | In KEV | Test Box</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#ffedd5"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">P2 (High)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#0f172a">70.0</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#fee2e2"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">P1 (Crit)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#ea580c">P2 &rarr; P1 (Threat intelligence dominates)</text>
  </g>

  <!-- Row 5: CASE 5 (Path Traversal KEV Override) -->
  <g transform="translate(60, 365)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#fef2f2" stroke="#fecaca"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-5</text>
    <text x="80" y="23" font-size="11" fill="#334155">Path Traversal (Internet-Facing)</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 5.3 | EPSS 0.720 | In KEV | Public Box</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#fef9c3"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">P3 (Med)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#991b1b">68.3*</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#fee2e2"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">P1 (Crit)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#dc2626">P3 &rarr; P1 (KEV Public Override Triggered)</text>
  </g>

  <!-- Row 6: CASE 6 (Local Privilege Escalation Internal) -->
  <g transform="translate(60, 425)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-6</text>
    <text x="80" y="23" font-size="11" fill="#334155">Kernel Privilege Escalation</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 7.8 | EPSS 0.032 | Non-KEV | Internal</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#ffedd5"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#9a3412">P2 (High)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#0f172a">42.5</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#fef9c3"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">P3 (Med)</text>
    <text x="760" y="30" font-size="11" font-weight="bold" fill="#2563eb">P2 &rarr; P3 (Deprioritized; low exploitability)</text>
  </g>

  <!-- Row 7: CASE 7 (Slowloris DoS) -->
  <g transform="translate(60, 485)">
    <rect x="0" y="0" width="980" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="15" y="30" font-size="11" font-weight="bold" fill="#0f172a">CASE-7</text>
    <text x="80" y="23" font-size="11" fill="#334155">Slowloris HTTP Flood DoS</text>
    <text x="80" y="38" font-size="9" fill="#64748b">CVSS 3.5 | EPSS 0.045 | Non-KEV | Public</text>
    <rect x="440" y="12" width="80" height="26" rx="4" fill="#f1f5f9"/>
    <text x="480" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">P4 (Low)</text>
    <text x="580" y="30" font-size="12" font-weight="bold" fill="#0f172a">29.2</text>
    <rect x="640" y="12" width="80" height="26" rx="4" fill="#f1f5f9"/>
    <text x="680" y="29" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">P4 (Low)</text>
    <text x="760" y="30" font-size="11" fill="#64748b">P4 &rarr; P4 (Maintained; appropriate tier)</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig8_cvss_vs_vulntrack_ranking.svg'), fig8Svg);

// -------------------------------------------------------------
// Figure 3: ER Data Model Diagram
// -------------------------------------------------------------
const fig3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" width="1200" height="680" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
  </defs>

  <text x="600" y="35" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 3. VulnTrack Entity-Relationship (ER) Schema &amp; Data Model</text>

  <!-- Entity 1: User -->
  <g transform="translate(50, 70)">
    <rect x="0" y="0" width="230" height="200" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="2"/>
    <rect x="0" y="0" width="230" height="32" rx="8" fill="#3b82f6"/>
    <text x="115" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">User</text>
    <text x="15" y="55" font-size="11" fill="#0f172a">PK _id: ObjectId</text>
    <text x="15" y="75" font-size="11" fill="#334155">username: String [idx, uniq]</text>
    <text x="15" y="95" font-size="11" fill="#334155">email: String [idx, uniq]</text>
    <text x="15" y="115" font-size="11" fill="#334155">passwordHash: String (bcrypt)</text>
    <text x="15" y="135" font-size="11" fill="#334155">role: REPORTER | ANALYST | ADMIN</text>
    <text x="15" y="155" font-size="11" fill="#334155">isActive: Boolean</text>
    <text x="15" y="175" font-size="11" fill="#334155">failedLoginAttempts: Number</text>
    <text x="15" y="190" font-size="10" fill="#64748b">timestamps (created, updated)</text>
  </g>

  <!-- Entity 2: Asset -->
  <g transform="translate(50, 320)">
    <rect x="0" y="0" width="230" height="220" rx="8" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
    <rect x="0" y="0" width="230" height="32" rx="8" fill="#10b981"/>
    <text x="115" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">Asset</text>
    <text x="15" y="55" font-size="11" fill="#0f172a">PK _id: ObjectId</text>
    <text x="15" y="75" font-size="11" fill="#334155">name: String [idx]</text>
    <text x="15" y="95" font-size="11" fill="#334155">type: web-app | api | server | db</text>
    <text x="15" y="115" font-size="11" fill="#334155">environment: prod | staging | test</text>
    <text x="15" y="135" font-size="11" fill="#334155">criticality: Number (1-5)</text>
    <text x="15" y="155" font-size="11" fill="#334155">dataSensitivity: Number (1-5)</text>
    <text x="15" y="175" font-size="11" fill="#334155">internetFacing: Boolean</text>
    <text x="15" y="195" font-size="11" fill="#334155">owner: String</text>
    <text x="15" y="210" font-size="10" fill="#64748b">ipAddresses / URLs / tags[]</text>
  </g>

  <!-- Entity 3: Vulnerability (Central Entity) -->
  <g transform="translate(360, 70)">
    <rect x="0" y="0" width="380" height="470" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="2.5"/>
    <rect x="0" y="0" width="380" height="32" rx="8" fill="#ef4444"/>
    <text x="190" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#ffffff">Vulnerability (Core Entity)</text>
    
    <text x="15" y="55" font-size="11" font-weight="bold" fill="#0f172a">PK _id: ObjectId</text>
    <text x="15" y="75" font-size="11" fill="#334155">title, description, stepsToReproduce: String</text>
    <text x="15" y="95" font-size="11" fill="#334155">category: RCE | SQLi | XSS | SSRF | IDOR...</text>
    <text x="15" y="115" font-size="11" fill="#334155">cveId: String [idx] | cweId: String</text>
    <text x="15" y="135" font-size="11" font-weight="bold" fill="#dc2626">status: SUBMITTED .. CLOSED [idx]</text>
    <text x="15" y="155" font-size="11" font-weight="bold" fill="#dc2626">priority: P1 | P2 | P3 | P4 [idx]</text>
    <text x="15" y="175" font-size="11" fill="#334155">riskScore: Number (0-100) [idx]</text>
    
    <line x1="15" y1="188" x2="365" y2="188" stroke="#e2e8f0"/>
    <text x="15" y="205" font-size="11" font-weight="bold" fill="#1e40af">cvss: { baseScore, vectorString, severity }</text>
    <text x="15" y="225" font-size="11" font-weight="bold" fill="#0f766e">threat: { epss, epssPercentile, inKev, cisaDate }</text>
    <text x="15" y="245" font-size="11" fill="#334155">riskBreakdown: { cvss, epss, kev, asset, biz, exp }</text>
    <text x="15" y="265" font-size="11" fill="#334155">riskExplanation: String (Deterministic narrative)</text>
    <text x="15" y="285" font-size="11" fill="#334155">overridesApplied: [String]</text>

    <line x1="15" y1="298" x2="365" y2="298" stroke="#e2e8f0"/>
    <text x="15" y="315" font-size="11" font-weight="bold" fill="#b45309">sla: { dueAt [idx], hoursAllowed, breached, warning }</text>
    <text x="15" y="335" font-size="11" font-weight="bold" fill="#6b21a8">duplicate: { isPotentialDuplicate, matches[] }</text>

    <line x1="15" y1="348" x2="365" y2="348" stroke="#e2e8f0"/>
    <text x="15" y="365" font-size="11" fill="#0f172a">FK assetId: ObjectId &rarr; Asset._id [idx]</text>
    <text x="15" y="385" font-size="11" fill="#0f172a">FK reportedBy: ObjectId &rarr; User._id [idx]</text>
    <text x="15" y="405" font-size="11" fill="#0f172a">FK assignedTo: ObjectId &rarr; User._id [idx]</text>
    <text x="15" y="425" font-size="11" fill="#334155">reopenCount: Number (Default: 0)</text>
    <text x="15" y="445" font-size="11" fill="#334155">attachments[]: { filename, path, mimetype, size }</text>
    <text x="15" y="460" font-size="10" fill="#64748b">remediationNotes[], timeline[]</text>
  </g>

  <!-- Connect User to Vulnerability -->
  <line x1="280" y1="120" x2="360" y2="120" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="320" y="112" text-anchor="middle" font-size="9" fill="#1e40af">1:N (Report / Assign)</text>

  <!-- Connect Asset to Vulnerability -->
  <line x1="280" y1="400" x2="360" y2="400" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="320" y="392" text-anchor="middle" font-size="9" fill="#065f46">1:N (Target Asset)</text>

  <!-- Entity 4: AuditLog (Right) -->
  <g transform="translate(820, 70)">
    <rect x="0" y="0" width="280" height="230" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
    <rect x="0" y="0" width="280" height="32" rx="8" fill="#64748b"/>
    <text x="140" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">AuditLog (Immutable Record)</text>
    <text x="15" y="55" font-size="11" fill="#0f172a">PK _id: ObjectId</text>
    <text x="15" y="75" font-size="11" fill="#334155">FK actor: ObjectId &rarr; User._id</text>
    <text x="15" y="95" font-size="11" fill="#334155">actorRole: String</text>
    <text x="15" y="115" font-size="11" fill="#334155">action: STATUS_CHANGED | RISK_RECALC...</text>
    <text x="15" y="135" font-size="11" fill="#334155">entityType: Vulnerability | Asset | User</text>
    <text x="15" y="155" font-size="11" fill="#334155">entityId: ObjectId</text>
    <text x="15" y="175" font-size="11" fill="#334155">before: Mixed | after: Mixed</text>
    <text x="15" y="195" font-size="11" fill="#334155">ipAddress, userAgent: String</text>
    <text x="15" y="215" font-size="10" fill="#64748b">createdAt: Date [Compound Index: entityId+createdAt]</text>
  </g>

  <!-- Connect Vulnerability to AuditLog -->
  <line x1="740" y1="180" x2="820" y2="180" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="780" y="172" text-anchor="middle" font-size="9" fill="#475569">1:N (Audit Trail)</text>

  <!-- Entity 5: Setting (Bottom Right) -->
  <g transform="translate(820, 330)">
    <rect x="0" y="0" width="280" height="210" rx="8" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
    <rect x="0" y="0" width="280" height="32" rx="8" fill="#f59e0b"/>
    <text x="140" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">Setting (Singleton Config)</text>
    <text x="15" y="55" font-size="11" fill="#0f172a">PK _id: ObjectId</text>
    <text x="15" y="75" font-size="11" fill="#334155">key: 'global' [unique index]</text>
    <text x="15" y="95" font-size="11" fill="#334155">riskWeights: { cvss, epss, kev, asset, biz, exp }</text>
    <text x="15" y="115" font-size="11" fill="#334155">priorityThresholds: { p1:70, p2:50, p3:30 }</text>
    <text x="15" y="135" font-size="11" fill="#334155">slaHoursByPriority: { P1:24, P2:72, P3:168, P4:720 }</text>
    <text x="15" y="155" font-size="11" fill="#334155">exposureValues: { prod:1.0, internal:0.4, test:0.1 }</text>
    <text x="15" y="175" font-size="11" fill="#334155">duplicateThreshold: 0.75</text>
    <text x="15" y="195" font-size="11" fill="#334155">warningPercent: 75%</text>
  </g>

  <!-- Connect Setting to Vulnerability -->
  <path d="M 820 440 L 780 440 L 780 300 L 740 300" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <text x="770" y="360" font-size="9" fill="#b45309" transform="rotate(-90 770 360)">Governs Scoring &amp; SLA Rules</text>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig3_er_datamodel.svg'), fig3Svg);

// -------------------------------------------------------------
// Figure 5: Duplicate Detection Pipeline Diagram
// -------------------------------------------------------------
const fig5Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" width="1200" height="520" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>

  <text x="600" y="35" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Fig. 5. VulnTrack Natural Language Duplicate Detection Processing Pipeline</text>

  <!-- Step 1: Input Concatenation -->
  <g transform="translate(40, 80)">
    <rect x="0" y="0" width="160" height="180" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <text x="80" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">1. Ingestion</text>
    <text x="15" y="60" font-size="10" fill="#334155">• Title (2x weight)</text>
    <text x="15" y="85" font-size="10" fill="#334155">• Category string</text>
    <text x="15" y="110" font-size="10" fill="#334155">• Description text</text>
    <text x="15" y="135" font-size="10" fill="#334155">• Steps to Reproduce</text>
    <text x="15" y="160" font-size="9" fill="#64748b">Raw freeform text</text>
  </g>

  <line x1="200" y1="170" x2="240" y2="170" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Step 2: Tokenization & Normalization -->
  <g transform="translate(240, 80)">
    <rect x="0" y="0" width="160" height="180" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
    <text x="80" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">2. Normalization</text>
    <text x="15" y="60" font-size="10" fill="#334155">• Case folding (lower)</text>
    <text x="15" y="85" font-size="10" fill="#334155">• Regexp Tokenizer</text>
    <text x="15" y="110" font-size="10" fill="#334155">• Strip punctuation</text>
    <text x="15" y="135" font-size="10" fill="#334155">• Length &gt; 2 filter</text>
    <text x="15" y="160" font-size="10" fill="#334155">• Discard pure digits</text>
  </g>

  <line x1="400" y1="170" x2="440" y2="170" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Step 3: Stopword Filtering & Porter Stemming -->
  <g transform="translate(440, 80)">
    <rect x="0" y="0" width="170" height="180" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="2"/>
    <text x="85" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">3. NLP Reduction</text>
    <text x="15" y="60" font-size="10" fill="#334155">• Stopword Removal</text>
    <text x="25" y="80" font-size="9" fill="#713f12">("the", "is", "at", "which")</text>
    <text x="15" y="110" font-size="10" fill="#334155">• Porter Stemming:</text>
    <text x="25" y="130" font-size="9" fill="#713f12">vulnerability &rarr; vulner</text>
    <text x="25" y="145" font-size="9" fill="#713f12">injecting &rarr; inject</text>
    <text x="25" y="160" font-size="9" fill="#713f12">executed &rarr; execut</text>
  </g>

  <line x1="610" y1="170" x2="650" y2="170" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Step 4: Term Frequency Vector -->
  <g transform="translate(650, 80)">
    <rect x="0" y="0" width="160" height="180" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <text x="80" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#15803d">4. TF Vector</text>
    <text x="15" y="60" font-size="10" fill="#334155">• Build Term Frequencies</text>
    <text x="15" y="85" font-size="10" fill="#334155">• Sparse token map</text>
    <text x="15" y="110" font-size="10" fill="#334155">tf[term] = count</text>
    <text x="15" y="140" font-size="10" fill="#334155">Normalized L2 norm:</text>
    <text x="15" y="160" font-size="9" fill="#15803d">||tf|| = √(∑ (tf_i)²)</text>
  </g>

  <line x1="810" y1="170" x2="850" y2="170" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Step 5: Cosine Similarity & Identifier Bonuses -->
  <g transform="translate(850, 80)">
    <rect x="0" y="0" width="290" height="180" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="2"/>
    <text x="145" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#9d174d">5. Cosine Metric &amp; Bonuses</text>
    <text x="15" y="55" font-size="10" fill="#334155">sim = (tf_A · tf_B) / (||tf_A|| × ||tf_B||)</text>
    <line x1="15" y1="68" x2="275" y2="68" stroke="#fbcfe8"/>
    <text x="15" y="90" font-size="10" font-weight="bold" fill="#831843">Identifier Boosts:</text>
    <text x="15" y="110" font-size="10" fill="#9d174d">• Identical CVE Match: +0.15</text>
    <text x="15" y="130" font-size="10" fill="#9d174d">• Identical CWE Match: +0.05</text>
    <text x="15" y="150" font-size="10" fill="#9d174d">• Identical Category Match: +0.03</text>
    <text x="15" y="170" font-size="9" fill="#64748b">Final Score = min(1.0, sim + boosts)</text>
  </g>

  <!-- Step 6: Threshold Decision Gate (Bottom) -->
  <g transform="translate(300, 310)">
    <rect x="0" y="0" width="600" height="160" rx="10" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
    <text x="300" y="32" text-anchor="middle" font-size="13" font-weight="bold" fill="#38bdf8">DECISION ENGINE (Configurable Threshold θ = 0.75)</text>
    <line x1="30" y1="45" x2="570" y2="45" stroke="#334155"/>

    <text x="40" y="75" font-size="12" fill="#e2e8f0">If <tspan font-weight="bold" fill="#fbbf24">similarity ≥ θ</tspan>:</text>
    <text x="60" y="98" font-size="11" fill="#f87171">• Flag <tspan font-weight="bold">isPotentialDuplicate = true</tspan></text>
    <text x="60" y="118" font-size="11" fill="#f87171">• Link top 5 candidates with similarity scores &amp; diff metadata</text>
    <text x="60" y="138" font-size="11" fill="#f87171">• Alert triage analyst with non-blocking confirmation dialog</text>

    <line x1="340" y1="60" x2="340" y2="145" stroke="#475569" stroke-dasharray="3,3"/>

    <text x="360" y="75" font-size="12" fill="#e2e8f0">If <tspan font-weight="bold" fill="#34d399">similarity &lt; θ</tspan>:</text>
    <text x="380" y="98" font-size="11" fill="#4ade80">• Proceed to Classification &amp; Validation</text>
    <text x="380" y="118" font-size="11" fill="#4ade80">• Avoid duplicate work &amp; alert fatigue</text>
  </g>

  <path d="M 995 260 L 995 390 L 900 390" fill="none" stroke="#334155" stroke-width="2.5" marker-end="url(#arrow)"/>
</svg>`;

fs.writeFileSync(path.join(figuresDir, 'fig5_duplicate_pipeline.svg'), fig5Svg);

console.log('All SVG figures generated successfully in paper/figures/');
