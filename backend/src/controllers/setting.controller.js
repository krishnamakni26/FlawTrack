const Setting = require('../models/Setting');
const RiskEngineService = require('../services/riskEngine.service');
const AuditService = require('../services/audit.service');
const { AUDIT_ACTIONS } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

class SettingController {
  static async getSettings(req, res, next) {
    try {
      const settings = await Setting.getSettings();
      return successResponse(res, settings);
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const {
        riskWeights,
        priorityThresholds,
        slaHoursByPriority,
        duplicateThreshold,
        exposureValues,
        warningPercent,
      } = req.body;

      // Validate risk weights sum to 1.0
      if (riskWeights) {
        try {
          RiskEngineService.validateWeights(riskWeights);
        } catch (weightErr) {
          return errorResponse(res, weightErr.message, 400, 'INVALID_WEIGHTS');
        }
      }

      const settings = await Setting.getSettings();
      const before = settings.toJSON();

      if (riskWeights) settings.riskWeights = riskWeights;
      if (priorityThresholds) settings.priorityThresholds = priorityThresholds;
      if (slaHoursByPriority) settings.slaHoursByPriority = slaHoursByPriority;
      if (duplicateThreshold !== undefined) settings.duplicateThreshold = parseFloat(duplicateThreshold);
      if (exposureValues) settings.exposureValues = exposureValues;
      if (warningPercent !== undefined) settings.warningPercent = parseInt(warningPercent);
      settings.updatedBy = req.user._id;

      await settings.save();

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.SETTINGS_CHANGED,
        entityType: 'Setting',
        entityId: settings._id,
        before,
        after: settings.toJSON(),
        req,
      });

      return successResponse(res, settings, 200, 'System settings updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SettingController;
