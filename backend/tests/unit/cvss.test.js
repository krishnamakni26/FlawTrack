const CvssService = require('../../src/services/cvss.service');

describe('CVSS v3.1 Calculator Service', () => {
  describe('Standard Reference Vectors', () => {
    test('calculates 9.8 (Critical) for unauthenticated network RCE with scope unchanged', () => {
      const vector = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H';
      const result = CvssService.calculateFromVector(vector);

      expect(result.baseScore).toBe(9.8);
      expect(result.severity).toBe('Critical');
      expect(result.vector).toBe(vector);
      expect(result.exploitability).toBe(3.9);
      expect(result.impact).toBe(5.9);
    });

    test('calculates 10.0 (Critical) with scope changed', () => {
      const vector = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H';
      const result = CvssService.calculateFromVector(vector);

      expect(result.baseScore).toBe(10.0);
      expect(result.severity).toBe('Critical');
    });

    test('calculates 6.5 (Medium) for low privilege info disclosure', () => {
      const vector = 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N';
      const result = CvssService.calculateFromVector(vector);

      expect(result.baseScore).toBe(6.5);
      expect(result.severity).toBe('Medium');
    });

    test('calculates 5.5 (Medium) for local DoS', () => {
      const vector = 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H';
      const result = CvssService.calculateFromVector(vector);

      expect(result.baseScore).toBe(5.5);
      expect(result.severity).toBe('Medium');
    });

    test('calculates 0.0 (None) for zero impact vector', () => {
      const vector = 'CVSS:3.1/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N';
      const result = CvssService.calculateFromVector(vector);

      expect(result.baseScore).toBe(0.0);
      expect(result.severity).toBe('None');
    });
  });

  describe('Validation & Parsing', () => {
    test('throws error on missing CVSS prefix', () => {
      expect(() => {
        CvssService.parseVector('AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H');
      }).toThrow("Vector must start with 'CVSS:3.1/'");
    });

    test('throws error on missing required metrics', () => {
      expect(() => {
        CvssService.parseVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H');
      }).toThrow('Missing required CVSS metric: A');
    });

    test('throws error on invalid metric values', () => {
      expect(() => {
        CvssService.calculateFromMetrics({
          AV: 'INVALID',
          AC: 'L',
          PR: 'N',
          UI: 'N',
          S: 'U',
          C: 'H',
          I: 'H',
          A: 'H',
        });
      }).toThrow('Invalid Attack Vector (AV)');
    });
  });

  describe('Rounding Function', () => {
    test('correctly rounds up to the next decimal digit', () => {
      expect(CvssService.roundUp(4.01)).toBe(4.1);
      expect(CvssService.roundUp(4.00)).toBe(4.0);
      expect(CvssService.roundUp(9.84)).toBe(9.9);
      expect(CvssService.roundUp(9.80)).toBe(9.8);
    });
  });
});
