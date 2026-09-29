const express = require('express');
const JobController = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles(ROLES.ADMIN));

router.post('/:name/run', JobController.triggerJob);
router.get('/status', JobController.getStatus);

module.exports = router;
