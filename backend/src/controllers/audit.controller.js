const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../config/constants');
const { successResponse } = require('../utils/response');

class AuditController {
  static async listLogs(req, res, next) {
    try {
      const { actor, action, entityType, startDate, endDate, format, page = 1, limit = 50 } = req.query;
      const query = {};

      // Role filter: Analysts can only see their own logged actions
      if (req.user.role === ROLES.ANALYST) {
        query.actor = req.user._id;
      } else if (actor) {
        query.actor = actor;
      }

      if (action) query.action = action;
      if (entityType) query.entityType = entityType;

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // Check for CSV export request
      if (format === 'csv') {
        const logs = await AuditLog.find(query)
          .populate('actor', 'name email role')
          .sort({ timestamp: -1 })
          .limit(1000);

        const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Actor Name', 'Actor Role', 'IP Address'];
        const rows = logs.map((l) => [
          `"${new Date(l.timestamp).toISOString()}"`,
          `"${l.action}"`,
          `"${l.entityType}"`,
          `"${l.entityId || ''}"`,
          `"${l.actor?.name || 'SYSTEM'}"`,
          `"${l.actorRole || ''}"`,
          `"${l.ip || ''}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="vulntrack-audit-log.csv"');
        return res.status(200).send(csvContent);
      }

      const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('actor', 'name email role')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        AuditLog.countDocuments(query),
      ]);

      return successResponse(res, {
        logs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;
