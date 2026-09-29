const express = require('express');
const AuditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles(ROLES.ANALYST, ROLES.ADMIN));

router.get('/', AuditController.listLogs);

module.exports = router;
