# FlawTrack 13-Stage Vulnerability Management Methodology & Risk Mathematics

## 1. The 13-Stage Lifecycle Methodology

Traditional vulnerability tools function as static scanners or dumb bug trackers. FlawTrack operates as an active vulnerability governance and decision engine enforcing a strict 13-stage methodology:

| Stage # | Lifecycle Stage | Description & Engine Execution |
|---|---|---|
| **1** | **Discovery** | External reconnaissance / scanning (Nmap, Nessus, OpenVAS, Burp Suite, or manual pentesting). The discovery source is tagged on ingestion. |
| **2** | **Reporting** | Structured report creation with title, description, reproduction steps, business impact, affected users, network exposure, and PoC attachments. |
| **3** | **Validation** | Security analyst reviews exploitability. Triage verdicts: `VALIDATED` (proceeds), `NEEDS_INFO` (returns to reporter), or `REJECTED` (closed). |
| **4** | **Deduplication** | Natural Language Processing (NLP) extracts stemmed terms, removes stopwords, applies TF-IDF vectorization, and computes Cosine Similarity against active vulnerabilities. |
| **5** | **Classification** | Identification of CVE ID, CWE ID, and categorization (RCE, SQL Injection, Auth Bypass, SSRF, XSS, etc.). |
| **6** | **Severity (CVSS)** | Official CVSS v3.1 base score computation from vector strings (AV, AC, PR, UI, S, C, I, A), handling Scope changes and official RoundUp logic. |
| **7** | **Threat Analysis** | Ingestion of live exploit telemetry: FIRST.org Exploit Prediction Scoring System (EPSS) and CISA Known Exploited Vulnerabilities (KEV) catalog. |
| **8** | **Context Risk** | Contextual mapping: Asset Criticality (1–5), Business Impact, Sensitive Data tier (1–5), and Network Exposure (Public vs Internal). |
| **9** | **Risk Score (P1–P4)** | Continuous mathematical scoring (0–100) mapped to operational priorities with a natural-language explainability narrative. |
| **10** | **SLA & Assignment** | Automatic calculation of remediation deadline (`sla.dueAt`). Assignment to dedicated security engineer. |
| **11** | **Remediation** | Patching and mitigation status tracking (`IN_PROGRESS` &rarr; `RESOLVED`) with historical remediation notes. |
| **12** | **Re-test Verification** | Verification testing. Pass moves report to `VERIFIED` &rarr; `CLOSED`. Failure triggers `REOPENED` with alert to assignee and incremented reopen counter. |
| **13** | **Continuous Monitoring** | Automated daily cron threat intelligence refresh. Re-evaluates risk scores and escalates priorities (e.g., P3 &rarr; P1 upon KEV addition). |

---

## 2. Contextual Risk Score Mathematical Formula

FlawTrack normalizes all technical, threat, and business dimensions onto a uniform **0.0 to 1.0** scale:

### 2.1 Component Normalization

1. **CVSS Normalization ($cvssN$):**
   $$cvssN = \frac{cvssBaseScore}{10.0} \quad \in [0.0, 1.0]$$

2. **EPSS Normalization ($epssN$):**
   $$epssN = epssScore \quad \in [0.0, 1.0]$$

3. **CISA KEV Normalization ($kevN$):**
   $$kevN = \begin{cases} 1.0 & \text{if CVE is in CISA KEV catalog} \\ 0.0 & \text{otherwise} \end{cases}$$

4. **Asset Criticality Normalization ($assetCriticalityN$):**
   $$assetCriticalityN = \frac{\text{criticality} - 1}{4.0} \quad (\text{for criticality } \in [1, 5])$$

5. **Business Impact Normalization ($businessImpactN$):**
   Combines affected user reach ($\log_{10}$ scale) and data sensitivity ($1–5$):
   $$userFactor = \min\left(1.0, \frac{\log_{10}(\text{affectedUsers} + 1)}{6.0}\right)$$
   $$dataSensFactor = \frac{\text{dataSensitivity} - 1}{4.0}$$
   $$businessImpactN = 0.6 \cdot dataSensFactor + 0.4 \cdot userFactor \quad \in [0.0, 1.0]$$

6. **Network Exposure Normalization ($exposureN$):**
   - Internet-facing Production: **1.0**
   - Internet-facing Non-production: **0.7**
   - Internal Network: **0.4**
   - Isolated / Air-gapped Sandbox: **0.1**

---

### 2.2 The Weighted Formula

$$\text{RiskScore} = 100 \times \Big( w_{\text{cvss}} \cdot cvssN + w_{\text{epss}} \cdot epssN + w_{\text{kev}} \cdot kevN + w_{\text{asset}} \cdot assetCriticalityN + w_{\text{biz}} \cdot businessImpactN + w_{\text{exp}} \cdot exposureN \Big)$$

#### Default System Weights (Must sum to 1.00):
- $w_{\text{cvss}} = 0.30$ (Technical Severity)
- $w_{\text{epss}} = 0.20$ (Exploit Probability)
- $w_{\text{kev}} = 0.20$ (Active Weaponization in Wild)
- $w_{\text{asset}} = 0.15$ (Asset Criticality)
- $w_{\text{biz}} = 0.10$ (Business Reach & Data Tier)
- $w_{\text{exp}} = 0.05$ (Network Exposure)

---

### 2.3 Priority Mapping & Safety Policy Overrides

The continuous score (0–100) maps directly to operational triage tiers:
- **P1 Critical:** Score $\ge 70.0$
- **P2 High:** Score $50.0 - 69.99$
- **P3 Medium:** Score $30.0 - 49.99$
- **P4 Low:** Score $< 30.0$

#### Deterministic Safety Overrides:
1. **Active Wild Exploit Override:** Any vulnerability listed in the CISA KEV catalog residing on an internet-facing asset is automatically floored at **P1 Critical**, regardless of theoretical score.
2. **Critical Flaw Floor:** Any vulnerability with CVSS $\ge 9.0$ is floored at **P2 High** minimum to prevent severe remote code execution flaws from being deprioritized on lower-tier assets.

---

## 3. SLA Targets & Escalation Matrix

Remediation countdown starts the moment an analyst moves the finding to `PRIORITIZED`:

| Priority Tier | Default SLA Target | Warning Trigger (75% Elapsed) | Breach Escalation (100% Elapsed) |
|---|---|---|---|
| **P1 Critical** | **24 Hours** (1 day) | At 18 hours | Mark breached, alert SecOps lead & admins |
| **P2 High** | **72 Hours** (3 days) | At 54 hours | Mark breached, send email alert |
| **P3 Medium** | **168 Hours** (7 days) | At 126 hours | Mark breached, flag on dashboard |
| **P4 Low** | **720 Hours** (30 days) | At 540 hours | Mark breached |
