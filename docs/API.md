# VulnTrack REST API Reference (v1)

All API responses follow the consistent JSON envelope format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human readable description",
  "error": null
}
```

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account (defaults to `REPORTER`) | Public |
| `POST` | `/auth/login` | Authenticate with email/password; returns JWT access + refresh tokens | Public |
| `POST` | `/auth/refresh` | Exchange valid refresh token for fresh short-lived access token | Public |
| `POST` | `/auth/logout` | Revoke session and log user logout audit event | Authenticated |
| `GET` | `/auth/me` | Fetch authenticated user profile and permissions | Authenticated |

---

## 2. Vulnerability Lifecycle (`/api/v1/vulnerabilities`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/vulnerabilities` | Submit new vulnerability finding with attachments (multipart/form-data) | All Roles |
| `GET` | `/vulnerabilities` | Query vulnerability list with filters (`status`, `priority`, `category`, `search`, `duplicatesOnly`, `slaBreached`, `page`, `limit`) | All Roles (Reporters see own only) |
| `POST` | `/vulnerabilities/check-duplicates` | Live debounced NLP similarity hint check for reporter submission forms | All Roles |
| `GET` | `/vulnerabilities/:id` | Fetch full vulnerability details, scoring, context, and attachments | All Roles (Reporters see own only) |
| `PATCH` | `/vulnerabilities/:id` | Update report content (Reporter allowed while `SUBMITTED` or `NEEDS_INFO`) | Reporter / Admin |
| `POST` | `/vulnerabilities/:id/respond` | Reporter responds to clarification inquiry; returns state to `UNDER_VALIDATION` | Reporter / Admin |
| `GET` | `/vulnerabilities/:id/attachments/:fileId` | Secure authorized download endpoint for uploaded PoC files | Authorized Users |
| `GET` | `/vulnerabilities/:id/timeline` | Fetch chronological audit history entries for specific vulnerability | All Roles |
| `POST` | `/vulnerabilities/:id/validate` | Record validation verdict (`valid`, `invalid`, `needs_info`) with notes | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/recheck-duplicates` | Re-run NLP TF-IDF cosine similarity scan against active findings | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/duplicate-resolution` | Confirm duplicate, dismiss flag, or merge into master report | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/classify` | Update CVE ID, CWE ID, and Category classifications | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/cvss` | Set CVSS v3.1 vector or numeric base score | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/threat-analysis` | Fetch fresh EPSS exploit likelihood and CISA KEV status | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/calculate-risk` | Calculate normalized weighted contextual risk score & P1–P4 priority | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/assign` | Assign finding to specific security analyst (`assignedTo`) | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/status` | Transition lifecycle state machine with validation checks | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/remediation-notes` | Append technical remediation note to audit trail | Analyst / Admin |
| `POST` | `/vulnerabilities/:id/retest` | Record re-test verification verdict (`passed` &rarr; `CLOSED`, `failed` &rarr; `REOPENED`) | Analyst / Admin |

---

## 3. Assets Inventory (`/api/v1/assets`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/assets` | List registered assets with environment and criticality filters | Analyst / Admin |
| `POST` | `/assets` | Register new target asset (Criticality 1–5, Internet Facing, Sensitivity 1–5) | Admin |
| `GET` | `/assets/:id` | Fetch asset profile and linked vulnerability metrics | Analyst / Admin |
| `PATCH` | `/assets/:id` | Update asset exposure, environment, or ownership | Admin |
| `DELETE` | `/assets/:id` | Remove asset from active inventory | Admin |

---

## 4. Users Administration (`/api/v1/users`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/users` | List system users, teams, last login timestamps, and account statuses | Admin |
| `POST` | `/users` | Provision new user with explicit role (`REPORTER`, `ANALYST`, `ADMIN`) | Admin |
| `PATCH` | `/users/:id` | Update role, team, or toggle `isActive` status | Admin |

---

## 5. Security Posture Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Executive metrics: Active open, P1–P4 distribution, SLA compliance %, breach list, MTTR, weekly trend, risky assets | Analyst / Admin |

---

## 6. Immutable Audit Trail (`/api/v1/audit`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/audit` | Query append-only audit trail with actor, action, entity, and date filters | Admin |
| `GET` | `/audit/export` | Download complete audit trail as a timestamped CSV file | Admin |

---

## 7. System Calibration Settings (`/api/v1/settings`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/settings` | Retrieve active risk weights, priority thresholds, SLA hours, and duplicate sensitivity | Admin |
| `PUT` | `/settings` | Update system weights (validated to sum to 1.0), thresholds, and SLA hours | Admin |

---

## 8. Background Job Control (`/api/v1/admin/jobs`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/admin/jobs/status` | View background daemon status, cron schedules, and last execution results | Admin |
| `POST` | `/admin/jobs/:name/run` | Trigger job execution immediately on-demand (`sla-monitor` or `threat-refresh`) | Admin |

---

## 9. In-App Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/notifications` | List user in-app notifications and unread badge count | Authenticated |
| `PATCH` | `/notifications/:id/read` | Mark individual notification as read | Authenticated |
| `POST` | `/notifications/read-all` | Mark all user notifications as read | Authenticated |
