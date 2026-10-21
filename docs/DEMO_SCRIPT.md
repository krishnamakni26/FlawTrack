# FlawTrack Live Demonstration Script & Walkthrough

This demo script demonstrates the full 13-stage vulnerability management lifecycle, NLP duplicate detection, contextual risk prioritization, SLA automation, and immutable auditing.

---

## Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@flawtrack.local` | `Password123!` | Full platform administration, settings, user management, audit logs |
| **Senior Analyst** | `analyst1@flawtrack.local` | `Password123!` | Triage, validation, CVSS, threat intelligence, assignment, retest |
| **Junior Analyst** | `analyst2@flawtrack.local` | `Password123!` | Triage, remediation notes, retest |
| **Reporter** | `reporter1@flawtrack.local` | `Password123!` | Submit vulnerabilities, view own reports, answer info inquiries |

---

## Phase 1: Real-Time Duplicate Detection on Submission

1. Open `http://localhost:5173/login` in your browser.
2. Click **"Reporter (Submitter)"** quick-fill button, then click **"Sign in to Platform"**.
3. In the sidebar, click **"+ Submit Finding"**.
4. In the **Vulnerability Title** field, type:
   ```text
   SQL Injection in User Login Parameter
   ```
5. Pause typing for 1.5 seconds.
6. **Observe:** An amber banner appears at the top:
   > **Duplicate Candidate Detected (88% Match)**
   > "A similar vulnerability already exists in the system: 'SQL Injection in User Login Parameter'. Your finding will be flagged for analyst review."
7. Complete the submission by selecting:
   - Target Asset: `Customer Portal Web App`
   - Category: `SQL Injection`
   - Steps to Reproduce: `Send admin' OR 1=1-- payload to username field.`
   - Impact: `Authentication bypass.`
8. Click **"Submit Vulnerability Report"**.

---

## Phase 2: Analyst Triage & Duplicate Confirmation

1. Log out and log in as **`analyst1@flawtrack.local`**.
2. Navigate to **"Priority Queue"** in the sidebar.
3. Check the checkbox for **"Duplicate Candidates Only"**.
4. Open the newly submitted finding by clicking **"Triage"**.
5. Switch to the **"Duplicates"** tab.
6. **Observe:** The NLP Cosine Similarity score is displayed side-by-side with the original report.
7. Click **"Confirm Duplicate"**. The status moves to `DUPLICATE` and links to the canonical finding.

---

## Phase 3: Technical Validation & CVSS v3.1 Scoring

1. Open the unranked finding **"Apache Log4j JNDI Remote Code Execution"** on the `Core Banking API Gateway`.
2. Go to the **"Validation"** tab:
   - Select **"Validate (Exploitable)"**.
   - Enter notes: `Confirmed exploitability using ldap payload against test header.`
   - Click **"Record Validation Verdict"**. (Status moves to `VALIDATED`).
3. Switch to the **"Classification & CVSS"** tab:
   - Set CVE ID: `CVE-2021-44228`.
   - Set Category: `Remote Code Execution`.
   - Click **"Open Vector Builder"**.
   - Select Attack Vector: **Network (N)**, Privileges: **None (N)**, Impact: **High/High/High (H/H/H)**, Scope: **Changed (C)**.
   - Observe live base score: **10.0 (CRITICAL)**.
   - Click **"Apply Vector & Save Score"**.

---

## Phase 4: Live Threat Intelligence (EPSS & CISA KEV)

1. Switch to the **"Threat Intelligence"** tab.
2. Click **"Pull Fresh Threat Intel"**.
3. **Observe:**
   - **FIRST.org EPSS Score:** `97.5%` (Percentile: `99.9%` — Top tier wild exploit probability).
   - **CISA KEV Catalog Status:** Flashing red badge: `ACTIVELY EXPLOITED` (Date added: `2021-12-10`).

---

## Phase 5: Context-Aware Prioritization & Explainability

