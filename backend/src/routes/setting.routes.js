const express = require('express');
const SettingController = require('../controllers/setting.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

// All authenticated users can read settings (needed for front-end What-if calculator and sliders)
router.get('/', SettingController.getSettings);

// Only ADMIN can modify system settings
router.put('/', authorizeRoles(ROLES.ADMIN), SettingController.updateSettings);

module.exports = router;
