const express = require('express');
const { AssetController, assetSchema } = require('../controllers/asset.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

// All authenticated roles can list and view assets
router.get('/', AssetController.listAssets);
router.get('/:id', AssetController.getAsset);

// Only ADMIN can create, update, or delete assets
router.post('/', authorizeRoles(ROLES.ADMIN), validate({ body: assetSchema }), AssetController.createAsset);
router.put('/:id', authorizeRoles(ROLES.ADMIN), validate({ body: assetSchema }), AssetController.updateAsset);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), AssetController.deleteAsset);

module.exports = router;
