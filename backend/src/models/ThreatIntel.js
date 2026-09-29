const mongoose = require('mongoose');

const threatIntelSchema = new mongoose.Schema(
  {
    cveId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    epss: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    percentile: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    inKev: {
      type: Boolean,
      default: false,
    },
    kevDateAdded: {
      type: Date,
      default: null,
    },
    kevRequiredAction: {
      type: String,
      default: '',
    },
    cvssBaseScore: {
      type: Number,
      default: null,
    },
    cvssVector: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: 'live',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ThreatIntel', threatIntelSchema);
