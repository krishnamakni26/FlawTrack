const mongoose = require('mongoose');
const {
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_PRIORITY_THRESHOLDS,
  DEFAULT_SLA_HOURS,
  DEFAULT_EXPOSURE_VALUES,
  DEFAULT_DUPLICATE_THRESHOLD,
  DEFAULT_SLA_WARNING_PERCENT,
} = require('../config/constants');

const settingSchema = new mongoose.Schema(
  {
    riskWeights: {
      cvss: { type: Number, default: DEFAULT_RISK_WEIGHTS.cvss },
      epss: { type: Number, default: DEFAULT_RISK_WEIGHTS.epss },
      kev: { type: Number, default: DEFAULT_RISK_WEIGHTS.kev },
      assetCriticality: { type: Number, default: DEFAULT_RISK_WEIGHTS.assetCriticality },
      businessImpact: { type: Number, default: DEFAULT_RISK_WEIGHTS.businessImpact },
      exposure: { type: Number, default: DEFAULT_RISK_WEIGHTS.exposure },
    },
    priorityThresholds: {
      p1: { type: Number, default: DEFAULT_PRIORITY_THRESHOLDS.p1 },
      p2: { type: Number, default: DEFAULT_PRIORITY_THRESHOLDS.p2 },
      p3: { type: Number, default: DEFAULT_PRIORITY_THRESHOLDS.p3 },
    },
    slaHoursByPriority: {
      P1: { type: Number, default: DEFAULT_SLA_HOURS.P1 },
      P2: { type: Number, default: DEFAULT_SLA_HOURS.P2 },
      P3: { type: Number, default: DEFAULT_SLA_HOURS.P3 },
      P4: { type: Number, default: DEFAULT_SLA_HOURS.P4 },
    },
    duplicateThreshold: {
      type: Number,
      default: DEFAULT_DUPLICATE_THRESHOLD,
    },
    exposureValues: {
      internetFacingProduction: { type: Number, default: DEFAULT_EXPOSURE_VALUES.internetFacingProduction },
      internetFacingNonProduction: { type: Number, default: DEFAULT_EXPOSURE_VALUES.internetFacingNonProduction },
      internal: { type: Number, default: DEFAULT_EXPOSURE_VALUES.internal },
      isolatedTest: { type: Number, default: DEFAULT_EXPOSURE_VALUES.isolatedTest },
    },
    warningPercent: {
      type: Number,
      default: DEFAULT_SLA_WARNING_PERCENT,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

settingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Setting', settingSchema);
