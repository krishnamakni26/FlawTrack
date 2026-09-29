const Vulnerability = require('../models/Vulnerability');
const User = require('../models/User');
const SlaService = require('../services/sla.service');
const NotificationService = require('../services/notification.service');
const AuditService = require('../services/audit.service');
const { VULN_STATUSES, ROLES, AUDIT_ACTIONS } = require('../config/constants');
const logger = require('../utils/logger');

class SlaMonitorJob {
  /**
   * Monitor SLA progress, fire warnings at 75% elapsed and mark breaches at 100%
   */
  static async execute() {
    logger.info('[JOB: SLA Monitor] Starting SLA compliance check...');

    const activeStatuses = [
      VULN_STATUSES.PRIORITIZED,
      VULN_STATUSES.OPEN,
      VULN_STATUSES.ASSIGNED,
      VULN_STATUSES.IN_PROGRESS,
      VULN_STATUSES.REOPENED,
    ];

    try {
      const candidates = await Vulnerability.find({
        status: { $in: activeStatuses },
        'sla.dueAt': { $ne: null },
      }).populate('assignedTo', 'name email');

      let warningsSent = 0;
      let breachesLogged = 0;

      for (const vuln of candidates) {
        const slaStatus = SlaService.checkSlaStatus(vuln.sla);

        // 1. SLA Warning (75% elapsed)
        if (slaStatus.isWarning && !vuln.sla.warningSent) {
          vuln.sla.warningSent = true;
          await vuln.save();
          warningsSent++;

          const targetUserId = vuln.assignedTo?._id || vuln.reportedBy;
          await NotificationService.notify({
            userId: targetUserId,
            type: 'SLA_WARNING',
            message: `Warning: SLA for "${vuln.title}" (${vuln.risk?.priority}) is ${slaStatus.percentElapsed}% elapsed. Due in ${slaStatus.hoursRemaining} hours.`,
            vulnerabilityId: vuln._id,
          });

          await AuditService.log({
            actor: null,
            actorRole: 'SYSTEM',
            action: AUDIT_ACTIONS.SLA_WARNING,
            entityType: 'Vulnerability',
            entityId: vuln._id,
            after: { percentElapsed: slaStatus.percentElapsed, hoursRemaining: slaStatus.hoursRemaining },
          });
        }

        // 2. SLA Breach (100% elapsed)
        if (slaStatus.isBreached && !vuln.sla.breached) {
          vuln.sla.breached = true;
          vuln.sla.breachedAt = new Date();
          await vuln.save();
          breachesLogged++;

          // Notify assignee
          if (vuln.assignedTo?._id) {
            await NotificationService.notify({
              userId: vuln.assignedTo._id,
              type: 'SLA_BREACH',
              message: `CRITICAL: SLA deadline has been BREACHED for "${vuln.title}" (${vuln.risk?.priority}). Immediate escalation required.`,
              vulnerabilityId: vuln._id,
            });
          }

          // Notify Admins
          const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
          for (const admin of admins) {
            await NotificationService.notify({
              userId: admin._id,
              type: 'SLA_BREACH',
              message: `SLA Breach Escalation: Vulnerability "${vuln.title}" (${vuln.risk?.priority}) is overdue!`,
              vulnerabilityId: vuln._id,
            });
          }

          await AuditService.log({
            actor: null,
            actorRole: 'SYSTEM',
            action: AUDIT_ACTIONS.SLA_BREACHED,
            entityType: 'Vulnerability',
            entityId: vuln._id,
            after: { priority: vuln.risk?.priority, dueAt: vuln.sla.dueAt },
          });
        }
      }

      logger.info(
        `[JOB: SLA Monitor] Checked ${candidates.length} items. Warnings sent: ${warningsSent}, Breaches flagged: ${breachesLogged}`
      );

      return {
        success: true,
        checkedCount: candidates.length,
        warningsSent,
        breachesLogged,
        executedAt: new Date(),
      };
    } catch (err) {
      logger.error(`[JOB: SLA Monitor] Execution failure: ${err.message}`, { stack: err.stack });
      return { success: false, error: err.message };
    }
  }
}

module.exports = SlaMonitorJob;
