const express = require('express');
const {
  UserController,
  createUserSchema,
  updateUserSchema,
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

router.get('/assignees', authorizeRoles(ROLES.ADMIN, ROLES.ANALYST, ROLES.DEVELOPER), UserController.listAssignees);
router.get('/', authorizeRoles(ROLES.ADMIN), UserController.listUsers);
router.post('/', authorizeRoles(ROLES.ADMIN), validate({ body: createUserSchema }), UserController.createUser);
router.patch('/:id', authorizeRoles(ROLES.ADMIN), validate({ body: updateUserSchema }), UserController.updateUser);

module.exports = router;
