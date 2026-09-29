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
  });
});
