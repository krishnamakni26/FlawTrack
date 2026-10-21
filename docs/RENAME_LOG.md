# FlawTrack Rebrand Audit Log — docs/RENAME_LOG.md

This document tracks the complete transition and rebranding of the application from **VulnTrack** to **FlawTrack**.

---

## 1. Scope & Working Rules
- **Brand Only**: Only brand references (`VulnTrack`, `Vulntrack`, `vulntrack`, `VULNTRACK`, `Vuln Track`, `vuln_track`, `vuln-track`, `VT`) are rebranded to `FlawTrack` / `FT`.
- **Preserved Domain Concepts**: Generic security terminology is strictly untouched: the `Vulnerability` model, `/api/vulnerabilities` routes, `vulnerabilityId`, UI labels ("Vulnerability Detail", "Submit Vulnerability"), and phrases such as "vulnerability management".
- **Zero Fabrication**: All test benchmarks, evaluation metrics, and paper formatting guarantees are strictly maintained.

---

## 2. Phase 1 — Pre-Rename Audit ("Before" Inventory)

The repository was searched case-insensitively for the pattern `vuln[-_ .]?trac?k` and the logo initials `VT`.

### A. Frontend
- **Page Titles & Meta**:
  - `frontend/index.html`: `<title>VulnTrack — Cybersecurity Vulnerability Management</title>`
- **UI Branding**:
  - `frontend/src/components/common/Navbar.jsx`: Brand span text `VulnTrack`
  - `frontend/src/pages/auth/LoginPage.jsx`: Header title `VulnTrack`, subtitle `Smart Vulnerability Management System`
  - `frontend/src/pages/auth/RegisterPage.jsx`: Header text `VulnTrack Vulnerability Disclosure Platform`
  - `frontend/src/pages/admin/UserManagementPage.jsx`: Form email placeholder `analyst@vulntrack.local`
  - `frontend/src/pages/admin/AuditLogPage.jsx`: CSV export filename `vulntrack_audit_log.csv`
- **Storage Keys**:
  - `frontend/src/api/axiosClient.js`: `vt_access_token`, `vt_refresh_token`, `vt_user`
  - `frontend/src/context/AuthContext.jsx`: `vt_access_token`, `vt_refresh_token`, `vt_user`
- **Package Configuration**:
  - `frontend/package.json`: `"name": "vulntrack-frontend"`
  - `frontend/package-lock.json`: `"name": "vulntrack-frontend"`

### B. Backend
- **Package Configuration**:
  - `backend/package.json`: `"name": "vulntrack-backend"`
  - `backend/package-lock.json`: `"name": "vulntrack-backend"`
- **Server Identity & Health Checks**:
  - `backend/src/app.js`: Health endpoint response `service: 'VulnTrack API v1'`
  - `backend/src/server.js`: Server startup log `VulnTrack Backend Server running on port...`
  - `backend/src/config/constants.js`: Top docblock `VulnTrack System Constants`
- **Audit & Email Services**:
  - `backend/src/services/notification.service.js`: Subject prefix `[VulnTrack Alert]`, title `VulnTrack Notification`, link text `View Vulnerability in VulnTrack`, footer `automated security notification from VulnTrack`
  - `backend/src/controllers/audit.controller.js`: Export header `filename="vulntrack-audit-log.csv"`

### C. Database & Configuration
- **Default Database URIs**:
  - `backend/src/config/env.js`: `mongodb://localhost:27017/vulntrack`
  - `backend/.env.example`: `MONGODB_URI=mongodb://localhost:27017/vulntrack`, `SMTP_FROM=vulntrack-alerts@example.com`
  - `backend/.env`: `MONGODB_URI=mongodb://localhost:27017/vulntrack`, `SMTP_FROM=vulntrack-alerts@example.com`
  - `docker-compose.yml`: `container_name: vulntrack-mongodb`, `MONGO_INITDB_DATABASE: vulntrack`, `container_name: vulntrack-backend`, `MONGODB_URI=mongodb://mongodb:27017/vulntrack`, `container_name: vulntrack-frontend`

