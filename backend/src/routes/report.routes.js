const express = require('express');
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

// 1. Single Vulnerability Report (All roles; Reporter ownership enforced in controller)
router.get('/vulnerability/:id', ReportController.getVulnerabilityReport);

// 2. Executive Summary Report (Staff roles: Analyst, Admin, Developer)
router.get('/summary', authorizeRoles(ROLES.ANALYST, ROLES.ADMIN, ROLES.DEVELOPER), ReportController.getSummaryReport);

// 3. SLA Compliance Audit Report (Staff roles: Analyst, Admin, Developer)
router.get('/sla', authorizeRoles(ROLES.ANALYST, ROLES.ADMIN, ROLES.DEVELOPER), ReportController.getSlaReport);

module.exports = router;
