const RiskEngineService = require('../../src/services/riskEngine.service');
const { PRIORITIES } = require('../../src/config/constants');

describe('Risk Engine Service', () => {
  const mockSettings = {
    riskWeights: {
      cvss: 0.30,
      epss: 0.20,
      kev: 0.20,
      assetCriticality: 0.15,
      businessImpact: 0.10,
      exposure: 0.05,
    },
    priorityThresholds: {
      p1: 70,
      p2: 50,
      p3: 30,
    },
    exposureValues: {
      internetFacingProduction: 1.0,
      internetFacingNonProduction: 0.7,
      internal: 0.4,
      isolatedTest: 0.1,
    },
  };

  describe('Weight Validation', () => {
    test('accepts valid weights that sum to 1.0', () => {
      expect(RiskEngineService.validateWeights(mockSettings.riskWeights)).toBe(true);
    });

    test('rejects invalid weights that do not sum to 1.0', () => {
      const invalidWeights = { ...mockSettings.riskWeights, cvss: 0.50 };
      expect(() => RiskEngineService.validateWeights(invalidWeights)).toThrow('Risk weights must sum to 1.0');
    });
  });

  describe('Context-Aware Prioritization (Core Differentiator)', () => {
    const vuln = {
      cvss: { baseScore: 7.5, severity: 'High' },
      threat: { epss: 0.40, epssPercentile: 0.85, inKev: false },
      affectedUsersCount: 50,
      internetFacing: false,
    };

    test('same vulnerability on an isolated test asset yields a lower priority than on internet-facing production', async () => {
      const testAsset = {
        name: 'Dev Lab VM',
        environment: 'test',
        criticality: 1,
        dataSensitivity: 1,
        internetFacing: false,
      };

      const prodAsset = {
        name: 'Customer Portal',
        environment: 'production',
        criticality: 5,
        dataSensitivity: 5,
        internetFacing: true,
      };

      const testResult = await RiskEngineService.calculateRisk(vuln, testAsset, mockSettings);
      const prodResult = await RiskEngineService.calculateRisk(vuln, prodAsset, mockSettings);

      expect(testResult.score).toBeLessThan(prodResult.score);
      // On test server with criticality 1, it should be P3 or P4
      expect([PRIORITIES.P3, PRIORITIES.P4]).toContain(testResult.priority);
      // On prod server with criticality 5 & internet facing, it should elevate to P2 or P1
      expect([PRIORITIES.P1, PRIORITIES.P2]).toContain(prodResult.priority);
    });
  });

  describe('Safety Policy Overrides', () => {
    test('floors priority at P1 when vulnerability is listed in CISA KEV on internet-facing asset', async () => {
      const vuln = {
        cvss: { baseScore: 5.0 }, // Moderate technical score
        threat: { epss: 0.1, inKev: true }, // In KEV!
        affectedUsersCount: 10,
        internetFacing: true,
      };

      const prodAsset = {
        name: 'Public Web Proxy',
        environment: 'production',
        criticality: 2,
        dataSensitivity: 2,
        internetFacing: true,
      };

      const result = await RiskEngineService.calculateRisk(vuln, prodAsset, mockSettings);

      expect(result.priority).toBe(PRIORITIES.P1);
      expect(result.overridesApplied.length).toBeGreaterThan(0);
      expect(result.overridesApplied[0]).toContain('Elevated to P1: Active CISA KEV exploitation');
    });

    test('floors priority at P2 when CVSS >= 9.0 even with low environmental factors', async () => {
      const vuln = {
        cvss: { baseScore: 9.8 }, // Critical CVSS
        threat: { epss: 0.01, inKev: false },
        affectedUsersCount: 2,
        internetFacing: false,
      };

      const testAsset = {
        name: 'Internal Dev Host',
        environment: 'development',
        criticality: 1,
        dataSensitivity: 1,
        internetFacing: false,
      };

      const result = await RiskEngineService.calculateRisk(vuln, testAsset, mockSettings);

      // Score might be low due to zero threat and low asset, but floor at P2 must trigger
      expect([PRIORITIES.P1, PRIORITIES.P2]).toContain(result.priority);
      if (result.score < 50) {
        expect(result.priority).toBe(PRIORITIES.P2);
        expect(result.overridesApplied).toContain('Floored at P2: CVSS base score exceeds 9.0 (Critical technical severity).');
      }
    });
  });

  describe('Component Breakdown & Explanations', () => {
    test('generates transparent breakdown weights and human-readable explanation', async () => {
      const vuln = {
        cvss: { baseScore: 8.5, severity: 'High' },
        threat: { epss: 0.85, epssPercentile: 0.98, inKev: true },
        affectedUsersCount: 5000,
        internetFacing: true,
      };

      const asset = {
        name: 'Core Payment Gateway',
        environment: 'production',
        criticality: 5,
        dataSensitivity: 5,
        internetFacing: true,
      };

      const result = await RiskEngineService.calculateRisk(vuln, asset, mockSettings);

      expect(result.breakdown).toHaveProperty('cvssWeight');
      expect(result.breakdown).toHaveProperty('epssWeight');
      expect(result.breakdown).toHaveProperty('kevWeight');
      expect(result.breakdown).toHaveProperty('assetCriticalityWeight');
      expect(result.breakdown).toHaveProperty('businessImpactWeight');
      expect(result.breakdown).toHaveProperty('exposureWeight');

      expect(result.explanation).toBeInstanceOf(Array);
      expect(result.explanation.length).toBeGreaterThanOrEqual(3);
    });

    test('handles completely missing EPSS, KEV, and asset data without NaN or undefined', async () => {
      const bareVuln = {
        cvss: { baseScore: 6.0 },
        // threat is completely missing
        // asset is null
        affectedUsersCount: null,
      };

      const result = await RiskEngineService.calculateRisk(bareVuln, null, mockSettings);

      expect(isNaN(result.score)).toBe(false);
      expect(typeof result.score).toBe('number');
      expect([PRIORITIES.P1, PRIORITIES.P2, PRIORITIES.P3, PRIORITIES.P4]).toContain(result.priority);

      // Verify all breakdown components are finite numbers
      for (const [key, val] of Object.entries(result.breakdown)) {
        expect(isNaN(val)).toBe(false);
        expect(typeof val).toBe('number');
      }

      // Verify explanation contains no NaN or undefined
      for (const line of result.explanation) {
        expect(line).not.toContain('NaN');
        expect(line).not.toContain('undefined');
      }
    });
  });

  describe('Threshold Boundary Values', () => {
    test('enforces exact boundary transitions at 70, 50, and 30', async () => {
      // Custom weights where each input maps linearly to the score
      const linearSettings = {
        ...mockSettings,
        riskWeights: {
          cvss: 1.0,
          epss: 0.0,
          kev: 0.0,
          assetCriticality: 0.0,
          businessImpact: 0.0,
          exposure: 0.0,
        },
      };

      // 1. Boundary at 70 (P1 >= 70, P2 < 70)
      const vuln70 = { cvss: { baseScore: 7.0 }, internetFacing: false };
      const res70 = await RiskEngineService.calculateRisk(vuln70, null, linearSettings);
      expect(res70.score).toBe(70.0);
      expect(res70.priority).toBe(PRIORITIES.P1);

      const vuln699 = { cvss: { baseScore: 6.99 }, internetFacing: false };
      const res699 = await RiskEngineService.calculateRisk(vuln699, null, linearSettings);
      expect(res699.score).toBe(69.9);
      expect(res699.priority).toBe(PRIORITIES.P2);

      // 2. Boundary at 50 (P2 >= 50, P3 < 50)
      const vuln50 = { cvss: { baseScore: 5.0 }, internetFacing: false };
      const res50 = await RiskEngineService.calculateRisk(vuln50, null, linearSettings);
      expect(res50.score).toBe(50.0);
      expect(res50.priority).toBe(PRIORITIES.P2);

      const vuln499 = { cvss: { baseScore: 4.99 }, internetFacing: false };
      const res499 = await RiskEngineService.calculateRisk(vuln499, null, linearSettings);
      expect(res499.score).toBe(49.9);
      expect(res499.priority).toBe(PRIORITIES.P3);

      // 3. Boundary at 30 (P3 >= 30, P4 < 30)
      const vuln30 = { cvss: { baseScore: 3.0 }, internetFacing: false };
      const res30 = await RiskEngineService.calculateRisk(vuln30, null, linearSettings);
      expect(res30.score).toBe(30.0);
      expect(res30.priority).toBe(PRIORITIES.P3);

      const vuln299 = { cvss: { baseScore: 2.99 }, internetFacing: false };
      const res299 = await RiskEngineService.calculateRisk(vuln299, null, linearSettings);
      expect(res299.score).toBe(29.9);
      expect(res299.priority).toBe(PRIORITIES.P4);
    });
  });
});
