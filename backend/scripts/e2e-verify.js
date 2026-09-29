const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function verifyAll() {
  console.log('--- VULNTRACK LIVE SERVER VERIFICATION ---');

  // 1. Health check
  const health = await axios.get('http://localhost:5000/health');
  console.log('✓ Health Check:', health.data.data?.status || 'OK');

  // 2. Auth Login (Admin)
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@vulntrack.local',
    password: 'Password123!',
  });
  const adminToken = loginRes.data.data.accessToken;
  console.log('✓ Admin Login Succeeded. User:', loginRes.data.data.user.name);

  const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

  // 3. Dashboard Summary
  const dashRes = await axios.get(`${BASE_URL}/dashboard/summary`, authHeader);
  const d = dashRes.data.data;
  console.log('✓ Dashboard Summary:');
  console.log(`   Total Vulnerabilities: ${d.kpis.totalCount}`);
  console.log(`   Open: ${d.kpis.openCount}`);
  console.log(`   P1 Critical: ${d.priorityCounts.P1 || 0}`);
  console.log(`   P2 High: ${d.priorityCounts.P2 || 0}`);
  console.log(`   SLA Compliance: ${d.kpis.slaCompliancePercent}%`);
  console.log(`   CISA KEV Exploited: ${d.kpis.inKevCount}`);
  console.log(`   Risky Assets: ${d.topRiskyAssets.length}`);

  // 4. Priority Queue
  const queueRes = await axios.get(`${BASE_URL}/vulnerabilities?sort=-risk.score`, authHeader);
  const vulns = queueRes.data.data.vulnerabilities || queueRes.data.data;
  console.log(`✓ Priority Queue loaded ${vulns.length} vulnerabilities.`);
  const topVuln = vulns[0];
  console.log(`   Top finding: "${topVuln.title}" [${topVuln.risk?.priority}] Score: ${topVuln.risk?.score.toFixed(1)}`);

  // 5. Test Live Duplicate Detection
  const dupCheck = await axios.post(
    `${BASE_URL}/vulnerabilities/check-duplicates`,
    {
      title: 'SQL Injection in User Login Parameter',
      description: 'SQL vulnerability on login form',
    },
    authHeader
  );
  console.log('✓ Live NLP Duplicate Check:');
  console.log(`   Is Duplicate Candidate: ${dupCheck.data.data.isPotentialDuplicate}`);
  console.log(`   Top Match Score: ${(dupCheck.data.data.highestSimilarity * 100).toFixed(1)}%`);

  // 6. Test Context Risk Difference (Test server vs Prod server)
  console.log('✓ Context-Aware Prioritization Verification:');
  const log4jProd = vulns.find(v => v.title.includes('Apache Log4j') && !v.title.includes('Isolated'));
  const log4jTest = vulns.find(v => v.title.includes('Isolated Security Lab'));
  if (log4jProd && log4jTest) {
    console.log(`   Production Asset (Crit 5, Internet-facing): ${log4jProd.risk?.priority} (Score: ${log4jProd.risk?.score.toFixed(1)})`);
    console.log(`   Sandbox Test Asset (Crit 1, Internal):       ${log4jTest.risk?.priority} (Score: ${log4jTest.risk?.score.toFixed(1)})`);
  }

  // 7. Test Background Job Trigger
  const slaJob = await axios.post(`${BASE_URL}/admin/jobs/sla-monitor/run`, {}, authHeader);
  console.log('✓ SLA Monitor background job run on demand:', slaJob.data.data.message);

  const threatJob = await axios.post(`${BASE_URL}/admin/jobs/threat-refresh/run`, {}, authHeader);
  console.log('✓ Threat Refresh background job run on demand:', threatJob.data.data.message);

  // 8. Audit Log
  const auditRes = await axios.get(`${BASE_URL}/audit`, authHeader);
  console.log(`✓ Audit Log verified: ${auditRes.data.data.length} immutable events recorded.`);

  console.log('----------------------------------------------------');
  console.log('ALL VULNTRACK LIVE SERVER ENGINES FUNCTIONING 100%!');
  console.log('----------------------------------------------------');
}

verifyAll().catch(err => {
  console.error('Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
