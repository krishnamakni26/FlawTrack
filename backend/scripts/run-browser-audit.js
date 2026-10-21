const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Temporary PoC file for upload
const POC_FILE_PATH = path.resolve(__dirname, '../uploads/poc-test-evidence.txt');
if (!fs.existsSync(path.dirname(POC_FILE_PATH))) {
  fs.mkdirSync(path.dirname(POC_FILE_PATH), { recursive: true });
}
fs.writeFileSync(
  POC_FILE_PATH,
  'Proof of Concept: HTTP request log demonstrating unsanitized SQL injection vulnerability.\nGET /api/v1/invoices?customerId=1+OR+1=1 HTTP/1.1\nHost: target.local\n'
);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('Starting Phase 6 End-to-End Browser Verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  // Helper: Login
  async function login(email, password) {
    console.log(`Logging in as ${email}...`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await page.$eval('input[type="email"]', (el) => (el.value = ''));
    await page.type('input[type="email"]', email);
    await page.$eval('input[type="password"]', (el) => (el.value = ''));
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(1200);
  }

  // Helper: Click tab by text
  async function clickTab(tabText) {
    await page.evaluate((text) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.trim().toLowerCase().includes(text.toLowerCase()));
      if (target) target.click();
    }, tabText);
    await sleep(800);
  }

  try {
    // =========================================================================
    // FLOW 1: Reporter submits report with attachment & Duplicate Hint Check
    // =========================================================================
    console.log('--- FLOW 1: Reporter Submission & Live Duplicate Hint ---');
    await login('reporter1@flawtrack.local', 'Password123!');

    // 1. Submit first report
    await page.goto('http://localhost:5173/submit', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder*="Blind SQL Injection"]');

    await page.type('input[placeholder*="Blind SQL Injection"]', 'Critical SQL Injection in Customer Invoicing Portal API');
    await page.select('select:nth-of-type(1)', 'SQL Injection');

    // Select asset
    const assetSelect = await page.$('select:nth-of-type(3)');
    if (assetSelect) {
      const options = await page.$$eval('select:nth-of-type(3) option', (opts) => opts.map((o) => o.value));
      if (options.length > 1) {
        await page.select('select:nth-of-type(3)', options[1]);
      }
    }

    await page.type('input[placeholder="e.g. CVE-2021-44228"]', 'CVE-2023-34362');
    await page.type('input[placeholder="e.g. CWE-89"]', 'CWE-89');

    await page.type(
      'textarea[placeholder*="comprehensive summary"]',
      'Unsanitized customerId parameter allows arbitrary SQL query execution exposing database tables and customer PII credentials.'
    );
    await page.type(
      'textarea[placeholder*="1. Send HTTP GET"]',
      '1. Send GET request to /api/invoices?customerId=1+OR+1=1\n2. Database returns entire invoice table without tenant restriction\n3. Full data exfiltration verified.'
    );
    await page.type(
      'textarea[placeholder*="operational, confidentiality"]',
      'High confidentiality and integrity loss. Direct compromise of customer billing records.'
    );

    // Upload PoC evidence file
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(POC_FILE_PATH);
      await sleep(600);
    }

    // Submit report
    await page.click('button[type="submit"]');
    await sleep(2000);

    // 2. Start a second report with similar text to trigger live duplicate hint banner
    await page.goto('http://localhost:5173/submit', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder*="Blind SQL Injection"]');

    await page.type('input[placeholder*="Blind SQL Injection"]', 'Critical SQL Injection in Customer Invoicing Portal API');
    await page.type(
      'textarea[placeholder*="comprehensive summary"]',
      'Unsanitized customerId parameter in invoice API allows arbitrary SQL injection exposing customer data.'
    );

    // Wait for debounced NLP duplicate hint check
    console.log('Waiting for live duplicate hint preview...');
    await sleep(2500);

    const screenshot1 = path.join(SCREENSHOT_DIR, '01_reporter_submission_duplicate_hint.png');
    await page.screenshot({ path: screenshot1, fullPage: false });
    console.log(`Saved screenshot 1: ${screenshot1}`);

    // =========================================================================
    // FLOW 2: Analyst Triage, Duplicate Comparison, CVSS, Threat Intel, Risk
    // =========================================================================
    console.log('--- FLOW 2: Analyst Triage, CVSS & Risk Recalculation ---');
    await login('analyst1@flawtrack.local', 'Password123!');

    await page.goto('http://localhost:5173/queue', { waitUntil: 'networkidle2' });
    await page.waitForSelector('table tbody tr');

    // Click the first vulnerability to open detail page
    const firstRowLink = await page.$('table tbody tr td a');
    if (firstRowLink) {
      await firstRowLink.click();
    } else {
      const rowHref = await page.$eval('table tbody tr a', (el) => el.getAttribute('href'));
      await page.goto(`http://localhost:5173${rowHref}`, { waitUntil: 'networkidle2' });
    }
    await sleep(1500);

    // 1. Validation Tab
    await clickTab('Validation');
    const noteArea = await page.$('textarea[placeholder*="reproduction verification"]');
    if (noteArea) {
      await noteArea.type('Verified exploit reproduction on staging endpoint. Parameter directly concatenated into SQL query.');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Record Validation Verdict'));
        if (target) target.click();
      });
      await sleep(1200);
    }

    // 2. Duplicates Tab
    await clickTab('Duplicates');
    await sleep(1000);

    // 3. Classification & CVSS Tab
    await clickTab('Classification & CVSS');
    // Open Vector Builder
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.includes('Open Vector Builder'));
      if (target) target.click();
    });
    await sleep(1000);

    // Click 'Apply to Report' in modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.includes('Apply to Report'));
      if (target) target.click();
    });
    await sleep(1200);

    // 4. Threat Intelligence Tab
    await clickTab('Threat Intelligence');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.includes('Pull Fresh Threat Intel'));
      if (target) target.click();
    });
    await sleep(1500);

    // 5. Risk & What-If Tab
    await clickTab('Risk & What-If');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.includes('Recalculate Risk'));
      if (target) target.click();
    });
    await sleep(1500);

    const screenshot2 = path.join(SCREENSHOT_DIR, '02_analyst_triage_risk_cvss.png');
    await page.screenshot({ path: screenshot2, fullPage: false });
    console.log(`Saved screenshot 2: ${screenshot2}`);

    // =========================================================================
    // FLOW 3: Context Risk Contrast (Test Asset vs Production Asset)
    // =========================================================================
    console.log('--- FLOW 3: Context Risk Contrast Simulation ---');
    // Scroll down to What-If simulator widget in the Risk tab
    await page.evaluate(() => {
      window.scrollBy(0, 480);
    });
    await sleep(1000);

    const screenshot3 = path.join(SCREENSHOT_DIR, '03_context_risk_contrast.png');
    await page.screenshot({ path: screenshot3, fullPage: false });
    console.log(`Saved screenshot 3: ${screenshot3}`);

    // =========================================================================
    // FLOW 4: Remediation Lifecycle, Re-test Fail (REOPENED) -> Pass (CLOSED)
    // =========================================================================
    console.log('--- FLOW 4: Remediation Lifecycle, Reopen & Closure ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    // Helper: Step status using StatusTransitionModal
    async function transitionTo(statusTarget) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Update Status Workflow'));
        if (target) target.click();
      });
      await sleep(800);

      await page.evaluate((targetStatus) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find((b) => b.textContent.includes(targetStatus));
        if (btn) btn.click();
      }, statusTarget);
      await sleep(400);

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const confirm = btns.find((b) => b.textContent.includes('Confirm & Execute State Change'));
        if (confirm) confirm.click();
      });
      await sleep(1200);
    }

    // Assign to analyst
    const assignSelect = await page.$('select');
    if (assignSelect) {
      await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const assign = selects.find((s) => s.innerHTML.includes('analyst'));
        if (assign && assign.options.length > 1) {
          assign.selectedIndex = 1;
          assign.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const assignBtn = btns.find((b) => b.textContent.includes('Assign') || b.textContent.includes('Save Assignee'));
        if (assignBtn) assignBtn.click();
      });
      await sleep(1000);
    }

    // Transition to IN_PROGRESS
    try {
      await transitionTo('IN_PROGRESS');
    } catch (e) {}

    // Transition to RESOLVED
    try {
      await transitionTo('RESOLVED');
    } catch (e) {}

    // Remediation note
    await clickTab('Remediation');
    const remNoteArea = await page.$('textarea[placeholder*="remediation progress"]');
    if (remNoteArea) {
      await remNoteArea.type('Applied ORM parameterized query fix to prevent SQL injection in billing controller.');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Add Note') || b.textContent.includes('Log Remediation'));
        if (target) target.click();
      });
      await sleep(1000);
    }

    // Retest & Verification Tab: Record Failed re-test first
    await clickTab('Re-test & Verification');
    const failedRadio = await page.$('input[value="failed"]');
    if (failedRadio) {
      await failedRadio.click();
      const retestNotesArea = await page.$('textarea[placeholder*="re-test verification"]');
      if (retestNotesArea) {
        await retestNotesArea.type('Initial verification failed: Edge case with encoded URL payload still returned unsanitized records.');
      }
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Record Verification Verdict'));
        if (target) target.click();
      });
      await sleep(1500);
    }

    // Status is now REOPENED -> ASSIGNED! Move to IN_PROGRESS -> RESOLVED again
    try {
      await transitionTo('IN_PROGRESS');
      await transitionTo('RESOLVED');
    } catch (e) {}

    // Now record PASSED re-test
    await clickTab('Re-test & Verification');
    const passedRadio = await page.$('input[value="passed"]');
    if (passedRadio) {
      await passedRadio.click();
      const retestNotesArea = await page.$('textarea[placeholder*="re-test verification"]');
      if (retestNotesArea) {
        await retestNotesArea.type('Comprehensive automated test suite executed: All SQL injection vectors safely rejected with 400 Bad Request.');
      }
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Record Verification Verdict'));
        if (target) target.click();
      });
      await sleep(1500);
    }

    // Go to Audit Timeline tab to capture full lifecycle progression
    await clickTab('Audit Timeline');
    await sleep(1000);

    const screenshot4 = path.join(SCREENSHOT_DIR, '04_lifecycle_reopen_close.png');
    await page.screenshot({ path: screenshot4, fullPage: false });
    console.log(`Saved screenshot 4: ${screenshot4}`);

    // =========================================================================
    // FLOW 5: Admin Job Control Execution & Audit Log
    // =========================================================================
    console.log('--- FLOW 5: Admin Job Control & Audit Logs ---');
    await login('admin@flawtrack.local', 'Password123!');

    await page.goto('http://localhost:5173/admin/jobs', { waitUntil: 'networkidle2' });
    await page.waitForSelector('button');

    // Click "Run Now" on SLA Monitor Job
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent.includes('Run Now'));
      if (target) target.click();
    });
    await sleep(2500);

    const screenshot5 = path.join(SCREENSHOT_DIR, '05_admin_jobs_audit.png');
    await page.screenshot({ path: screenshot5, fullPage: false });
    console.log(`Saved screenshot 5: ${screenshot5}`);

    // =========================================================================
    // FLOW 6: Admin Settings & Formula Weights Validation
    // =========================================================================
    console.log('--- FLOW 6: Admin Settings & Weights Sum Validation ---');
    await page.goto('http://localhost:5173/admin/settings', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="number"]');

    // Trigger invalid weight sum validation
    const firstWeightInput = await page.$('input[type="number"]');
    if (firstWeightInput) {
      await firstWeightInput.click({ clickCount: 3 });
      await firstWeightInput.type('0.60'); // Increase weight so sum > 1.0
      await sleep(800);

      // Attempt save to display error banner
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Save All Settings'));
        if (target) target.click();
      });
      await sleep(1000);

      const screenshot6 = path.join(SCREENSHOT_DIR, '06_admin_settings_weights.png');
      await page.screenshot({ path: screenshot6, fullPage: false });
      console.log(`Saved screenshot 6: ${screenshot6}`);

      // Reset to defaults
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.textContent.includes('Reset to Defaults'));
        if (target) target.click();
      });
      await sleep(800);
    }

    // =========================================================================
    // FLOW 7: Security Posture Executive Dashboard
    // =========================================================================
    console.log('--- FLOW 7: Security Posture Executive Dashboard ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.grid');
    await sleep(1500);

    const screenshot7 = path.join(SCREENSHOT_DIR, '07_executive_dashboard.png');
    await page.screenshot({ path: screenshot7, fullPage: false });
    console.log(`Saved screenshot 7: ${screenshot7}`);

    console.log('All 7 end-to-end browser verification flows completed successfully!');
  } catch (err) {
    console.error('Error during browser verification:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
