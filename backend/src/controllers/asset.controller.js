const { z } = require('zod');
const Asset = require('../models/Asset');
const AuditService = require('../services/audit.service');
const { ASSET_TYPES, ASSET_ENVIRONMENTS, AUDIT_ACTIONS } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

const assetSchema = z.object({
  name: z.string().min(2).max(150),
  type: z.enum(ASSET_TYPES),
  environment: z.enum(ASSET_ENVIRONMENTS),
  criticality: z.coerce.number().min(1).max(5),
  internetFacing: z.boolean(),
  dataSensitivity: z.coerce.number().min(1).max(5),
  owner: z.string().optional(),
  businessUnit: z.string().optional(),
  description: z.string().optional(),
});

class AssetController {
  static async listAssets(req, res, next) {
    try {
      const { environment, type, search } = req.query;
      const query = {};

      if (environment) query.environment = environment;
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { businessUnit: { $regex: search, $options: 'i' } },
        ];
      }

      const assets = await Asset.find(query).sort({ criticality: -1, name: 1 });
      return successResponse(res, assets);
    } catch (err) {
      next(err);
    }
  }

  static async getAsset(req, res, next) {
    try {
      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', 404, 'NOT_FOUND');
      }
      return successResponse(res, asset);
    } catch (err) {
      next(err);
    }
  }

  static async createAsset(req, res, next) {
    try {
      const asset = await Asset.create(req.body);

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.ASSET_CREATED,
        entityType: 'Asset',
        entityId: asset._id,
        after: asset.toJSON(),
        req,
      });

      return successResponse(res, asset, 201, 'Asset created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateAsset(req, res, next) {
    try {
      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', 404, 'NOT_FOUND');
      }

      const before = asset.toJSON();
      Object.assign(asset, req.body);
      await asset.save();

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.ASSET_UPDATED,
        entityType: 'Asset',
        entityId: asset._id,
        before,
        after: asset.toJSON(),
        req,
      });

      return successResponse(res, asset, 200, 'Asset updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteAsset(req, res, next) {
    try {
      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', 404, 'NOT_FOUND');
      }

      const before = asset.toJSON();
      await Asset.deleteOne({ _id: asset._id });

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.ASSET_DELETED,
        entityType: 'Asset',
        entityId: asset._id,
        before,
        req,
      });

      return successResponse(res, null, 200, 'Asset deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  AssetController,
  assetSchema,
};
