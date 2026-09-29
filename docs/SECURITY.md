# VulnTrack Security Controls & AppSec Architecture

As a security product, **VulnTrack** practices defensive engineering across all architectural layers.

---

## 1. Authentication & Session Management

- **Argon2 / BCrypt Password Hashing:** User passwords are encrypted with bcrypt using 10 salt rounds (`bcrypt.genSalt(10)`). Plaintext passwords are never logged, stored, or returned in API responses (`select: false` on Mongoose schema).
- **Dual JWT Token Architecture:**
  - **Access Token:** Short-lived (15 minutes default) signed with HMAC-SHA256 (`JWT_SECRET`).
  - **Refresh Token:** Long-lived (7 days) signed with separate secret (`JWT_REFRESH_SECRET`) stored securely in database with token rotation on refresh.
- **Account Lockout Protection:** Repeated failed login attempts are tracked (`failedLoginAttempts`). Upon reaching 5 consecutive failures, the account is temporarily locked for 15 minutes (`lockoutUntil`), returning HTTP 429 Too Many Requests.
- **Rate Limiting:** Global rate limiting (100 requests per 15 minutes) and dedicated authentication rate limiting (10 login attempts per 15 minutes) via `express-rate-limit`.

---

## 2. Authorization & RBAC (Role-Based Access Control)

- **Three Privilege Tiers:** `REPORTER`, `ANALYST`, and `ADMIN`.
- **Server-Side Enforcement:** Every endpoint applies `authenticate` followed by `authorizeRoles(...)`.
- **IDOR Protection (Insecure Direct Object Reference):**
  - Reporters querying `/vulnerabilities` are strictly filtered at the database query level to `query.reportedBy = req.user._id`.
  - When accessing a report via `/vulnerabilities/:id`, the controller asserts `vuln.reportedBy.equals(req.user._id)` before releasing data or attachments.
- **Strict Editing Window:** Reporters may only edit their submissions while in `SUBMITTED` or `NEEDS_INFO` status. Once an analyst begins triage or moves the report forward, edits are blocked with HTTP 400.

---

## 3. Storage & Upload Hardening

Proof-of-Concept attachments are isolated and secured against remote execution and path traversal:
- **Outside Web Root:** Uploaded files are stored in `backend/uploads/` which is not exposed through static HTTP serving.
- **Randomized File Names:** Multer renames all uploaded files to unique UUIDs (`crypto.randomUUID() + ext`), preventing path traversal (`../`) and original filename spoofing.
- **MIME & Extension Strict Allowlist:**
  - Allowed Extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.pdf`, `.txt`, `.log`, `.json`, `.csv`, `.zip`.
  - Executable formats (`.exe`, `.sh`, `.php`, `.js`, `.py`, `.bat`, `.cmd`, `.ps1`) are strictly rejected.
- **File Size Cap:** Strictly limited to 10MB per attachment, maximum 5 attachments per submission.
- **Authorized Download Gateway:** Files are retrieved solely through `/api/v1/vulnerabilities/:id/attachments/:fileId`, which validates JWT authentication, user role, and report ownership before streaming file bytes.

---

## 4. Injection & Input Sanitization

- **Zod Schema Validation:** Every incoming API request body, parameter, and query string is parsed and validated against strict Zod schemas before reaching business logic.
- **NoSQL Injection Defense:** `express-mongo-sanitize` strips out any keys containing `$` or `.` from request payloads to prevent MongoDB query operator injection.
- **Secure Response Headers:** `helmet` applies Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, and X-Frame-Options: DENY.
- **CORS Allowlist:** Cross-Origin Resource Sharing is locked down to explicit trusted domains (`FRONTEND_URL`), blocking unauthorized browser origins.

---

## 5. Immutable Append-Only Audit Trail

- **Database-Level Enforcement:** The `AuditLog` Mongoose model hooks into `updateOne`, `updateMany`, `findOneAndUpdate`, `deleteOne`, `deleteMany`, `findOneAndDelete`, and `findOneAndRemove`, throwing an immutable security violation error.
- **Zero Mutation API:** No REST endpoints exist to modify or delete audit log entries.
- **Coverage:** Logs user authentication (success/fail), report creation, state transitions, validation results, duplicate flagging, risk recalculation, analyst assignment, SLA warnings, breaches, and verification re-test results.

---

## 6. Dependency Vulnerability Assessment (`npm audit`)

Running `npm audit` on the VulnTrack project yields:
- **Total packages analyzed:** 504 dependencies.
- **Direct vulnerabilities identified:** 3 (2 moderate, 1 high) in transitive dependencies of `node-cron` (`uuid < 11.1.1`) and `nodemailer` (`<=10.0.1`).
- **Mitigation & Risk Assessment:**
  1. `nodemailer`: The reported issues relate to interpretation conflicts when parsing legacy RFC 5322 comment syntax and DNS caching across multitenant transports. In VulnTrack, emails are dispatched internally to verified system users with sanitized recipient addresses.
  2. `uuid` in `node-cron`: Relates to buffer bounds checking when supplying custom buffers to v3/v5 UUID generation. `node-cron` does not supply custom buffers.
  3. No critical vulnerabilities exist in the core Express, Mongoose, or JWT frameworks.