### D. Seed & Demo Data
- **Seed Scripts (`backend/scripts/seed.js`)**:
  - Log: `Starting VulnTrack database seed...`
  - Audit user-agent: `VulnTrack Cron SLA Monitor`
  - Seed user emails:
    - `admin@vulntrack.local`
    - `analyst1@vulntrack.local`
    - `analyst2@vulntrack.local`
    - `reporter1@vulntrack.local`
  - Completion summary banner: `VulnTrack Database Seeding Completed Successfully!`
- **Verification Script (`backend/scripts/e2e-verify.js`)**:
  - Banner: `--- VULNTRACK LIVE SERVER VERIFICATION ---`
  - Admin login payload: `admin@vulntrack.local`
- **UI Quick-Fill Buttons (`frontend/src/pages/auth/LoginPage.jsx`)**:
  - Preset credential buttons for `admin@vulntrack.local`, `analyst1@vulntrack.local`, `analyst2@vulntrack.local`, `reporter1@vulntrack.local`

### E. Tests & Fixtures
- `backend/tests/integration/vulnerabilityLifecycle.test.js`:
  - `reporter@vulntrack.local`, `analyst@vulntrack.local`, `admin@vulntrack.local`
- `backend/tests/unit/notification.test.js`:
  - `alerts@vulntrack.local`, `test@vulntrack.local`

### F. Documentation & Launcher
- `launcher.bat`: Title and banners `VulnTrack System Launcher`, `VULNTRACK -- Smart Cybersecurity Vulnerability Management System`, `VulnTrack Backend Server [Port 5000]`
- `README.md`: Title `# VulnTrack — Smart Cybersecurity Vulnerability Reporting & Management System`, diagrams, installation guides, seed credentials
- `docs/API.md`: Header and base URL descriptions
- `docs/ARCHITECTURE.md`: Architecture diagrams and service breakdowns
- `docs/ASSUMPTIONS.md`: Project assumptions
- `docs/BUGFIX_LOG.md`: Historical bugfix logs
- `docs/DEMO_SCRIPT.md`: Step-by-step walkthroughs with seed accounts
- `docs/METHODOLOGY.md`: 13-stage lifecycle documentation
- `docs/SECURITY.md`: Threat model and security controls
- `docs/USER_GUIDE.md`: Role workflows and triage instructions

### G. Academic Paper (`paper/`)
- **Deliverable Files**:
  - `paper/VulnTrack_Paper.docx`
  - `paper/VulnTrack_Paper.pdf`
- **Figures with Embedded Brand Text**:
  - `paper/figures/fig1_methodology_flowchart.svg`
  - `paper/figures/fig2_system_architecture.svg`
  - `paper/figures/fig3_er_datamodel.svg`
  - `paper/figures/fig4_state_machine.svg`
  - `paper/figures/fig5_duplicate_pipeline.svg`
  - `paper/figures/fig8_cvss_vs_vulntrack_ranking.svg` (and `.png`)
  - `paper/figures/fig9_dashboard_workflow.svg`
- **Scripts & Paper Text**:
  - `paper/experiments/build_docx.js`
  - `paper/experiments/build_pdf.js`
  - `paper/experiments/duplicate_experiment.js`
  - `paper/experiments/risk_comparison.js`
  - `paper/experiments/generate_figures.js`
  - `paper/experiments/rasterize_pdf.js`
  - `paper/CHECKLIST.md`
  - `paper/NOTES.md`
  - `paper/UNVERIFIED.md`
  - `paper/evidence/risk_comparison_results.json`
  - `paper/evidence/risk_comparison_table.txt`
  - `paper/evidence/duplicate_experiment_table.txt`

---

