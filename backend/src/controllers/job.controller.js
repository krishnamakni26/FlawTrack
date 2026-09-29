const { runJob, getJobStatus } = require('../jobs');
const AuditService = require('../services/audit.service');
const { AUDIT_ACTIONS } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

class JobController {
  static async triggerJob(req, res, next) {
    try {
      const { name } = req.params;
      const result = await runJob(name);

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.JOB_EXECUTED,
        entityType: 'SystemJob',
        after: { jobName: name, result },
        req,
      });

      return successResponse(res, result, 200, `Job '${name}' executed successfully`);
    } catch (err) {
      if (err.message.includes('not recognized')) {
        return errorResponse(res, err.message, 404, 'JOB_NOT_FOUND');
      }
      next(err);
    }
  }

  static async getStatus(req, res) {
    return successResponse(res, getJobStatus());
  }
}

module.exports = JobController;
