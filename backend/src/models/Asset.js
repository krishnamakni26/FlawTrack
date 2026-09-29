const mongoose = require('mongoose');
const { ASSET_TYPES, ASSET_ENVIRONMENTS } = require('../config/constants');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      enum: ASSET_TYPES,
      default: 'web-app',
      required: true,
    },
    environment: {
      type: String,
      enum: ASSET_ENVIRONMENTS,
      default: 'production',
      required: true,
    },
    criticality: {
      type: Number,
      required: [true, 'Asset criticality (1-5) is required'],
      min: 1,
      max: 5,
      default: 3,
    },
    internetFacing: {
      type: Boolean,
      required: true,
      default: false,
    },
    dataSensitivity: {
      type: Number,
      required: [true, 'Data sensitivity (1-5) is required'],
      min: 1,
      max: 5,
      default: 3,
    },
    owner: {
      type: String,
      trim: true,
      default: 'SecOps Team',
    },
    businessUnit: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Asset', assetSchema);