1. Switch to the **"Risk & What-If"** tab.
2. Click **"Recompute Risk Engine"**.
3. **Observe:**
   - **Score:** `99.5 / 100` &rarr; **Priority: P1 Critical**.
   - **Explainability Narrative:**
     > *"P1 Critical (Score 99.5) — CVSS 10.0 (CRITICAL), EPSS 97.5% (top 1% likelihood of exploitation), listed in CISA KEV (actively exploited in the wild). Target asset 'Core Banking API Gateway' is a Criticality 5, Internet-facing Production system handling tier 5 sensitive banking data."*
   - Component Breakdown Chart illustrates weighted points from CVSS, EPSS, KEV, Asset Criticality, Business Impact, and Exposure.

---

## Phase 6: Proving Context-Aware Differences (Test Server vs Production)

1. Return to the **Priority Queue**.
2. Find finding #6: **"Apache Log4j JNDI Lookup in Isolated Security Lab Test Server"**.
3. Notice that while both vulnerabilities share the exact same CVE (`CVE-2021-44228`, CVSS 10.0, KEV listed):
   - **Production Asset:** Yields **Score 99.5 (P1 Critical)** with **24-hour SLA**.
   - **Isolated Test Asset:** Yields **Score 70.5** with internal non-production context.

---

## Phase 7: Dynamic What-If Risk Simulator

1. On the vulnerability detail page for Log4j on the Production asset, scroll to the **"What-If Risk Simulator"** widget.
2. Drag the **Asset Criticality** slider from `5` down to `1`.
3. Toggle **Internet Facing** from `Public (1.0)` to `Internal (0.4)`.
4. **Observe:** The simulated risk score recomputes client-side in real-time, dropping from `99.5` to `65.5` and shifting the priority from **P1** to **P2**.

---

## Phase 8: Assignment & Automated SLA Tracking

1. Go to the **"Remediation"** tab.
2. Select `Sarah Connor (analyst1@flawtrack.local)` and click **"Assign"**.
3. Click **"Update Status Workflow"** &rarr; select **"IN_PROGRESS"**.
4. In the top banner, observe the **SLA Countdown Badge**:
   - For P1: Shows hours remaining against the 24-hour deadline.
   - If approaching 75% elapsed (18 hours): Turns **Amber (Warning)**.
   - If past deadline: Turns **Red (BREACHED)**.

---

## Phase 9: Remediation, Re-test Failure (Reopen) & Pass (Close)

1. Under **"Remediation Log"**, add a note: `Applied log4j-core 2.17.1 patch to staging cluster.`
2. Change status to **"RESOLVED"**.
3. Change status to **"RETEST"**.
4. Go to **"Re-test & Verification"** tab:
   - Select **"Failed (Vulnerability Persists)"**.
   - Notes: `Re-tested with test harness; JNDI lookup still executes.`
   - Click **"Record Verification Result"**.
   - **Observe:** Status automatically transitions to **`REOPENED`**, reopen count increments to `1`, and an alert is dispatched to the assignee.
5. Apply second fix, transition back to `RESOLVED` &rarr; `RETEST`.
6. Select **"Passed (Fix Confirmed)"** &rarr; status updates to **`VERIFIED`** and then **`CLOSED`**.

---

## Phase 10: Automatic Threat Refresh & Escalation

1. Log in as **`admin@flawtrack.local`**.
2. Navigate to **"Job Control"** (`/admin/jobs`).
3. Click **"Run Now"** on **"Threat Intelligence Refresh"**.
4. **Observe:** The daemon sweeps all active vulnerabilities, refreshes EPSS/KEV, recalculates risk scores, and automatically escalates priorities when new threat indicators appear.

---

## Phase 11: Immutable Audit Trail Verification

1. Navigate to **"Audit Log"** (`/admin/audit`).
2. Review the chronological trail:
   - Every login, report submission, validation, CVSS update, threat refresh, assignment, status transition, SLA warning, and retest verdict is recorded with timestamps, actor IDs, and IP addresses.
3. Click on any log entry to expand and view the exact **State Before** and **State After** JSON payload.
4. Click **"Export CSV"** to download the forensic audit report.