## 3. Ambiguous Decisions & Resolutions
- **Decision 1: Token Storage Keys**:
  - *Context*: `vt_access_token`, `vt_refresh_token`, `vt_user` in `localStorage`.
  - *Resolution*: Renamed to `ft_access_token`, `ft_refresh_token`, `ft_user`. Any active session in the browser will experience a clean one-time logout and re-authentication with new seed accounts.
- **Decision 2: Email Domain**:
  - *Context*: Seed accounts used `@vulntrack.local`.
  - *Resolution*: Mapped directly to `@flawtrack.local` across database seeds, tests, login buttons, documentation, and demo scripts.
- **Decision 3: Academic Paper Identity**:
  - *Context*: The paper title is *Context-Aware Vulnerability Prioritization and Automated Lifecycle Management: A Unified Threat-Informed Architecture*. The system evaluated is named *VulnTrack*.
  - *Resolution*: Rename the system name to *FlawTrack* across abstract, body text, tables, figures, captions, and file names (`FlawTrack_Paper.docx`, `FlawTrack_Paper.pdf`).

## 4. Phase 2 Execution Record — Files Changed by Category

### A. Frontend
- `frontend/package.json`: `"name": "flawtrack-frontend"`
- `frontend/package-lock.json`: `"name": "flawtrack-frontend"`
- `frontend/index.html`: `<title>FlawTrack — Cybersecurity Vulnerability Management</title>`
- `frontend/src/components/common/Navbar.jsx`: Brand title `FlawTrack`
- `frontend/src/pages/auth/LoginPage.jsx`: Header `FlawTrack`, subtitle `Smart Vulnerability Management System`, quick-fill buttons and placeholders updated to `@flawtrack.local`
- `frontend/src/pages/auth/RegisterPage.jsx`: Subtitle `FlawTrack Vulnerability Disclosure Platform`
- `frontend/src/pages/admin/UserManagementPage.jsx`: Form placeholder `analyst@flawtrack.local`
- `frontend/src/pages/admin/AuditLogPage.jsx`: CSV export filename `flawtrack_audit_log_*.csv`
- `frontend/src/api/axiosClient.js`: Storage keys `ft_access_token`, `ft_refresh_token`, `ft_user`
- `frontend/src/context/AuthContext.jsx`: Storage keys `ft_access_token`, `ft_refresh_token`, `ft_user`
- `frontend/src/api/resources.api.js`: Added aliases `getUsers`, `createUser`, `updateUser` for seamless RBAC administration

### B. Backend
- `backend/package.json`: `"name": "flawtrack-backend"`
- `backend/package-lock.json`: `"name": "flawtrack-backend"`
- `backend/src/app.js`: Health response `service: 'FlawTrack API v1'`
- `backend/src/server.js`: Startup banner `FlawTrack Backend Server running on port...`
- `backend/src/config/constants.js`: Top docblock `FlawTrack System Constants`
- `backend/src/config/env.js`: Default DB `mongodb://localhost:27017/flawtrack`, SMTP `flawtrack-alerts@example.com`
- `backend/src/services/notification.service.js`: Subject prefix `[FlawTrack Alert]`, HTML templates with FlawTrack branding
- `backend/src/controllers/audit.controller.js`: Export header `filename="flawtrack-audit-log.csv"`
- `backend/scripts/seed.js`: Seed script with `@flawtrack.local` accounts and completion banner
- `backend/scripts/e2e-verify.js`: Verification header and login payloads updated to `FlawTrack` and `@flawtrack.local`
- `backend/tests/integration/vulnerabilityLifecycle.test.js`: Test reporter/analyst/admin emails updated to `@flawtrack.local`
- `backend/tests/unit/notification.test.js`: Notification test recipient addresses updated to `@flawtrack.local`

### C. DevOps, Database & Root Configuration
- `docker-compose.yml`: Services and containers `flawtrack-mongodb`, `flawtrack-backend`, `flawtrack-frontend`, DB `flawtrack`
- `backend/.env.example`: `mongodb://localhost:27017/flawtrack`, `flawtrack-alerts@example.com`
- `backend/.env`: `mongodb://localhost:27017/flawtrack`, `flawtrack-alerts@example.com`
- `launcher.bat`: All window titles, banners, and credentials updated to FlawTrack
- `README.md`: Title, diagrams, seed credentials, database migration note, and documentation links

