# FlawTrack Production Deployment & Operations Guide

## Architecture Overview

FlawTrack is an enterprise-grade Vulnerability Management & Threat Intelligence Platform structured as a decoupled, production-hardened microservices architecture:

```
┌──────────────────────────────────────────┐
│             End Users / Clients          │
└────────────────────┬─────────────────────┘
                     │ HTTPS / Cookies
                     ▼
┌──────────────────────────────────────────┐      ┌───────────────────────────────┐
│        Frontend Web Application          │      │         UptimeRobot           │
│       Vercel (Edge CDN + SPA)            │      │   5-min Ping to /api/health   │
│       https://<app>.vercel.app           │      └──────────────┬────────────────┘
└────────────────────┬─────────────────────┘                     │ Keepalive Ping
                     │ API Requests (CORS + withCredentials)     │
                     ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Backend API & Processing Engine                        │
│                         Render Web Service (Node.js 20+)                        │
│                        https://<backend>.onrender.com                           │
│                                                                                 │
│   • Express Application Engine (Trust Proxy, Rate Limit, Helmet, Compression)   │
│   • Authentication & Session Management (JWT in httpOnly, SameSite=None Cookie) │
│   • 15-Status Finite State Machine & RBAC Enforcement (4 Roles)                 │
│   • Contextual Risk Engine & Overrides (CVSS + EPSS + KEV + Asset + Exposure)  │
│   • SLA Monitor Engine (node-cron every 15m, 75% early warning)                │
│   • CISA KEV & EPSS Threat Intel Synchronizer (Offline Fallback)                │
│   • In-Memory Multi-Factor PDFKit & json2csv Streaming Report Generator         │
│   • Append-Only Immutable Audit Trail Engine                                   │
└──────────────┬────────────────────────────┬─────────────────────────────────────┘
               │ Mongoose TLS               │ Upload Stream (Buffer)
               ▼                            ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│        MongoDB Atlas          │   │      Cloudinary Storage       │
│    Managed Replica Set (M0)   │   │  Media & Evidence Attachments │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## Environment Variables Reference

### Backend (Render Web Service)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `NODE_ENV` | **Yes** | Execution mode. Controls cookie security, stack trace suppression, and database connection retry behavior. | `production` |
| `PORT` | **Yes** | Server listening port. Automatically injected by Render. | `5000` (or injected port) |
| `MONGO_URI` | **Yes** | Full MongoDB Atlas connection string. Must include database name (`/flawtrack`) and URL-encoded credentials. | `mongodb+srv://user:pass%21@cluster.mongodb.net/flawtrack?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | 64-character cryptographic secret for signing authentication access tokens. | Generate via `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **Yes** | Cryptographic secret for signing refresh tokens. | Generate via `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | No | Access token lifespan. | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifespan. | `7d` |
| `CLIENT_URL` | **Yes** | Production frontend URL for strict CORS matching and cookie credentials. **NO trailing slash!** | `https://flawtrack.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud identifier for remote asset storage. | `flawtrack-prod` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key. | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API Secret. | `abcde_xyz123456789` |
| `THREAT_INTEL_MODE` | No | Threat feed sync mode. `'offline'` uses bundled snapshots; `'online'` queries live APIs. | `offline` |

### Frontend (Vercel)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | Target backend API base URL including `/api` path without trailing slash. | `https://flawtrack-backend.onrender.com/api` |

---

## Deployment Step-by-Step Runbook

### Step 1: Database Provisioning (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a free shared cluster (`M0 Sandbox`) in your nearest cloud region (e.g. AWS / us-east-1).
3. **Database Access**: Create a dedicated database user (e.g., `flawtrack_admin`) with password authentication and `readWriteAnyDatabase` privileges. Note: URL-encode special characters in the password (e.g. `@` $\rightarrow$ `%40`, `#` $\rightarrow$ `%23`).
4. **Network Access**: Add IP Access List entry `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render's dynamic IP pool.
5. Copy the connection string and append the database name `/flawtrack`:
   `mongodb+srv://flawtrack_admin:<password>@cluster0.abcde.mongodb.net/flawtrack?retryWrites=true&w=majority`

