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
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/', UserController.listUsers);
router.post('/', validate({ body: createUserSchema }), UserController.createUser);
router.patch('/:id', validate({ body: updateUserSchema }), UserController.updateUser);

module.exports = router;
