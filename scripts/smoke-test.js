#!/usr/bin/env node
/**
 * FlawTrack Production Smoke Test Suite
 *
 * Usage:
 *   node scripts/smoke-test.js <BACKEND_URL> <FRONTEND_URL>
 *
 * Example:
 *   node scripts/smoke-test.js https://flawtrack-api.onrender.com https://flawtrack.vercel.app
 *   node scripts/smoke-test.js http://localhost:5000 http://localhost:5173
 */

const backendArg = process.argv[2] || process.env.BACKEND_URL || 'http://localhost:5000';
const frontendArg = process.argv[3] || process.env.FRONTEND_URL || 'http://localhost:5173';

const BACKEND_URL = backendArg.replace(/\/+$/, '');
const FRONTEND_URL = frontendArg.replace(/\/+$/, '');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

const pass = (label, detail = '') => {
  console.log(`  ${colors.green}✔ PASS${colors.reset}  ${colors.bold}${label}${colors.reset} ${detail ? `(${detail})` : ''}`);
};

const fail = (label, error) => {
  console.error(`  ${colors.red}✖ FAIL${colors.reset}  ${colors.bold}${label}${colors.reset}`);
  console.error(`         ${colors.red}Error: ${error}${colors.reset}`);
};

async function runSmokeTests() {
  console.log('\n' + colors.cyan + colors.bold + '=====================================================' + colors.reset);
  console.log(colors.cyan + colors.bold + '       FlawTrack Production Deployment Smoke Test    ' + colors.reset);
  console.log(colors.cyan + colors.bold + '=====================================================' + colors.reset);
  console.log(`Target Backend:  ${colors.bold}${BACKEND_URL}${colors.reset}`);
  console.log(`Target Frontend: ${colors.bold}${FRONTEND_URL}${colors.reset}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let sessionCookie = '';
  let token = '';
  let sampleVulnId = '';

  // Helper fetch with timeout
  async function testFetch(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  // --- TEST 1: Backend Health Check ---
  totalTests++;
  try {
    const start = Date.now();
    const res = await testFetch(`${BACKEND_URL}/api/health`, { timeoutMs: 30000 });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      throw new Error(`Health check returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status !== 'ok') {
      throw new Error(`Expected status 'ok', got: ${data.status}`);
    }
    if (data.db !== 'connected') {
      throw new Error(`Expected db 'connected', got: ${data.db}`);
    }

    pass('GET /api/health', `status: ok, db: connected, uptime: ${Math.round(data.uptime)}s, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('GET /api/health', err.message);
  }

  // --- TEST 2: Authentication & Cookie Issuance ---
  totalTests++;
  try {
    const start = Date.now();
    const res = await testFetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@flawtrack.local',
        password: 'Password123!',
      }),
    });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Login failed with HTTP ${res.status}: ${errBody}`);
    }

    // Check Set-Cookie headers
    // Node.js fetch headers.getSetCookie() returns an array
    const rawCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);

    const hasCookie = rawCookies.some(c => c.includes('token') || c.includes('accessToken'));

    const data = await res.json();
    token = data.data?.tokens?.accessToken || data.data?.token || data.token;

    if (!hasCookie && !token) {
      throw new Error('Neither Set-Cookie header nor token returned in login response');
    }

    // Format cookie string for subsequent requests
    sessionCookie = rawCookies.map(c => c.split(';')[0]).join('; ');

    const cookieNote = hasCookie ? 'Set-Cookie present' : 'token provided';
    pass('POST /api/auth/login', `role: ${data.data?.user?.role || 'ADMIN'}, ${cookieNote}, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('POST /api/auth/login', err.message);
  }

  // --- TEST 3: Authenticated Vulnerability List ---
  totalTests++;
  try {
    const start = Date.now();
    const headers = { Accept: 'application/json' };
    if (sessionCookie) headers['Cookie'] = sessionCookie;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await testFetch(`${BACKEND_URL}/api/vulnerabilities?limit=5`, { headers });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      throw new Error(`Vulnerabilities list returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.data?.vulnerabilities || data.data?.items || data.data || [];
    const count = Array.isArray(items) ? items.length : 0;

    if (count > 0 && items[0]._id) {
      sampleVulnId = items[0]._id;
    }

    pass('GET /api/vulnerabilities (Authenticated)', `retrieved ${count} items, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('GET /api/vulnerabilities (Authenticated)', err.message);
  }

  // --- TEST 4: PDF Report Generation (%PDF magic bytes) ---
  totalTests++;
  try {
    const start = Date.now();
    const headers = {};
    if (sessionCookie) headers['Cookie'] = sessionCookie;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Target either single vuln report or summary report
    const reportUrl = sampleVulnId
      ? `${BACKEND_URL}/api/reports/vulnerability/${sampleVulnId}?format=pdf`
      : `${BACKEND_URL}/api/reports/summary?format=pdf`;

    const res = await testFetch(reportUrl, { headers });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Report generation returned HTTP ${res.status}: ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const magicHeader = buffer.subarray(0, 4).toString('ascii');

    if (magicHeader !== '%PDF') {
      throw new Error(`Expected PDF signature %PDF-, received: ${magicHeader} (length: ${buffer.length})`);
    }

    const reportType = sampleVulnId ? `Vulnerability ${sampleVulnId}` : 'Summary';
    pass('GET /api/reports (PDF Binary Streaming)', `verified %PDF- header, size: ${buffer.length} bytes, type: ${reportType}, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('GET /api/reports (PDF Binary Streaming)', err.message);
  }

  // --- TEST 5: Frontend Root Route (HTTP 200 & HTML root) ---
  totalTests++;
  try {
    const start = Date.now();
    const res = await testFetch(`${FRONTEND_URL}/`, { headers: { Accept: 'text/html' } });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      throw new Error(`Frontend root returned HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    if (!html.includes('<div id="root">') && !html.includes('<!DOCTYPE html>') && !html.includes('html')) {
      throw new Error('Frontend did not return a valid HTML document containing root mount point');
    }

    pass('GET / (Frontend Root)', `HTTP 200 OK, valid HTML single-page app shell, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('GET / (Frontend Root)', err.message);
  }

  // --- TEST 6: Frontend Deep Link /dashboard (SPA Rewrite Verification) ---
  totalTests++;
  try {
    const start = Date.now();
    const res = await testFetch(`${FRONTEND_URL}/dashboard`, { headers: { Accept: 'text/html' } });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      throw new Error(`Frontend deep link /dashboard returned HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    if (!html.includes('<div id="root">') && !html.includes('<!DOCTYPE html>')) {
      throw new Error('Deep link did not rewrite to index.html (SPA fallback missing)');
    }

    pass('GET /dashboard (Frontend Deep Link)', `HTTP 200 OK, verified Vercel SPA rewrite fallback, latency: ${elapsed}ms`);
    passedTests++;
  } catch (err) {
    fail('GET /dashboard (Frontend Deep Link)', err.message);
  }

  // --- SUMMARY ---
  console.log('\n' + colors.bold + '-----------------------------------------------------' + colors.reset);
  console.log(`Results: ${colors.bold}${passedTests}/${totalTests} Passed${colors.reset}`);
  console.log(colors.bold + '-----------------------------------------------------' + colors.reset);

  if (passedTests === totalTests) {
    console.log(`\n${colors.green}${colors.bold}✔ ALL SMOKE TESTS PASSED SUCCESSFULLY! Deployment is production-verified.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n${colors.red}${colors.bold}✖ ${totalTests - passedTests} TEST(S) FAILED. Inspect errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('\nFatal smoke test suite error:', err);
  process.exit(1);
});
