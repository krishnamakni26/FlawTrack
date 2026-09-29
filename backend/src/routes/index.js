const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const assetRoutes = require('./asset.routes');
const vulnerabilityRoutes = require('./vulnerability.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditRoutes = require('./audit.routes');
const settingRoutes = require('./setting.routes');
const jobRoutes = require('./job.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/vulnerabilities', vulnerabilityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingRoutes);
router.use('/admin/jobs', jobRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