### Step 2: Backend Deployment (Render)
1. Push repository code to GitHub (`main` branch).
2. Log in to [Render](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint** (or **Web Service** using `render.yaml`).
4. Select the `FlawTrack` GitHub repository.
5. Render reads `render.yaml` automatically:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Fill in the environment variables:
   - `MONGO_URI`: Enter your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: Enter temporary value `http://localhost:5173` (we update this after Vercel deploy).
   - `CLOUDINARY_*`: Enter Cloudinary credentials (or leave empty for fallback).
7. Click **Apply / Deploy**. Once built, note your live backend URL (e.g., `https://flawtrack-backend.onrender.com`).
8. Verify health endpoint in your browser: `https://flawtrack-backend.onrender.com/api/health` should return:
   ```json
   { "status": "ok", "db": "connected", "uptime": 12.4, "time": "2026-10-21T..." }
   ```

### Step 3: Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import the `FlawTrack` GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Add `VITE_API_URL` = `https://<your-render-backend>.onrender.com/api`
6. Click **Deploy**. Note the assigned Vercel URL (e.g., `https://flawtrack.vercel.app`).
7. Thanks to `frontend/vercel.json`, all deep routes (`/dashboard`, `/queue`, `/reports`) rewrite cleanly to `/index.html`.

### Step 4: Finalize CORS Handshake
1. Return to the **Render Dashboard** $\rightarrow$ your `flawtrack-backend` service $\rightarrow$ **Environment**.
2. Update `CLIENT_URL` to the exact Vercel URL without trailing slash:
   `CLIENT_URL` = `https://flawtrack.vercel.app`
3. Click **Save Changes** (triggers an automatic zero-downtime redeploy).

### Step 5: Seed Production Database
1. Run the seed script locally pointing to the Atlas connection string:
   ```bash
   MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/flawtrack?retryWrites=true&w=majority" node backend/scripts/seed.js
   ```
2. The database is populated with 4 role accounts, 10 infrastructure assets, and ~26 diverse vulnerabilities.

### Step 6: Prevent Cold Starts (UptimeRobot)
Render free tiers sleep after 15 minutes of inactivity. To keep the SLA monitoring cron and backend active:
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Add New Monitor:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `FlawTrack Backend Heartbeat`
   - **URL (or IP)**: `https://<your-render-backend>.onrender.com/api/health`
   - **Monitoring Interval**: Every 5 minutes.
3. This guarantees constant warm instances and active background SLA evaluations.

---

## Secret Rotation Runbook

### Rotating JWT_SECRET
1. Generate a new 64-character secret: `openssl rand -hex 32`.
2. Update `JWT_SECRET` in the Render Environment tab and click **Save Changes**.
3. *Impact*: Active user sessions will be invalidated and required to re-authenticate at `/login`.

### Rotating MongoDB Atlas Credentials
1. In MongoDB Atlas, create a second user with read/write permissions.
2. In Render, update `MONGO_URI` with the new user credentials and click **Save Changes**.
3. After the new deployment is healthy, delete the old database user in Atlas.

---

## Troubleshooting & Self-Healing Matrix

| Symptom | Probable Cause | Diagnostic Command / Check | Resolution |
|---|---|---|---|
| **CORS error in browser console** | `CLIENT_URL` mismatch or trailing slash | Inspect response headers: `access-control-allow-origin` | Ensure `CLIENT_URL` on Render matches Vercel origin exactly with **no trailing slash** (e.g. `https://flawtrack.vercel.app`). |
| **Login succeeds but protected routes 401** | Cookie not stored due to missing `SameSite=None` or `Secure` | Inspect `Set-Cookie` in network tab; verify `SameSite=None; Secure; HttpOnly` | In production (`NODE_ENV=production`), cookies require `secure: true, sameSite: 'none'` and Express must have `app.set('trust proxy', 1)`. |
| **Backend crashes on startup** | Missing mandatory environment variables | Read Render deploy logs: `FATAL CONFIG ERROR` | Ensure `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV` are defined. |
| **Database fails to connect (`db: down`)** | Atlas Network Access IP restriction | Check Atlas **Network Access** tab | Ensure `0.0.0.0/0` is added to Atlas IP allowlist. |
| **Direct navigation or browser refresh gives 404** | Missing SPA rewrite rule | Check for `vercel.json` | Verify `frontend/vercel.json` contains `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`. |
| **Build fails on Render: module not found** | Dependency placed in `devDependencies` | Compare `package.json` dependencies | Ensure all runtime dependencies (`pdfkit`, `json2csv`, `cloudinary`, `cookie-parser`, `compression`) are in `dependencies`. |
