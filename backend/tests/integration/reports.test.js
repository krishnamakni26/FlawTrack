const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Vulnerability = require('../../src/models/Vulnerability');
const Asset = require('../../src/models/Asset');
const AuditLog = require('../../src/models/AuditLog');
const { ROLES, VULN_STATUSES, AUDIT_ACTIONS } = require('../../src/config/constants');
const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');

describe('Reports API Integration Tests', () => {
  let adminUser, analystUser, reporterUser, otherReporterUser;
  let adminToken, analystToken, reporterToken, otherReporterToken;
  let sampleVuln, otherVuln;

  beforeEach(async () => {
    // Create test users
    adminUser = await User.create({
      name: 'Admin Tester',
      email: 'admin_test@flawtrack.local',
      passwordHash: 'hashed_pw',
      role: ROLES.ADMIN,
    });

    analystUser = await User.create({
      name: 'Analyst Tester',
      email: 'analyst_test@flawtrack.local',
      passwordHash: 'hashed_pw',
      role: ROLES.ANALYST,
    });

    reporterUser = await User.create({
      name: 'Reporter Tester',
      email: 'reporter_test@flawtrack.local',
      passwordHash: 'hashed_pw',
      role: ROLES.REPORTER,
    });

    otherReporterUser = await User.create({
      name: 'Other Reporter',
      email: 'other_reporter@flawtrack.local',
      passwordHash: 'hashed_pw',
      role: ROLES.REPORTER,
    });

    adminToken = jwt.sign({ userId: adminUser._id, role: adminUser.role }, env.JWT_SECRET);
    analystToken = jwt.sign({ userId: analystUser._id, role: analystUser.role }, env.JWT_SECRET);
    reporterToken = jwt.sign({ userId: reporterUser._id, role: reporterUser.role }, env.JWT_SECRET);
    otherReporterToken = jwt.sign({ userId: otherReporterUser._id, role: otherReporterUser.role }, env.JWT_SECRET);

    // Create sample vulnerabilities
    sampleVuln = await Vulnerability.create({
      title: 'Remote Code Execution in Admin API',
      description: 'Unauthenticated command injection vulnerability in report endpoint',
      stepsToReproduce: '1. Send curl payload with shell metacharacters',
      impactDescription: 'Complete server compromise and data exfiltration',
      affectedUsersCount: 5000,
      internetFacing: true,
      category: 'RCE',
      cveId: 'CVE-2024-9999',
      cweId: 'CWE-78',
      reportedBy: reporterUser._id,
      status: VULN_STATUSES.VALIDATED,
      risk: {
        score: 88.5,
        priority: 'P1',
        breakdown: {
          cvssWeight: 28.5,
          epssWeight: 18.0,
          kevWeight: 20.0,
          assetCriticalityWeight: 12.0,
          businessImpactWeight: 7.0,
          exposureWeight: 3.0,
        },
        overridesApplied: ['Elevated to P1: Active CISA KEV on internet-facing asset'],
      },
      sla: {
        dueAt: new Date(Date.now() + 24 * 3600 * 1000),
        breached: false,
      },
    });

    otherVuln = await Vulnerability.create({
      title: 'Cross-Site Scripting in User Profile',
      description: 'Stored XSS vulnerability in bio field',
      stepsToReproduce: '1. Insert script tag in bio',
      impactDescription: 'Session hijacking',
      reportedBy: otherReporterUser._id,
      status: VULN_STATUSES.SUBMITTED,
      risk: {
        score: 35.0,
        priority: 'P3',
      },
    });
  });

  describe('GET /api/reports/vulnerability/:id', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get(`/api/reports/vulnerability/${sampleVuln._id}`);
      expect(res.status).toBe(401);
    });

    it('should generate a valid PDF starting with %PDF for authorized user', async () => {
      const res = await request(app)
        .get(`/api/reports/vulnerability/${sampleVuln._id}?format=pdf`)
        .set('Authorization', `Bearer ${analystToken}`)
        .buffer(true)
        .parse((res, callback) => {
          res.data = '';
          res.setEncoding('binary');
          res.on('data', (chunk) => {
            res.data += chunk;
          });
          res.on('end', () => {
            callback(null, Buffer.from(res.data, 'binary'));
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain(`FlawTrack_Report_${sampleVuln._id}`);

      // Verify PDF magic bytes
      const headerStr = res.body.slice(0, 5).toString('utf-8');
      expect(headerStr).toBe('%PDF-');

      // Verify audit log entry
      const log = await AuditLog.findOne({
        action: AUDIT_ACTIONS.REPORT_GENERATED,
        entityId: sampleVuln._id,
      });
      expect(log).toBeTruthy();
      expect(log.actorRole).toBe(ROLES.ANALYST);
    });

    it('should generate valid CSV with correct headers', async () => {
      const res = await request(app)
        .get(`/api/reports/vulnerability/${sampleVuln._id}?format=csv`)
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('"_id"');
      expect(res.text).toContain('"title"');
      expect(res.text).toContain('"priority"');
      expect(res.text).toContain('"riskScore"');
      expect(res.text).toContain('Remote Code Execution in Admin API');
    });

    it('should return JSON report with metadata and vulnerability data', async () => {
      const res = await request(app)
        .get(`/api/reports/vulnerability/${sampleVuln._id}?format=json`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body.reportId).toBeDefined();
      expect(res.body.vulnerability).toBeDefined();
      expect(res.body.vulnerability.title).toBe(sampleVuln.title);
    });

    it('should allow Reporter to export their own vulnerability report', async () => {
      const res = await request(app)
        .get(`/api/reports/vulnerability/${sampleVuln._id}?format=json`)
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vulnerability._id.toString()).toBe(sampleVuln._id.toString());
    });

    it('should reject Reporter attempting to export another user’s vulnerability report with 403', async () => {
      const res = await request(app)
        .get(`/api/reports/vulnerability/${otherVuln._id}?format=pdf`)
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/reports/summary', () => {
    it('should reject Reporter from accessing summary reports with 403', async () => {
      const res = await request(app)
        .get('/api/reports/summary?format=pdf')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(403);
    });

    it('should generate Executive Summary PDF for Analyst', async () => {
      const res = await request(app)
        .get('/api/reports/summary?format=pdf')
        .set('Authorization', `Bearer ${analystToken}`)
        .buffer(true)
        .parse((res, callback) => {
          res.data = '';
          res.setEncoding('binary');
          res.on('data', (chunk) => {
            res.data += chunk;
          });
          res.on('end', () => {
            callback(null, Buffer.from(res.data, 'binary'));
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      const headerStr = res.body.slice(0, 5).toString('utf-8');
      expect(headerStr).toBe('%PDF-');
    });

    it('should generate Executive Summary CSV with expected columns', async () => {
      const res = await request(app)
        .get('/api/reports/summary?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('"_id"');
      expect(res.text).toContain('"title"');
      expect(res.text).toContain('"priority"');
      expect(res.text).toContain('"status"');
    });
  });

  describe('GET /api/reports/sla', () => {
    it('should generate SLA Compliance PDF for Admin', async () => {
      const res = await request(app)
        .get('/api/reports/sla?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .buffer(true)
        .parse((res, callback) => {
          res.data = '';
          res.setEncoding('binary');
          res.on('data', (chunk) => {
            res.data += chunk;
          });
          res.on('end', () => {
            callback(null, Buffer.from(res.data, 'binary'));
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      const headerStr = res.body.slice(0, 5).toString('utf-8');
      expect(headerStr).toBe('%PDF-');
    });

    it('should generate SLA Compliance CSV with expected headers', async () => {
      const res = await request(app)
        .get('/api/reports/sla?format=csv')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('"slaDueAt"');
      expect(res.text).toContain('"slaBreached"');
    });
  });
});
