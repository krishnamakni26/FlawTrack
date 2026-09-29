const Setting = require('../models/Setting');
const { DEFAULT_SLA_HOURS } = require('../config/constants');

class SlaService {
  /**
   * Compute SLA deadline from priority and starting baseline date
   */
  static async computeSla(priority, baseDate = new Date(), customSettings = null) {
    if (!priority) return null;

    const settings = customSettings || (await Setting.getSettings());
    const slaHours = settings.slaHoursByPriority || DEFAULT_SLA_HOURS;
    const hoursAllowed = slaHours[priority] || 168;

    const startTime = baseDate instanceof Date ? baseDate.getTime() : new Date(baseDate).getTime();
    const dueAt = new Date(startTime + hoursAllowed * 60 * 60 * 1000);

    return {
      dueAt,
      hoursAllowed,
      warningSent: false,
      breached: false,
      breachedAt: null,
      warningPercent: settings.warningPercent || 75,
    };
  }

  /**
   * Recalculate SLA when priority changes
   */
  static async recalculateSlaForNewPriority(vuln, newPriority, customSettings = null) {
    // If the vulnerability was previously assigned/prioritized, base SLA on that time, else now
    const baseDate = vuln.sla?.dueAt && vuln.sla?.hoursAllowed
      ? new Date(vuln.sla.dueAt.getTime() - vuln.sla.hoursAllowed * 60 * 60 * 1000)
      : vuln.createdAt || new Date();

    const newSla = await SlaService.computeSla(newPriority, baseDate, customSettings);

    // Check if the new deadline is already in the past
    const now = Date.now();
    if (newSla.dueAt.getTime() < now) {
      newSla.breached = true;
      newSla.breachedAt = newSla.dueAt;
      newSla.warningSent = true;
    }

    return newSla;
  }

  /**
   * Check status against SLA deadlines (used by cron job and UI)
   */
  static checkSlaStatus(sla, now = new Date()) {
    if (!sla || !sla.dueAt || !sla.hoursAllowed) {
      return {
        hasSla: false,
        isWarning: false,
        isBreached: false,
        percentElapsed: 0,
        hoursRemaining: 0,
      };
    }

    const totalDurationMs = sla.hoursAllowed * 60 * 60 * 1000;
    const startTimeMs = new Date(sla.dueAt).getTime() - totalDurationMs;
    const currentMs = now.getTime();

    const elapsedMs = Math.max(0, currentMs - startTimeMs);
    const percentElapsed = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));
    const hoursRemaining = Math.round(((new Date(sla.dueAt).getTime() - currentMs) / (60 * 60 * 1000)) * 10) / 10;

    const isBreached = currentMs > new Date(sla.dueAt).getTime();
    const warningThresholdMs = startTimeMs + (totalDurationMs * (sla.warningPercent || 75)) / 100;
    const isWarning = currentMs >= warningThresholdMs && !isBreached;

    return {
      hasSla: true,
      isWarning,
      isBreached,
      percentElapsed,
      hoursRemaining,
    };
  }
}

module.exports = SlaService;
