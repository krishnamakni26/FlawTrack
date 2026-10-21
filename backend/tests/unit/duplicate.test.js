const DuplicateService = require('../../src/services/duplicate.service');

describe('Duplicate Detection Service', () => {
  describe('Text Preprocessing', () => {
    test('cleans, tokenizes, removes stop words and stems keywords', () => {
      const tokens = DuplicateService.preprocessText('The user is executing arbitrary SQL queries in the database');
      expect(tokens).toContain('user');
      expect(tokens).toContain('execut');
      expect(tokens).toContain('arbitrari');
      expect(tokens).toContain('sql');
      expect(tokens).toContain('databas');
      // Stop words stripped
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('is');
      expect(tokens).not.toContain('in');
    });
  });

  describe('Similarity Calculation', () => {
    test('scores near-identical reports above threshold (>= 0.75)', () => {
      const reportA = {
        title: 'SQL Injection in User Login Parameter',
        description: 'Attacker can inject SQL via username field on the login portal leading to auth bypass.',
        stepsToReproduce: '1. Navigate to /login 2. Enter admin OR 1=1 3. Click Submit',
        category: 'SQL Injection',
        cveId: 'CVE-2023-1111',
      };

      const reportB = {
        title: 'SQL Injection in User Login Parameter',
        description: 'Vulnerability allows SQL injection on login screen via username input parameter.',
        stepsToReproduce: '1. Go to /login 2. Put admin OR 1=1 in username 3. Submit request',
        category: 'SQL Injection',
        cveId: 'CVE-2023-1111',
      };

      const score = DuplicateService.computeScore(reportA, reportB);
      expect(score).toBeGreaterThanOrEqual(0.75);
    });

    test('scores fundamentally different reports below 0.35', () => {
      const reportA = {
        title: 'Reflected Cross-Site Scripting in Search Query',
        description: 'The search input reflects raw user script tags without HTML entity escaping.',
        stepsToReproduce: 'Enter <script>alert(1)</script> in search box.',
        category: 'XSS',
      };

      const reportB = {
        title: 'Memory Corruption Heap Overflow in Network Daemon',
        description: 'Sending a malformed packet triggers a buffer overflow in packet parser.',
        stepsToReproduce: 'Send 2048 bytes of 0x90 to port 445.',
        category: 'Other',
      };

      const score = DuplicateService.computeScore(reportA, reportB);
      expect(score).toBeLessThan(0.35);
    });

    test('awards identifier bonus for exact CVE match', () => {
      const reportA = {
        title: 'Remote code execution in logging framework',
        description: 'JNDI injection flaw allows remote class loading.',
        stepsToReproduce: 'Inject ldap url.',
        category: 'RCE',
        cveId: 'CVE-2021-44228',
      };

      const reportB = {
        title: 'Apache Log4j flaw discovered',
        description: 'Log4shell vulnerability present on web interface.',
        stepsToReproduce: 'Supply test header.',
        category: 'RCE',
        cveId: 'CVE-2021-44228',
      };

      const reportC = {
        ...reportB,
        cveId: 'CVE-2022-9999', // Different CVE
      };

      const scoreWithMatchingCve = DuplicateService.computeScore(reportA, reportB);
      const scoreWithDifferentCve = DuplicateService.computeScore(reportA, reportC);

      expect(scoreWithMatchingCve).toBeGreaterThan(scoreWithDifferentCve);
    });

    test('handles empty strings, special characters, and short text without crashing', () => {
      expect(() => {
        const score = DuplicateService.computeScore({}, {});
        expect(score).toBe(0);
      }).not.toThrow();

      expect(() => {
        const score = DuplicateService.computeScore(
          { title: '!@#$%^&*()', description: '123 456' },
          { title: '...', description: '   ' }
        );
        expect(score).toBe(0);
      }).not.toThrow();

      expect(DuplicateService.preprocessText('')).toEqual([]);
      expect(DuplicateService.preprocessText(null)).toEqual([]);
      expect(DuplicateService.preprocessText('a to the is')).toEqual([]);
    });
  });

  describe('Database Duplicate Queries & Filters', () => {
    test('never matches report against itself or against REJECTED items', async () => {
      const Vulnerability = require('../../src/models/Vulnerability');
      const mongoose = require('mongoose');

      const existingId = new mongoose.Types.ObjectId();
      const rejectedId = new mongoose.Types.ObjectId();
      const duplicateId = new mongoose.Types.ObjectId();
      const validTargetId = new mongoose.Types.ObjectId();

      const userId = new mongoose.Types.ObjectId();

      // Seed mock records with all required fields
      await Vulnerability.create([
        {
          _id: existingId,
          title: 'Remote Buffer Overflow in Auth Daemon',
          description: 'Buffer overflow vulnerability in authentication daemon parser.',
          stepsToReproduce: 'Send 5000 bytes payload to auth socket',
          impactDescription: 'Remote code execution as root',
          reportedBy: userId,
          status: 'OPEN',
        },
        {
          _id: rejectedId,
          title: 'Remote Buffer Overflow in Auth Daemon',
          description: 'Buffer overflow vulnerability in authentication daemon parser.',
          stepsToReproduce: 'Send 5000 bytes payload to auth socket',
          impactDescription: 'Remote code execution as root',
          reportedBy: userId,
          status: 'REJECTED',
        },
        {
          _id: duplicateId,
          title: 'Remote Buffer Overflow in Auth Daemon',
          description: 'Buffer overflow vulnerability in authentication daemon parser.',
          stepsToReproduce: 'Send 5000 bytes payload to auth socket',
          impactDescription: 'Remote code execution as root',
          reportedBy: userId,
          status: 'DUPLICATE',
        },
      ]);

      const target = {
        _id: existingId,
        title: 'Remote Buffer Overflow in Auth Daemon',
        description: 'Buffer overflow vulnerability in authentication daemon parser.',
        stepsToReproduce: 'Send 5000 bytes payload to auth socket',
        impactDescription: 'Remote code execution as root',
      };

      // Search duplicates for existingId without passing excludeId
      const result = await DuplicateService.findDuplicates(target);

      // Verify existingId is not matched against itself
      const matchedSelf = result.matches.some(
        (m) => m.vulnerabilityId.toString() === existingId.toString()
      );
      expect(matchedSelf).toBe(false);

      // Verify rejectedId is excluded
      const matchedRejected = result.matches.some(
        (m) => m.vulnerabilityId.toString() === rejectedId.toString()
      );
      expect(matchedRejected).toBe(false);

      // Verify duplicateId is excluded
      const matchedDuplicate = result.matches.some(
        (m) => m.vulnerabilityId.toString() === duplicateId.toString()
      );
      expect(matchedDuplicate).toBe(false);
    });
  });
});
