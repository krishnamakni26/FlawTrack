const Vulnerability = require('../models/Vulnerability');
const Asset = require('../models/Asset');
const ThreatIntelService = require('../services/threatIntel.service');
const RiskEngineService = require('../services/riskEngine.service');
const SlaService = require('../services/sla.service');
const NotificationService = require('../services/notification.service');
const AuditService = require('../services/audit.service');
const { VULN_STATUSES, AUDIT_ACTIONS } = require('../config/constants');
const logger = require('../utils/logger');

class ThreatRefreshJob {
  /**
   * Refreshes EPSS/KEV feeds and automatically recalculates risk for active vulnerabilities
   */
  static async execute() {
    logger.info('[JOB: Threat Refresh] Refreshing external threat intelligence...');

    try {
      // 1. Refresh CISA KEV catalog cache
      await ThreatIntelService.fetchKevCatalog();

      // 2. Query all active, non-closed vulnerabilities with a CVE assigned
      const activeVulns = await Vulnerability.find({
        status: { $nin: [VULN_STATUSES.CLOSED, VULN_STATUSES.REJECTED, VULN_STATUSES.DUPLICATE] },
        cveId: { $ne: null },
      }).populate('asset');

      let updatedCount = 0;
      let escalatedCount = 0;

      for (const vuln of activeVulns) {
        const threatData = await ThreatIntelService.getThreatIntelForCve(vuln.cveId);

        const oldPriority = vuln.risk?.priority;
        const oldInKev = vuln.threat?.inKev;
        const oldEpss = vuln.threat?.epss;

        // Check if threat intelligence metrics actually updated
        const threatChanged =
          oldInKev !== threatData.inKev ||
          Math.abs((oldEpss || 0) - (threatData.epss || 0)) > 0.05 ||
          (!vuln.cvss?.baseScore && threatData.cvssBaseScore);

        if (threatChanged) {
          vuln.threat = {
            epss: threatData.epss,
            epssPercentile: threatData.epssPercentile,
            inKev: threatData.inKev,
            kevDateAdded: threatData.kevDateAdded,
            lastCheckedAt: new Date(),
            isStale: false,
          };

          if (!vuln.cvss?.baseScore && threatData.cvssBaseScore) {
            vuln.cvss = {
              baseScore: threatData.cvssBaseScore,
              vector: threatData.cvssVector,
              severity: threatData.cvssBaseScore >= 9.0 ? 'Critical' : 'High',
              version: '3.1',
            };
          }

          // Recalculate Risk
          const newRisk = await RiskEngineService.calculateRisk(vuln, vuln.asset);
          vuln.risk = {
            score: newRisk.score,
            priority: newRisk.priority,
            breakdown: newRisk.breakdown,
            explanation: newRisk.explanation,
            calculatedAt: new Date(),
          };

          // Check for priority escalation
          if (oldPriority && oldPriority !== newRisk.priority) {
            escalatedCount++;
            const newSla = await SlaService.recalculateSlaForNewPriority(vuln, newRisk.priority);
            vuln.sla = newSla;

            await AuditService.log({
              actor: null,
              actorRole: 'SYSTEM',
              action: AUDIT_ACTIONS.THREAT_REFRESH,
              entityType: 'Vulnerability',
              entityId: vuln._id,
              before: { priority: oldPriority, inKev: oldInKev, epss: oldEpss },
              after: {
                priority: newRisk.priority,
                inKev: threatData.inKev,
                epss: threatData.epss,
                reason: `Priority escalated ${oldPriority} -> ${newRisk.priority} following threat intelligence update for ${vuln.cveId}`,
              },
            });

            // Notify assignee
            const targetUserId = vuln.assignedTo || vuln.reportedBy;
            await NotificationService.notify({
              userId: targetUserId,
              type: 'THREAT_ESCALATED',
              message: `Threat Escalation: Priority changed ${oldPriority} -> ${newRisk.priority} for "${vuln.title}" (${vuln.cveId} added to KEV or high EPSS).`,
              vulnerabilityId: vuln._id,
            });
          }

          await vuln.save();
          updatedCount++;
        }
      }

      logger.info(
        `[JOB: Threat Refresh] Completed. Scanned: ${activeVulns.length}, Updated: ${updatedCount}, Escalated: ${escalatedCount}`
      );

      return {
        success: true,
        scannedCount: activeVulns.length,
        updatedCount,
        escalatedCount,
        executedAt: new Date(),
      };
    } catch (err) {
      logger.error(`[JOB: Threat Refresh] Execution failure: ${err.message}`, { stack: err.stack });
      return { success: false, error: err.message };
    }
  }
}

module.exports = ThreatRefreshJob;
