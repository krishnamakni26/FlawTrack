# FlawTrack — Smart Cybersecurity Vulnerability Reporting & Management System

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests: Jest](https://img.shields.io/badge/Tests-51%20Passed-success.svg)](https://jestjs.io/)
[![Coverage: 80%+](https://img.shields.io/badge/Coverage-Services%20%3E%2080%25-brightgreen.svg)](https://jestjs.io/)

**FlawTrack** is an enterprise-grade cybersecurity vulnerability reporting and lifecycle governance platform. Unlike conventional scanners or basic issue trackers that rely solely on static CVSS scores, FlawTrack manages the entire 13-stage vulnerability lifecycle and decides **what to fix first** using real-time exploit intelligence (EPSS, CISA KEV) combined with asset criticality, network exposure, and business sensitivity.

---

## Key Differentiators

- **Automated NLP Duplicate Detection:** Uses Natural Language Processing (Porter stemming, stopword removal, TF-IDF vectorization, and Cosine Similarity) to detect near-duplicate vulnerability reports before and after submission.
- **Contextual Risk-Based Prioritization:** Combines CVSS v3.1, FIRST.org EPSS exploit probability, CISA Known Exploited Vulnerabilities (KEV) catalog status, target asset criticality (1–5), business impact, and network exposure into a continuous 0–100 score mapped to **P1–P4**.
- **Explainable Priority Reasoning:** Every calculated score is accompanied by a transparent, human-readable narrative explaining why the finding was prioritized at that tier.
- **Dynamic "What-If" Risk Simulator:** Client-side widget allowing security teams to toggle asset parameters (e.g., changing asset from internal sandbox to internet-facing production) and observe the score recompute in real-time.
- **SLA Tracking & Automated Escalation:** Scheduled background cron jobs calculate SLA countdowns, emit warnings at 75% elapsed, mark breaches, and trigger notifications and email alerts.
- **Strict 13-Stage State Machine:** Enforces valid lifecycle transitions (`SUBMITTED` &rarr; `UNDER_VALIDATION` &rarr; `VALIDATED` &rarr; `PRIORITIZED` &rarr; `OPEN` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `RETEST` &rarr; `VERIFIED` &rarr; `CLOSED` / `REOPENED`).
- **Tamper-Proof Immutable Audit Trail:** Model-level append-only audit log that blocks updates and deletions, recording complete forensic before/after state snapshots.
- **Continuous Monitoring:** Automated daily threat refresh daemon re-evaluates active CVEs against updated KEV and EPSS feeds, automatically escalating priorities when new threats emerge.
- **Executive Security Dashboard:** Interactive charts (Priority Donut, Status Funnel, Ingestion Trend Line, Risky Assets, Overdue Watchlist).

---

## Tech Stack

- **Backend:** Node.js (LTS), Express.js, MongoDB / Mongoose, JWT (Access + Refresh), Bcrypt, Multer (Hardened storage), `natural` (TF-IDF & Cosine Similarity), `node-cron`, `nodemailer`, Axios, Zod, Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, Morgan, Jest + Supertest, `mongodb-memory-server` (automatic in-memory fallback).
- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS (Cybersecurity Dark Theme), Recharts, Lucide Icons, Axios.
- **DevOps:** Docker Compose (MongoDB 7.0), `.env.example` configurations.

---

## Database Renaming & Migration Note

The application default database has been updated to `flawtrack`. If you have an existing local MongoDB database from a prior version:

- **Option A (Fresh Seed — Recommended):**
  Run the seed script to populate a clean `flawtrack` database:
  ```bash
  cd backend
  npm run seed
  ```
- **Option B (Migrate Existing Data):**
  If you wish to retain your existing data from the previous database, dump and restore into `flawtrack` using MongoDB Database Tools:
  ```bash
  # 1. Dump existing database (see docs/RENAME_LOG.md for legacy database identifier)
  mongodump --db=<old-db> --out=./backup

  # 2. Restore into the new flawtrack database
  mongorestore --nsFrom="<old-db>.*" --nsTo="flawtrack.*" ./backup/<old-db>/
  ```
  *(See [`docs/RENAME_LOG.md`](docs/RENAME_LOG.md) for the exact legacy database command snippet).*

---

## Quick Start & Running Locally

### Prerequisites
- Node.js LTS (v20+ or v22+)
- Docker (optional; an automatic in-memory MongoDB fallback is built-in if Docker/local Mongo is not running)

### Option 0: 1-Click Windows Launcher (Fastest)

Simply double-click **`launcher.bat`** in the project root:
- Automatically detects Node.js and dependencies.
- Boots backend and frontend servers in separate windows.
- Automatically opens your default web browser to `http://localhost:5173`.
- Provides an interactive dashboard in the console to run E2E tests, monitor health, or stop servers.

### Option A: Using Local Node & Vite

1. **Clone and enter repository:**
   ```bash
   cd flawtrack
   ```

2. **Start Backend Server:**
   ```bash
   cd backend
   npm install
   npm run seed    # Seeds 4 users, 10 assets, 30+ vulnerabilities, offline threat data
   npm run dev     # Starts backend on http://localhost:5000
   ```

3. **Start Frontend Dashboard:**
   ```bash
   cd ../frontend
   npm install
   npm run dev     # Starts frontend on http://localhost:5173
   ```

4. **Open Application in Browser:**
   Navigate to [http://localhost:5173](http://localhost:5173) and sign in.

---

### Option B: Using Docker Compose

```bash
docker compose up -d
```
MongoDB will be available at `mongodb://localhost:27017/flawtrack`.

---

## Default System Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@flawtrack.local` | `Password123!` | Full administration, user management, asset CRUD, settings calibration, audit logs, job triggers |
| **Senior Analyst** | `analyst1@flawtrack.local` | `Password123!` | Priority queue, triage, CVSS calculator, threat intel refresh, assignment, re-test |
| **Junior Analyst** | `analyst2@flawtrack.local` | `Password123!` | Priority queue, triage, remediation notes |
| **Reporter** | `reporter1@flawtrack.local` | `Password123!` | Submit findings, view own reports, respond to clarification requests |

*Note: 1-click quick-fill buttons are provided on the login page for effortless evaluation.*

---

## Running Automated Tests & Coverage

FlawTrack includes comprehensive unit tests for all core engines and integration tests for API endpoints:

```bash
cd backend

# Run all 51 unit and integration tests
npm test

# Run tests with code coverage report (targets services/ >= 80%)
npm run test:coverage
```

### Test Coverage Summary:
- **Test Suites:** 9 passed, 9 total (100%)
- **Tests:** 51 passed, 51 total (100%)
- **Services Line Coverage:** > 80%

---

## Project Structure

```
flawtrack/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, MongoDB connection, system constants
│   │   ├── controllers/     # Auth, Vulnerabilities, Assets, Users, Dashboard, Audit, Settings, Jobs
│   │   ├── jobs/            # SLA monitor cron, Threat intelligence refresh cron
│   │   ├── middleware/      # Auth, RBAC, Zod validation, Multer upload, Error handler
│   │   ├── models/          # User, Vulnerability, Asset, AuditLog, ThreatIntel, Notification, Setting
│   │   ├── routes/          # REST route declarations under /api/v1
│   │   ├── services/        # CVSS, RiskEngine, Duplicate NLP, ThreatIntel, SLA, StateMachine, Audit
│   │   ├── utils/           # Response wrapper, Logger
│   │   ├── app.js           # Express app setup and middleware chain
│   │   └── server.js        # Server bootstrap and graceful shutdown
│   ├── scripts/
│   │   ├── data/            # Local CISA KEV and EPSS offline JSON snapshots
│   │   ├── seed.js          # Comprehensive database seeding script
│   │   └── e2e-verify.js    # Live server end-to-end verification script
│   ├── tests/
│   │   ├── unit/            # CVSS, RiskEngine, Duplicate, SLA, StateMachine, ThreatIntel, Notification tests
│   │   └── integration/     # Auth endpoints and 13-stage vulnerability lifecycle integration tests
│   └── uploads/             # Isolated proof-of-concept attachment storage
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with auto-refresh interceptors
│   │   ├── components/      # Badges, Navbar, Sidebar, Modals, Charts, What-If simulator
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── pages/           # Reporter, Analyst, Dashboard, Admin pages
│   │   ├── utils/           # Date formatters, SLA countdowns, priority helpers
│   │   ├── App.jsx          # React Router configuration with role guards
│   │   └── main.jsx         # React application entry point
├── docs/
│   ├── ARCHITECTURE.md      # High-level architecture, Mermaid diagrams, component design
│   ├── METHODOLOGY.md       # 13-stage lifecycle guide, risk mathematics, normalization formulas
│   ├── API.md               # REST API reference and payload schemas
│   ├── SECURITY.md          # AppSec defenses, upload hardening, and npm audit analysis
│   ├── ASSUMPTIONS.md       # Engineering design decisions and technical defaults
│   ├── USER_GUIDE.md        # Comprehensive user manual for Reporters, Analysts, and Admins
│   ├── DEMO_SCRIPT.md       # Step-by-step demonstration walkthrough script
│   └── RENAME_LOG.md        # Complete brand rename ledger
├── docker-compose.yml       # Production/Development Docker Compose configuration
└── README.md                # Project documentation
```

---

## Documentation Links

- [Architecture & Mermaid Diagrams](docs/ARCHITECTURE.md)
- [13-Stage Methodology & Risk Mathematics](docs/METHODOLOGY.md)
- [REST API Reference](docs/API.md)
- [Security Architecture & Controls](docs/SECURITY.md)
- [Live Demonstration Script](docs/DEMO_SCRIPT.md)
- [User Guide & Operations Manual](docs/USER_GUIDE.md)
- [Assumptions & Design Decisions](docs/ASSUMPTIONS.md)
- [Rebrand Audit Log](docs/RENAME_LOG.md)

---

## License

This project is licensed under the MIT License.
#   F l a w T r a c k  
 