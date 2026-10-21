const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Asset = require('../../src/models/Asset');
const Vulnerability = require('../../src/models/Vulnerability');
const AuditLog = require('../../src/models/AuditLog');
const { ROLES, VULN_STATUSES } = require('../../src/config/constants');
const env = require('../../src/config/env');

describe('Security, RBAC Matrix & IDOR Penetration Tests', () => {
  let reporterA, reporterB, analyst, admin;
  let tokenA, tokenB, analystToken, adminToken;
  let testAsset;

  beforeEach(async () => {
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Vulnerability.deleteMany({});
    try {
      await mongoose.connection.collection('auditlogs').deleteMany({});
    } catch (e) {
      // Collection might not exist yet
    }

    const passwordHash = await bcrypt.hash('Password123!', 8);

    reporterA = await User.create({
      name: 'Reporter Alpha',
      email: 'reporterA@flawtrack.local',
      passwordHash,
      role: ROLES.REPORTER,
    });

    reporterB = await User.create({
      name: 'Reporter Beta',
      email: 'reporterB@flawtrack.local',
      passwordHash,
      role: ROLES.REPORTER,
    });

    analyst = await User.create({
      name: 'Security Analyst',
      email: 'analyst@flawtrack.local',
      passwordHash,
      role: ROLES.ANALYST,
    });

    admin = await User.create({
      name: 'System Admin',
      email: 'admin@flawtrack.local',
      passwordHash,
      role: ROLES.ADMIN,
    });

    tokenA = jwt.sign({ userId: reporterA._id, role: reporterA.role }, env.JWT_SECRET);
    tokenB = jwt.sign({ userId: reporterB._id, role: reporterB.role }, env.JWT_SECRET);
    analystToken = jwt.sign({ userId: analyst._id, role: analyst.role }, env.JWT_SECRET);
    adminToken = jwt.sign({ userId: admin._id, role: admin.role }, env.JWT_SECRET);

    testAsset = await Asset.create({
      name: 'Core Internal API',
      type: 'api',
      environment: 'production',
      criticality: 4,
      internetFacing: false,
      dataSensitivity: 4,
    });
  });

  describe('RBAC Authorization Matrix (401 vs 403 Enforcement)', () => {
    test('unauthenticated requests to protected endpoints return HTTP 401', async () => {
      const endpoints = [
        ['get', '/api/v1/vulnerabilities'],
        ['get', '/api/v1/assets'],
        ['get', '/api/v1/users'],
        ['get', '/api/v1/settings'],
        ['get', '/api/v1/audit'],
        ['get', '/api/v1/dashboard/summary'],
      ];

      for (const [method, url] of endpoints) {
        const res = await request(app)[method](url);
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      }
    });

    test('REPORTER role blocked from Analyst/Admin endpoints with HTTP 403', async () => {
      const vuln = await Vulnerability.create({
        title: 'Test Vuln',
        description: 'Desc',
        stepsToReproduce: 'Steps',
        impactDescription: 'Impact',
        reportedBy: reporterA._id,
      });

      const restrictedEndpoints = [
        ['post', `/api/v1/vulnerabilities/${vuln._id}/validate`, { result: 'valid' }],
        ['post', `/api/v1/vulnerabilities/${vuln._id}/cvss`, { vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' }],
        ['post', `/api/v1/vulnerabilities/${vuln._id}/assign`, { assignedTo: analyst._id }],
        ['post', `/api/v1/vulnerabilities/${vuln._id}/calculate-risk`, {}],
        ['get', '/api/v1/users'],
        ['post', '/api/v1/assets', { name: 'New Asset', type: 'web', environment: 'production', criticality: 3, internetFacing: true, dataSensitivity: 3 }],
        ['put', '/api/v1/settings', { riskWeights: { cvss: 0.3, epss: 0.2, kev: 0.2, assetCriticality: 0.15, businessImpact: 0.1, exposure: 0.05 } }],
      ];

      for (const [method, url, body] of restrictedEndpoints) {
        const req = request(app)[method](url).set('Authorization', `Bearer ${tokenA}`);
        if (body) req.send(body);
        const res = await req;
        expect(res.status).toBe(403);
      }
    });

    test('ANALYST role blocked from Admin-only endpoints with HTTP 403', async () => {
      // User management (admin only)
      const usersRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(usersRes.status).toBe(403);

      // Asset creation (admin only)
      const assetRes = await request(app)
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          name: 'Forbidden Asset',
          type: 'web',
          environment: 'production',
          criticality: 3,
          internetFacing: true,
          dataSensitivity: 3,
        });
      expect(assetRes.status).toBe(403);

      // Setting modification (admin only)
      const settingsRes = await request(app)
        .put('/api/v1/settings')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          riskWeights: { cvss: 0.3, epss: 0.2, kev: 0.2, assetCriticality: 0.15, businessImpact: 0.1, exposure: 0.05 },
        });
      expect(settingsRes.status).toBe(403);
    });

    test('ADMIN role has access to management endpoints', async () => {
      const usersRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(usersRes.status).toBe(200);

      const settingsRes = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(settingsRes.status).toBe(200);
    });
  });

  describe('IDOR Security (Insecure Direct Object Reference)', () => {
    let vulnB;

    beforeEach(async () => {
      vulnB = await Vulnerability.create({
        title: 'Reporter Beta Confidential Vulnerability',
        description: 'Internal zero-day finding',
        stepsToReproduce: 'Confidential repro',
        impactDescription: 'Severe data leak',
        reportedBy: reporterB._id,
        status: VULN_STATUSES.SUBMITTED,
        attachments: [
          {
            filename: 'secret-audit.pdf',
            originalName: 'secret-audit.pdf',
            path: 'uploads/secret-audit.pdf',
            mimetype: 'application/pdf',
            size: 1024,
            uploadedAt: new Date(),
          },
        ],
      });
    });

    test('Reporter A cannot view Reporter B report (GET /:id)', async () => {
      const res = await request(app)
        .get(`/api/v1/vulnerabilities/${vulnB._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Reporter A cannot edit Reporter B report (PATCH /:id)', async () => {
      const res = await request(app)
        .patch(`/api/v1/vulnerabilities/${vulnB._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Tampered Title' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Reporter A cannot access timeline of Reporter B report (GET /:id/timeline)', async () => {
      const res = await request(app)
        .get(`/api/v1/vulnerabilities/${vulnB._id}/timeline`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
    });

    test('Reporter A cannot download attachment of Reporter B report', async () => {
      const attachmentId = vulnB.attachments[0]._id;
      const res = await request(app)
        .get(`/api/v1/vulnerabilities/${vulnB._id}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Upload Hardening (Bypasses & Traversals)', () => {
    test('rejects double extension exploit (shell.php.png)', async () => {
      const res = await request(app)
        .post('/api/v1/vulnerabilities')
        .set('Authorization', `Bearer ${tokenA}`)
        .field('title', 'Double extension test')
        .field('description', 'Test shell upload')
        .field('stepsToReproduce', 'Repro')
        .field('impactDescription', 'Impact')
        .attach('attachments', Buffer.from('<?php echo "pwned"; ?>'), 'shell.php.png');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    test('rejects path traversal in filename (../../etc/passwd.txt)', async () => {
      const res = await request(app)
        .post('/api/v1/vulnerabilities')
        .set('Authorization', `Bearer ${tokenA}`)
        .field('title', 'Path traversal filename test')
        .field('description', 'Test traversal upload')
        .field('stepsToReproduce', 'Repro')
        .field('impactDescription', 'Impact')
        .attach('attachments', Buffer.from('innocent content'), '../../etc/passwd.txt');

      expect(res.status).toBe(201);
      // Stored filename must be a random UUID, not containing traversal segments
      const savedFilename = res.body.data.attachments[0].filename;
      expect(savedFilename).not.toContain('..');
      expect(savedFilename).not.toContain('/');
      expect(savedFilename).not.toContain('\\');
    });
  });

  describe('Re-test Reopened Lifecycle Path', () => {
    test('moves from RESOLVED to RETEST to REOPENED to ASSIGNED on re-test failure', async () => {
      const vuln = await Vulnerability.create({
        title: 'Improper Access Control in Admin Console',
        description: 'Bypassing access control',
        stepsToReproduce: 'Visit /admin without token',
        impactDescription: 'Admin privilege escalation',
        reportedBy: reporterA._id,
        assignedTo: analyst._id,
        status: VULN_STATUSES.RESOLVED,
      });

      // Retest with failure
      const retestRes = await request(app)
        .post(`/api/v1/vulnerabilities/${vuln._id}/retest`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ result: 'fail', notes: 'Fix did not work. Route still accessible without auth.' });

      expect(retestRes.status).toBe(200);
      // Status returned to ASSIGNED for rework
      expect(retestRes.body.data.status).toBe(VULN_STATUSES.ASSIGNED);
      expect(retestRes.body.data.reopenCount).toBe(1);
    });
  });

  describe('NoSQL Injection Prevention', () => {
    test('rejects or sanitizes NoSQL operator injection in auth bodies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $ne: null },
          password: 'Password123!',
        });

      // express-mongo-sanitize or Zod validation schema will reject object as email
      expect([400, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('AuditLog Immutability', () => {
    test('blocks updates and deletes on AuditLog records', async () => {
      const log = await AuditLog.create({
        actor: admin._id,
        actorRole: 'ADMIN',
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: reporterA._id,
      });

      // 1. Direct updateOne blocked
      await expect(
        AuditLog.updateOne({ _id: log._id }, { actorRole: 'HACKER' })
      ).rejects.toThrow('Security Violation');

      // 2. Direct deleteOne blocked
      await expect(
        AuditLog.deleteOne({ _id: log._id })
      ).rejects.toThrow('Security Violation');

      // 3. Document-level save mutation blocked
      log.actorRole = 'HACKER';
      await expect(log.save()).rejects.toThrow('Security Violation');
    });
  });
});
