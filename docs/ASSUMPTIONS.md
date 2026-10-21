# FlawTrack — Architectural & Design Assumptions

This document records the architectural defaults, sensible defaults, and technical assumptions adopted in FlawTrack in accordance with Section 0 of the specification.

---

## 1. Environment & Database Runtime
- **Database Connection Strategy**: The system attempts to connect to `MONGODB_URI` (default: `mongodb://localhost:27017/flawtrack`). If an external MongoDB instance is not detected or if `USE_MEMORY_DB=true`, the backend automatically instantiates an embedded, zero-configuration `mongodb-memory-server` instance. This ensures the application and test suites run seamlessly out of the box in any developer or evaluation environment without external infrastructure requirements.
- **Port Allocation**: Backend runs on port `5000` (or `PORT` from `.env`). Frontend Vite dev server runs on port `5173`. CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`.

---

## 2. Authentication & Authorization (RBAC)
- **Token Lifecycles**:
  - Access Tokens: Signed with `JWT_SECRET`, 15-minute expiration.
  - Refresh Tokens: Signed with `JWT_REFRESH_SECRET`, 7-day expiration.
- **Self-Service Registration**: Anyone can register via `POST /api/v1/auth/register`, which grants the `REPORTER` role by default.
- **Role Elevation**: Elevating a user to `ANALYST` or `ADMIN` requires an existing `ADMIN` to update the user account via `PATCH /api/v1/users/:id`.
- **Brute Force Protection**: 5 consecutive failed login attempts lock the account for 15 minutes.

---

## 3. Threat Intelligence
- **Operational Modes**:
  - `live`: Queries live APIs (FIRST.org EPSS and CISA KEV JSON). If external endpoints timeout or return errors, it falls back gracefully to cached data or local seed records without throwing 500 errors.
  - `offline`: Reads directly from bundled curated snapshots in `backend/scripts/data/` (`cisa_kev_offline.json` and `epss_offline.json`).
- **Cache TTL**: Cached ThreatIntel records remain fresh for 24 hours.

---

## 4. NLP Duplicate Detection
- **Text Formulation**: The comparison document combines `Title` (weighted 2× by repetition), `Description`, `Steps to Reproduce`, and `Category`.
- **Stemming & Stopwords**: Text is tokenized, stripped of English stop words and punctuation, and stemmed using Porter Stemmer (`natural`).
- **Exact Identifier Bonus**: A +0.10 similarity bonus is awarded if both reports reference the exact same `cveId`, and +0.05 if both reference the exact same `cweId`, capped at 1.0.
- **Default Threshold**: 0.75 cosine similarity flags a report as a potential duplicate. Matches are logged as suggestions for human review and never auto-deleted.

---

## 5. Risk Scoring & Priority Overrides
- **Normalization Formula**: All factors are normalized to $[0, 1]$.
  - $CVSS_{norm} = \text{BaseScore} / 10$
  - $EPSS_{norm} = \text{EPSS score } [0, 1]$
  - $KEV_{norm} = 1.0 \text{ if listed else } 0.0$
  - $Criticality_{norm} = (\text{Criticality} - 1) / 4$ (for 1–5 range)
  - $Exposure_{norm}$: Internet-Facing Production = 1.0, Internet-Facing Non-Prod = 0.7, Internal = 0.4, Isolated/Test = 0.1
  - $BusinessImpact_{norm}$: Calculated from affected users log band ($0.0$ to $0.4$) + data sensitivity ($0.0$ to $0.4$) + impact severity rating ($0.0$ to $0.2$).
- **Default Weights**: CVSS 30%, EPSS 20%, KEV 20%, Asset Criticality 15%, Business Impact 10%, Exposure 5%. (Sum = 1.0).
- **Default Priority Cutoffs**: P1 $\ge 70$, P2 $\ge 50$, P3 $\ge 30$, P4 $< 30$.
- **Override Safeguards**:
  - Floor at **P1**: Any vulnerability listed in CISA KEV hosted on an internet-facing asset is automatically elevated to P1 regardless of score.
  - Floor at **P2**: Any vulnerability with CVSS Base Score $\ge 9.0$ is floored at P2.

---

## 6. SLA & Lifecycle State Machine
- **Default SLA Timeframes**: P1 = 24 hours, P2 = 72 hours, P3 = 168 hours (7 days), P4 = 720 hours (30 days).
- **Warning Threshold**: Triggered when 75% of allowed time has elapsed.
- **State Machine Transitions**: Fully enforces the 13-stage lifecycle. Any transition outside the declared DAG throws HTTP 409 Conflict.
- **Audit Immutability**: The `AuditLog` collection prohibits update and delete operations at the Mongoose middleware level.