### D. Documentation (`docs/`)
- `docs/API.md`: Updated title to `# FlawTrack REST API Reference (v1)`
- `docs/ARCHITECTURE.md`: Updated overview to `FlawTrack is an enterprise-grade cybersecurity...`
- `docs/ASSUMPTIONS.md`: Updated default database connection URI to `flawtrack`
- `docs/BUGFIX_LOG.md`: Updated title to `# FlawTrack — Bug-Fix Log`
- `docs/DEMO_SCRIPT.md`: Updated title, demo credential table, and walkthrough steps to `@flawtrack.local`
- `docs/METHODOLOGY.md`: Updated title and operational narrative to FlawTrack
- `docs/SECURITY.md`: Updated AppSec architecture and npm audit review to FlawTrack
- `docs/USER_GUIDE.md`: Updated header and system account listings to `@flawtrack.local`

### E. Academic Paper Deliverables & Evidence (`paper/`)
- Renamed deliverables:
  - `paper/VulnTrack_Paper.docx` &rarr; `paper/FlawTrack_Paper.docx`
  - `paper/VulnTrack_Paper.pdf` &rarr; `paper/FlawTrack_Paper.pdf`
- Renamed figures:
  - `paper/figures/fig8_cvss_vs_vulntrack_ranking.svg` &rarr; `paper/figures/fig8_cvss_vs_flawtrack_ranking.svg`
  - `paper/figures/fig8_cvss_vs_vulntrack_ranking.png` &rarr; `paper/figures/fig8_cvss_vs_flawtrack_ranking.png`
- Updated SVG figures with FlawTrack title text:
  - `paper/figures/fig1_methodology_flowchart.svg`
  - `paper/figures/fig2_system_architecture.svg`
  - `paper/figures/fig3_er_datamodel.svg`
  - `paper/figures/fig4_state_machine.svg`
  - `paper/figures/fig5_duplicate_pipeline.svg`
  - `paper/figures/fig8_cvss_vs_flawtrack_ranking.svg`
  - `paper/figures/fig9_dashboard_workflow.svg` (including console URL `https://flawtrack.internal/dashboard`)
- Re-rendered all PNG figures via `paper/experiments/fix_entities_and_render.js`
- Updated compilation scripts:
  - `paper/experiments/build_docx.js` (28 instances replaced, output: `FlawTrack_Paper.docx`, 898 KB)
  - `paper/experiments/build_pdf.js` (28 instances replaced, output: `FlawTrack_Paper.pdf`, 1068 KB, exactly 8 pages)
  - `paper/experiments/duplicate_experiment.js`
  - `paper/experiments/risk_comparison.js`
  - `paper/experiments/rasterize_pdf.js`
  - `paper/experiments/test_img_size.js`
- Re-run validation experiments:
  - `paper/evidence/duplicate_experiment_table.txt`: Header updated to `FLAWTRACK DUPLICATE DETECTION PERFORMANCE`
  - `paper/evidence/risk_comparison_table.txt`: Header updated to `FLAWTRACK MULTI-FACTOR RISK ENGINE VS CVSS-ONLY COMPARISON`
  - `paper/evidence/risk_comparison_results.json`: Keys mapped to `flawTrackScore` and `flawTrackPriority`
- Updated paper documentation:
  - `paper/CHECKLIST.md`
  - `paper/NOTES.md`
  - `paper/UNVERIFIED.md`

---

## 5. Database Migration Commands

If an existing installation contains an active database under the legacy identifier `vulntrack`, use the following commands to migrate the data without loss into the new `flawtrack` database:

```bash
# Step 1: Dump existing database into a backup directory
mongodump --db=vulntrack --out=./backup

# Step 2: Restore the collections into the new flawtrack namespace
mongorestore --nsFrom="vulntrack.*" --nsTo="flawtrack.*" ./backup/vulntrack/
```

