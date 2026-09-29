const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'REPORT_RECEIVED',
        'NEEDS_INFO',
        'REJECTED',
        'VALIDATED',
        'ASSIGNED',
        'SLA_WARNING',
        'SLA_BREACH',
        'RESOLVED',
        'RETEST_FAILED',
        'REOPENED',
        'CLOSED',
        'THREAT_ESCALATED',
        'GENERAL',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    vulnerability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
