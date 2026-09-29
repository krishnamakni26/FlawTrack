const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  AuthController,
  registerSchema,
  loginSchema,
  refreshSchema,
} = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Stricter rate limit on auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 15 minutes',
    },
  },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/refresh', validate({ body: refreshSchema }), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
