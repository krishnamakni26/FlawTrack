const Vulnerability = require('../models/Vulnerability');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const ReportService = require('../services/report.service');
const AuditService = require('../services/audit.service');
const { ROLES, AUDIT_ACTIONS, VULN_STATUSES } = require('../config/constants');
const { errorResponse } = require('../utils/response');

class ReportController {
  /**
   * 1. Single Vulnerability Report
   * GET /api/reports/vulnerability/:id?format=pdf|json|csv
   */
  static async getVulnerabilityReport(req, res, next) {
    try {
      const { id } = req.params;
      const format = (req.query.format || 'pdf').toLowerCase();

      const vuln = await Vulnerability.findById(id)
        .populate('asset')
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role');

      if (!vuln) {
        return errorResponse(res, 'Vulnerability not found', 404, 'NOT_FOUND');
      }

      // RBAC Ownership Check: Reporters may only export their own reports
      if (req.user.role === ROLES.REPORTER && !vuln.reportedBy._id.equals(req.user._id)) {
        return errorResponse(
          res,
          'Access denied: You are only authorized to export vulnerability reports submitted by yourself',
          403,
          'FORBIDDEN'
        );
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const filenameBase = `FlawTrack_Report_${id}_${dateStr}`;

      // Fetch audit timeline logs for this vulnerability
      const timelineLogs = await AuditLog.find({ entityId: vuln._id })
        .populate('actor', 'name email')
        .sort({ timestamp: 1 });

      // Audit Log Generation Action
      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.REPORT_GENERATED,
        entityType: 'Vulnerability',
        entityId: vuln._id,
        after: { format, reportType: 'single_vulnerability', title: vuln.title },
        req,
      });

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.json"`);
        return res.json({
          reportId: `FT-RPT-${vuln._id.toString().slice(-8).toUpperCase()}`,
          generatedAt: new Date().toISOString(),
          generatedBy: { id: req.user._id, name: req.user.name, role: req.user.role },
          vulnerability: vuln,
          timeline: timelineLogs,
        });
      }

      if (format === 'csv') {
        const csv = ReportService.generateVulnerabilityCsv(vuln);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csv);
      }

      // Default: PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      return ReportService.generateVulnerabilityPdf(vuln, timelineLogs, req.user, res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 2. Summary Report
   * GET /api/reports/summary?format=pdf|csv&from=&to=&status=&priority=
   */
  static async getSummaryReport(req, res, next) {
    try {
      const format = (req.query.format || 'pdf').toLowerCase();
      const { from, to, status, priority } = req.query;

      const query = {};
      if (status) query.status = status;
      if (priority) query['risk.priority'] = priority;
      if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
      }

      const vulns = await Vulnerability.find(query)
        .populate('asset')
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ 'risk.score': -1 });

      const dateStr = new Date().toISOString().slice(0, 10);
      const filenameBase = `FlawTrack_Summary_Report_${dateStr}`;

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.REPORT_GENERATED,
        entityType: 'Report',
        entityId: null,
        after: { format, reportType: 'executive_summary', count: vulns.length, filters: { from, to, status, priority } },
        req,
      });

      if (format === 'csv') {
        const csv = ReportService.generateSummaryCsv(vulns);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csv);
      }

      // Default: PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      return ReportService.generateSummaryPdf({ vulns }, { from, to, status, priority }, req.user, res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 3. SLA Compliance Report
   * GET /api/reports/sla?format=pdf|csv
   */
  static async getSlaReport(req, res, next) {
    try {
      const format = (req.query.format || 'pdf').toLowerCase();
      const settings = await Setting.getSettings();

      const activeStatuses = [
        VULN_STATUSES.SUBMITTED,
        VULN_STATUSES.UNDER_VALIDATION,
        VULN_STATUSES.NEEDS_INFO,
        VULN_STATUSES.VALIDATED,
        VULN_STATUSES.PRIORITIZED,
        VULN_STATUSES.OPEN,
        VULN_STATUSES.ASSIGNED,
        VULN_STATUSES.IN_PROGRESS,
        VULN_STATUSES.RESOLVED,
        VULN_STATUSES.RETEST,
        VULN_STATUSES.REOPENED,
      ];

      const activeVulns = await Vulnerability.find({ status: { $in: activeStatuses } })
        .populate('assignedTo', 'name email')
        .populate('asset', 'name')
        .sort({ 'sla.dueAt': 1 });

      const breachedVulns = activeVulns.filter((v) => v.sla?.breached);
      const warningVulns = activeVulns.filter((v) => v.sla?.warningSent);

      const dateStr = new Date().toISOString().slice(0, 10);
      const filenameBase = `FlawTrack_SLA_Report_${dateStr}`;

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.REPORT_GENERATED,
        entityType: 'Report',
        entityId: null,
        after: { format, reportType: 'sla_compliance', totalActive: activeVulns.length, totalBreached: breachedVulns.length },
        req,
      });

      if (format === 'csv') {
        const csv = ReportService.generateSlaCsv(activeVulns);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csv);
      }

      // Default: PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      return ReportService.generateSlaPdf(
        {
          activeVulns,
          breachedVulns,
          warningVulns,
          slaHoursByPriority: settings.slaHoursByPriority,
        },
        req.user,
        res
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
