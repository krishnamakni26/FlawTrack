const SlaService = require('../../src/services/sla.service');
const { PRIORITIES } = require('../../src/config/constants');

describe('SLA Service', () => {
  const mockSettings = {
    slaHoursByPriority: {
      P1: 24,
      P2: 72,
      P3: 168,
      P4: 720,
    },
    warningPercent: 75,
  };

  test('computes exact SLA dueAt deadlines for each priority', async () => {
    const baseDate = new Date('2026-01-01T00:00:00.000Z');

    const slaP1 = await SlaService.computeSla(PRIORITIES.P1, baseDate, mockSettings);
    expect(slaP1.hoursAllowed).toBe(24);
    expect(new Date(slaP1.dueAt).toISOString()).toBe('2026-01-02T00:00:00.000Z');

    const slaP2 = await SlaService.computeSla(PRIORITIES.P2, baseDate, mockSettings);
    expect(slaP2.hoursAllowed).toBe(72);
    expect(new Date(slaP2.dueAt).toISOString()).toBe('2026-01-04T00:00:00.000Z');

    const slaP3 = await SlaService.computeSla(PRIORITIES.P3, baseDate, mockSettings);
    expect(slaP3.hoursAllowed).toBe(168);
    expect(new Date(slaP3.dueAt).toISOString()).toBe('2026-01-08T00:00:00.000Z');

    const slaP4 = await SlaService.computeSla(PRIORITIES.P4, baseDate, mockSettings);
    expect(slaP4.hoursAllowed).toBe(720);
    expect(new Date(slaP4.dueAt).toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });

  test('detects healthy SLA status (< 75% elapsed)', () => {
    const startTime = new Date('2026-01-01T00:00:00.000Z');
    const dueAt = new Date('2026-01-02T00:00:00.000Z'); // 24 hours allowed
    const sla = { dueAt, hoursAllowed: 24, warningPercent: 75 };

    const checkTime = new Date('2026-01-01T12:00:00.000Z'); // 12 hours (50%) elapsed
    const status = SlaService.checkSlaStatus(sla, checkTime);

    expect(status.isWarning).toBe(false);
    expect(status.isBreached).toBe(false);
    expect(status.percentElapsed).toBe(50);
    expect(status.hoursRemaining).toBe(12);
  });

  test('triggers warning flag when >= 75% elapsed', () => {
    const startTime = new Date('2026-01-01T00:00:00.000Z');
    const dueAt = new Date('2026-01-02T00:00:00.000Z'); // 24h
    const sla = { dueAt, hoursAllowed: 24, warningPercent: 75 };

    const checkTime = new Date('2026-01-01T19:00:00.000Z'); // 19h (~79%) elapsed
    const status = SlaService.checkSlaStatus(sla, checkTime);

    expect(status.isWarning).toBe(true);
    expect(status.isBreached).toBe(false);
    expect(status.percentElapsed).toBe(79);
    expect(status.hoursRemaining).toBe(5);
  });

  test('flags breach when current time passes deadline', () => {
    const startTime = new Date('2026-01-01T00:00:00.000Z');
    const dueAt = new Date('2026-01-02T00:00:00.000Z');
    const sla = { dueAt, hoursAllowed: 24, warningPercent: 75 };

    const checkTime = new Date('2026-01-02T02:00:00.000Z'); // 2 hours overdue
    const status = SlaService.checkSlaStatus(sla, checkTime);

    expect(status.isBreached).toBe(true);
    expect(status.isWarning).toBe(false);
    expect(status.hoursRemaining).toBeLessThan(0);
  });

  test('recalculates SLA dueAt when priority changes', async () => {
    const baseDate = new Date('2026-01-01T00:00:00.000Z');
    const vuln = {
      createdAt: baseDate,
      sla: {
        dueAt: new Date('2026-01-08T00:00:00.000Z'), // P3: 168 hours
        hoursAllowed: 168,
      },
    };

    // Escalate to P1 (24h)
    const newSla = await SlaService.recalculateSlaForNewPriority(vuln, PRIORITIES.P1, mockSettings);
    expect(newSla.hoursAllowed).toBe(24);
    expect(new Date(newSla.dueAt).toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });
});
