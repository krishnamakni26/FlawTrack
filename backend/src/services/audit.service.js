const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit Service
 * Records append-only, immutable audit events
 */
class AuditService {
  /**
   * Log an immutable audit event
   * @param {Object} params
   * @param {Object} [req] - Express request object for IP and UserAgent extraction
   */
  static async log({
    actor = null,
    actorRole = 'SYSTEM',
    action,
    entityType,
    entityId = null,
    before = null,
    after = null,
    ip = '127.0.0.1',
    userAgent = 'System',
    req = null,
  }) {
    try {
      const clientIp = req
        ? req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1'
        : ip;
      const clientAgent = req ? req.headers['user-agent'] || 'Unknown' : userAgent;

      const logEntry = new AuditLog({
        actor: actor || (req?.user?._id ?? null),
        actorRole: actorRole || (req?.user?.role ?? 'SYSTEM'),
        action,
        entityType,
        entityId,
        before,
        after,
        ip: clientIp,
        userAgent: clientAgent,
        timestamp: new Date(),
      });

      await logEntry.save();
      logger.debug(`Audit logged: ${action} on ${entityType} ${entityId || ''}`);
      return logEntry;
    } catch (err) {
      logger.error(`Failed to record audit log: ${err.message}`, { action, entityType, entityId });
      // We do not throw from audit log to avoid blocking the primary business flow unless critical
      return null;
    }
  }
}

module.exports = AuditService;
