# VulnTrack — Bug-Fix Log

Maintained per the Bug-Fixing Master Prompt rules. All fixes follow the "smallest correct change" principle. Existing architecture, folder structure, API paths, and naming are preserved throughout.

---

## Baseline (Phase 1)

| Metric | Value |
|---|---|
| Date | 2026-09-29 |
| Backend test suites | 9 (7 unit, 2 integration) |
| Backend tests before fixes | **51 / 51 PASSED** |
| Backend tests after fixes | **51 / 51 PASSED** |
| Frontend console errors at idle | 0 |
| Backend startup | Clean (seeds DB, cron scheduled, port 5000) |

### Architecture Snapshot

1. **Backend:** Node.js / Express — REST API port 5000, `src/server.js` entry.
2. **Database:** MongoDB via Mongoose; `MongoMemoryServer` for offline/test.
3. **Auth:** JWT access tokens (15 min) + refresh tokens (7 d); bcrypt; 5-attempt lockout.
4. **Core services:** CVSS v3.1, RiskEngine (weighted formula), SLA, StateMachine (13 states), DuplicateDetection (TF-IDF cosine), ThreatIntel (EPSS + CISA KEV), Audit (append-only).
5. **Frontend:** React 18 / Vite / TailwindCSS; protected routes; `axiosClient` handles 401→refresh→retry.
6. **Cron jobs:** SLA monitor every 15 min, Threat refresh daily 02:00.
7. **File uploads:** Multer; extension + MIME allowlist; secure UUID filenames.
8. **RBAC:** REPORTER (own reports only) / ANALYST (full queue) / ADMIN (users/assets/settings/audit).
9. **Audit:** Every lifecycle event persisted immutably; `pre`-hooks block mutations.
10. **Tests:** Jest + Supertest; `mongodb-memory-server` for full isolation.

### Assumptions
- `THREAT_INTEL_MODE=offline` (default in dev) — offline KEV dataset is bundled.
- Auth Zod schema validation applied via `validate.middleware` in route definitions ✅.
- `axiosClient` response interceptor returns the full `{success, data, error}` JSON body as `response.data`, then normalizes errors to `{code, message}` before `Promise.reject()`. Frontend catch blocks therefore receive the flat `{code, message}` object — **not** a raw Axios error with `.response`.
- Double-extension bypass hardening (`shell.php.png` rejection) is classified as a security improvement, not a regression.

---

## Bug Entries

---

### BUG-001 — Upload MIME type check is dead code (always skipped)

| Field | Value |
|---|---|
| ID | BUG-001 |
| Severity | **High — Security** |
| File | `backend/src/middleware/upload.middleware.js` line 62 |
| Status | ✅ FIXED |

**Symptom**  
A file with an allowed extension but a completely wrong MIME type (e.g. `application/x-executable`) is silently accepted. MIME validation was never enforced.

**Root Cause**  
```js
// BUG: 'application/octet-stream' IS in ALLOWED_MIME_TYPES, so the
// second operand is always false → entire condition is always false
if (!ALLOWED_MIME_TYPES.has(file.mimetype) && !ALLOWED_MIME_TYPES.has('application/octet-stream')) {
```
Both operands must be `true` for the block to execute. Because `'application/octet-stream'` is in the set, the RHS is always `false`, short-circuiting the whole condition to `false`. The MIME rejection block is unreachable.

**Fix**  
Separate the two checks with the correct semantics: accept `octet-stream` explicitly (extension already validated), reject all other unknown MIME types.
```js
// FIXED: allow octet-stream (extension already validated above);
// reject all other unrecognised MIME types
if (file.mimetype !== 'application/octet-stream' && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
  // reject
}
```

**Files changed**  
- `backend/src/middleware/upload.middleware.js`

**Verification**  
- All 51 existing tests still pass.
- Existing integration test `rejects disallowed file extensions (e.g. .exe)` continues to pass.

---

### BUG-002 — Double-extension bypass (shell.php.png accepted)

| Field | Value |
|---|---|
| ID | BUG-002 |
| Severity | **High — Security** |
| File | `backend/src/middleware/upload.middleware.js` |
| Status | ✅ FIXED |

**Symptom**  
A file named `shell.php.png` passes upload validation. An attacker could upload a PHP shell disguised as a `.png`.

**Root Cause**  
`path.extname('shell.php.png')` returns only `.png` — the *last* extension. No check was performed on any preceding dot-segments in the filename.

**Fix**  
Added a `DANGEROUS_EXTENSIONS` set of 26 commonly abused extensions. After the final-extension check, split the original filename on `.` and check every preceding segment against that set.

```js
const nameParts = file.originalname.toLowerCase().split('.');
for (let i = 0; i < nameParts.length - 1; i++) {
  if (DANGEROUS_EXTENSIONS.has('.' + nameParts[i])) {
    // reject
  }
}
```