Or run `npm run seed` in `backend/` to initialize a pristine `flawtrack` database with demonstration data.

---

## 6. Phase 4 — Verification Audit Results

### 1. Zero-Occurrence Grep Audit
An exhaustive case-insensitive grep across the entire repository (excluding this log file `docs/RENAME_LOG.md`) was executed:
```bash
git grep -inE "vuln[-_ .]?trac?k" -- :!docs/RENAME_LOG.md
```
- **Exit Code**: `1` (Zero occurrences found)
- **Result**: PASSED. No remnants of the old brand name exist anywhere in source code, configs, templates, tests, paper, or assets.

### 2. Initial Mark Audit (`VT` vs `FT`)
A search for isolated logo mark initials `VT` across frontend and paper files was executed:
```bash
git grep -I -in "\bVT\b" frontend/ paper/
```
- **Exit Code**: `1` (Zero text matches found)
- **Result**: PASSED. All brand marks and badges display `FT`.

### 3. Backend Test Suite
Executed `npm test` in `backend/`:
- **Test Suites**: 9 passed, 9 total
- **Tests**: 51 passed, 51 total (100% pass rate)
- **Execution Time**: ~18–28 seconds
- **Result**: PASSED. All unit and integration suites (CVSS, Duplicate Detection, Risk Engine, SLA, State Machine, Threat Intel, Notification, Lifecycle) passed cleanly.

### 4. Frontend Production Build
Executed `npm run build` in `frontend/`:
- **Vite Build**: Successfully transformed 2476 modules.
- **Output**: `dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`.
- **Exit Code**: `0`
- **Result**: PASSED.

### 5. Health Check Endpoint
Queried `http://localhost:5000/api/v1/health`:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "FlawTrack API v1",
    "environment": "development"
  }
}
```
- **Result**: PASSED.

### 6. Live UI & Browser Verification
Captured live browser screenshots using Google Chrome on Windows:
- `docs/screenshots/01_register_page.png`: Displays "FlawTrack Vulnerability Disclosure Platform" subtitle and clean registration form.
- `docs/screenshots/01_login_page.png`: Displays "FlawTrack" brand, "SMART VULNERABILITY MANAGEMENT SYSTEM", and quick-fill accounts with `@flawtrack.local`.
- `docs/screenshots/02_dashboard.png`: Displays "FlawTrack ENTERPRISE SECOPS" in navbar, SecOps analytics dashboard, priority distribution, and SLA monitoring.
- `docs/screenshots/03_priority_queue.png`: Displays triage queue with finding entries and prioritization tags.
- `docs/screenshots/04_vulnerability_detail.png`: Displays vulnerability details, CVSS vector builder, threat intelligence, and SLA countdowns.
- **Result**: PASSED.

### 7. Academic Paper Verification
- `paper/FlawTrack_Paper.docx`: Generated successfully (898 KB).
- `paper/FlawTrack_Paper.pdf`: Compiled via headless Chrome with IEEE format (1068 KB).
- Rasterization check (`paper/experiments/rasterize_pdf.js`): Rendered all 8 pages to `paper/format_check/page_1.png` through `page_8.png`.
- **Result**: PASSED. Exactly 8 pages, balanced reference columns on page 8, no headers or footers.

---

## 7. New Seed Credentials Reference

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@flawtrack.local` | `Password123!` | Full platform administration, RBAC, settings, audit logs, background jobs |
| **Senior Analyst** | `analyst1@flawtrack.local` | `Password123!` | Triage, validation, CVSS scoring, threat intel pull, assignment, retest |
| **Junior Analyst** | `analyst2@flawtrack.local` | `Password123!` | Triage, remediation notes, re-testing |
| **Reporter** | `reporter1@flawtrack.local` | `Password123!` | Submit vulnerabilities, view own reports, answer info inquiries |
