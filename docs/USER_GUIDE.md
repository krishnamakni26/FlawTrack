# FlawTrack User Guide & Operations Manual

Welcome to **FlawTrack — Smart Cybersecurity Vulnerability Reporting & Management System**.

---

## 1. Quick Start & Access

The application runs locally on:
- **Frontend Dashboard:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:5000/api/v1`

### Default System Accounts:
- **Security Administrator:** `admin@flawtrack.local` / `Password123!`
- **Senior Security Analyst:** `analyst1@flawtrack.local` / `Password123!`
- **Junior Security Analyst:** `analyst2@flawtrack.local` / `Password123!`
- **Security Researcher / Reporter:** `reporter1@flawtrack.local` / `Password123!`

---

## 2. Guide for Vulnerability Reporters

Reporters can submit findings from automated scanners (Nmap, Nessus, OpenVAS, Burp Suite) or manual penetration tests, track triage progress, and answer clarification questions.

### 2.1 Submitting a Vulnerability Finding
1. Log in with your reporter credentials.
2. Click **"+ Submit Finding"** in the sidebar.
3. Fill out the report form:
   - **Vulnerability Title:** A concise description of the security issue.
   - *Duplicate Hint Notice:* When typing the title, if a similar finding already exists in the system, an amber banner will appear showing the similarity percentage. You may still proceed with submission if your finding is distinct.
   - **Target Asset:** Select the affected organizational system from the dropdown.
   - **Category:** Select the vulnerability class (e.g. Remote Code Execution, SQL Injection, Auth Bypass, SSRF, XSS).
   - **Steps to Reproduce:** Provide step-by-step reproduction instructions, HTTP payloads, or CLI commands.
   - **Impact Description:** Describe the business risk (e.g., credential theft, database exfiltration).
   - **Proof of Concept Attachments:** Drag and drop screenshots, HTTP request logs, or configuration files (max 10MB each; supported formats: PNG, JPG, PDF, TXT, LOG, JSON, ZIP).
4. Click **"Submit Vulnerability Report"**.

### 2.2 Tracking My Reports & Responding to Needs Info
1. Navigate to **"My Reports"** in the sidebar.
2. View your active submissions, current status badges (`SUBMITTED`, `UNDER_VALIDATION`, `NEEDS_INFO`, `IN_PROGRESS`, `CLOSED`), and assigned priorities.
3. If an analyst requests clarification, the status badge will indicate **`NEEDS_INFO`** with an amber **"Respond"** button:
   - Click **"Respond"** to review the analyst's question.
   - Type your additional context or updated reproduction notes.
   - Click **"Submit Response"**. The status immediately returns to `UNDER_VALIDATION` for analyst triage.

---

## 3. Guide for Security Analysts

Analysts manage the Priority Queue, validate exploitability, compute CVSS and contextual risk, assign engineers, and verify patches.

### 3.1 Managing the Priority Queue
1. Log in with your analyst account.
2. Navigate to **"Priority Queue"** (`/queue`).
3. The queue displays findings ordered by contextual risk score:
   - **Priority Badges:** P1 (Critical - Red), P2 (High - Amber), P3 (Medium - Yellow), P4 (Low - Green).
   - **SLA Countdown:** Live countdown displaying remaining hours or `BREACHED` flags.
   - **Threat Intel Flags:** CISA KEV active exploit tags and EPSS probability percentages.
4. Filter by priority, status, duplicate candidates, SLA breached only, or CISA KEV exploited findings.
5. Click **"Assign to me"** for quick claiming, or click **"Triage"** to open the detail view.

### 3.2 The 13-Stage Vulnerability Detail Hub
The detail page is structured into operational tabs:
1. **Overview:** Review technical descriptions, reproduction steps, asset criticality, network exposure, and download attachments.
2. **Validation:** Review findings and record verdicts:
   - *Validate:* Confirms exploitability and moves status to `VALIDATED`.
   - *Needs Info:* Prompts the reporter for additional reproduction evidence (`NEEDS_INFO`).
   - *Reject:* Dismisses non-reproducible or policy-compliant submissions (`REJECTED`).
3. **Duplicates:** Reviews potential duplicate candidates identified by the NLP TF-IDF cosine similarity engine.
   - *Confirm Duplicate:* Marks submission as `DUPLICATE` and links to the canonical record.
   - *Dismiss:* Discards duplicate alert if finding is unique.
4. **Classification & CVSS:**
   - Record CVE ID, CWE ID, and Category.
   - Click **"Open Vector Builder"** to calculate official CVSS v3.1 base scores with live feedback.
5. **Threat Intelligence:**
   - Click **"Pull Fresh Threat Intel"** to retrieve live FIRST.org EPSS and CISA KEV catalog telemetry.
6. **Risk & What-If:**
   - Click **"Recompute Risk Engine"** to generate the 0–100 score, P1–P4 priority, component breakdown chart, and human-readable explanation narrative.
   - Use the interactive **What-If Risk Simulator** to test how changing asset criticality or network exposure alters the final score.
7. **Remediation:** Assign security engineers and log technical fix notes.
8. **Re-test & Verification:**
   - *Passed:* Confirms the vulnerability is resolved; transitions state to `VERIFIED` and `CLOSED`.
   - *Failed:* Confirms the vulnerability persists; transitions state to `REOPENED` and alerts the assignee.
9. **Audit Timeline:** View an immutable audit log of all historical events and status transitions.

---

## 4. Guide for Security Administrators

Administrators maintain system health, manage users, provision assets, calibrate risk weights, and trigger background daemons.

### 4.1 Security Dashboard
Navigate to **"Security Dashboard"** (`/dashboard`) for real-time visibility:
- Active open findings, P1 count, and CISA KEV exploited vulnerabilities.
- SLA compliance percentage and overdue watchlist.
- Priority distribution donut, lifecycle status funnel, and weekly ingestion trend line.
- Top 10 Risky Assets ranking.

### 4.2 Asset Inventory Management
Navigate to **"Asset Inventory"** (`/admin/assets`):
- Click **"Register New Asset"** to define system name, environment (`production`, `staging`, `development`, `test`), business criticality (1–5), data sensitivity (1–5), and network exposure (`Internet Facing`).

### 4.3 User Provisioning & RBAC
Navigate to **"User Management"** (`/admin/users`):
- Provision new system accounts with explicit roles (`REPORTER`, `ANALYST`, `ADMIN`).
- Update assigned roles or activate/deactivate accounts.

### 4.4 System Calibration & Risk Formula Settings
Navigate to **"System Settings"** (`/admin/settings`):
- Adjust the mathematical weights for CVSS, EPSS, KEV, Asset Criticality, Business Impact, and Exposure. The system enforces that all weights sum to exactly `1.00`.
- Configure score thresholds for P1, P2, and P3 tiers.
- Set SLA remediation target hours for each priority tier.
- Adjust NLP duplicate detection cosine similarity sensitivity.

### 4.5 Background Job Control
Navigate to **"Job Control"** (`/admin/jobs`):
- Trigger **SLA Monitor** or **Threat Intelligence Refresh** on demand with live execution logging.

### 4.6 Forensic Audit Logs
Navigate to **"Audit Log"** (`/admin/audit`):
- Search and filter tamper-proof logs by actor, action, entity type, and date range.
- Expand any record to inspect exact JSON state before and after the operation.
- Click **"Export CSV"** for compliance audits.