**Files changed**  
- `backend/src/middleware/upload.middleware.js`

**Verification**  
- All 51 existing tests still pass.

---

### BUG-003 — Cron job errors produce unhandled promise rejections

| Field | Value |
|---|---|
| ID | BUG-003 |
| Severity | **High — Reliability** |
| File | `backend/src/jobs/index.js` lines 35–44 |
| Status | ✅ FIXED |

**Symptom**  
If `SlaMonitorJob.execute()` or `ThreatRefreshJob.execute()` throw an unexpected error (e.g. transient DB outage), the cron callback propagates an unhandled promise rejection. In Node.js ≥ 15 this terminates the process.

**Root Cause**  
```js
cron.schedule('*/15 * * * *', async () => {
  logger.info('Running scheduled SLA monitor cron...');
  await runJob('sla-monitor'); // ← no try/catch; throw crashes process
});
```

**Fix**  
Wrapped both `await runJob(...)` calls in `try/catch`. Errors are logged at `ERROR` level and swallowed so the cron scheduler continues.

```js
cron.schedule('*/15 * * * *', async () => {
  logger.info('Running scheduled SLA monitor cron...');
  try {
    await runJob('sla-monitor');
  } catch (err) {
    logger.error(`[CRON] SLA monitor failed unexpectedly: ${err.message}`, { stack: err.stack });
  }
});
```

**Files changed**  
- `backend/src/jobs/index.js`

**Verification**  
- All 51 existing tests still pass.

---

### BUG-004 — Frontend catch blocks use wrong error path (always shows fallback message)

| Field | Value |
|---|---|
| ID | BUG-004 |
| Severity | **Medium — UX / Debuggability** |
| Files | 8 frontend page files (27 occurrences total) |
| Status | ✅ FIXED |

**Symptom**  
When the backend returns an API error, all error panels in the frontend show only the hardcoded fallback string (e.g. `'Failed to fetch executive dashboard metrics'`) instead of the actual error message from the server.

**Root Cause**  
`axiosClient`'s response interceptor normalizes errors:
```js
const customError = error.response?.data?.error || { message: error.message, code: 'NETWORK_ERROR' };
return Promise.reject(customError);
```
So `err` in a catch block is already `{code, message}` — a flat object. All 27 catch blocks instead accessed `err.response?.data?.error?.message`, which is always `undefined` because `err` is not the raw Axios error.

**Fix**  
Changed all occurrences of `err.response?.data?.error?.message` → `err.message`.  
Applied via automated script across all 8 affected files.

**Files changed**  
| File | Occurrences |
|---|---|
| `frontend/src/pages/dashboard/DashboardPage.jsx` | 1 |
| `frontend/src/pages/reporter/MyReportsPage.jsx` | 2 |
| `frontend/src/pages/analyst/PriorityQueuePage.jsx` | 2 |
| `frontend/src/pages/analyst/VulnerabilityDetailPage.jsx` | 11 |
| `frontend/src/pages/admin/AssetManagementPage.jsx` | 3 |
| `frontend/src/pages/admin/AuditLogPage.jsx` | 1 |
| `frontend/src/pages/admin/JobControlPage.jsx` | 2 |
| `frontend/src/pages/admin/SystemSettingsPage.jsx` | 2 |
| `frontend/src/pages/admin/UserManagementPage.jsx` | 3 |

**Verification**  
- All 51 existing tests still pass.
- Frontend pages compile and load with zero console errors.

---

## Not-a-Bug (Cleared During Audit)

| ID | Area | Reason |
|---|---|---|
| NBA-01 | `auth.routes.js` Zod validation | Schemas correctly applied via `validate.middleware` in route definitions — no gap. |
| NBA-02 | `SubmitVulnerabilityPage` assets dropdown | `assetsApi.list()` returns plain array via `successResponse(res, assets)`. Frontend reads `res.data` which is the array. Shape matches. |
| NBA-03 | `StateMachineService.transition` idempotency | `SUBMITTED→UNDER_VALIDATION→VALIDATED` double-check works: first call is no-op if already UNDER_VALIDATION. Correct. |
| NBA-04 | `DuplicateService.findDuplicates` self-match | New vuln saved AFTER `findDuplicates` runs; no self-match possible. Correct. |
| NBA-05 | `retest` fail path REOPENED→ASSIGNED | State machine allows this transition. `assignedTo` guarded with null check. Correct. |

---

## Final Test Summary

```
Test Suites: 9 passed, 9 total
Tests:       51 passed, 51 total
Snapshots:   0 total
Time:        ~13s
```

All 51 tests pass with zero regressions after all 4 bugs were fixed.
