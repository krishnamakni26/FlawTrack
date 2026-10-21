const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const AuditService = require('../services/audit.service');
const env = require('../config/env');
const { ROLES, AUDIT_ACTIONS } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('token', accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

const clearAuthCookies = (res) => {
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
  res.clearCookie('token', cookieOptions);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  team: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, team } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return errorResponse(res, 'An account with this email address already exists', 409, 'EMAIL_EXISTS');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: ROLES.REPORTER, // Self-service always registers as REPORTER
        team: team || '',
      });

      const { accessToken, refreshToken } = generateTokens(user);

      await AuditService.log({
        actor: user._id,
        actorRole: user.role,
        action: AUDIT_ACTIONS.USER_CREATED,
        entityType: 'User',
        entityId: user._id,
        after: { name: user.name, email: user.email, role: user.role },
        req,
      });

      setAuthCookies(res, accessToken, refreshToken);

      return successResponse(
        res,
        {
          user: user.toJSON(),
          accessToken,
          refreshToken,
        },
        201,
        'Registration successful'
      );
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Check account lockout
      if (user.isLocked()) {
        const remainingMinutes = Math.ceil((user.lockoutUntil - Date.now()) / (60 * 1000));
        return errorResponse(
          res,
          `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minutes`,
          429,
          'ACCOUNT_LOCKED'
        );
      }

      if (!user.isActive) {
        return errorResponse(res, 'Your account has been deactivated. Please contact an administrator', 403, 'ACCOUNT_DEACTIVATED');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
          await user.save();
          await AuditService.log({
            actor: user._id,
            actorRole: user.role,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            entityType: 'User',
            entityId: user._id,
            after: { reason: 'Account locked after 5 failed attempts' },
            req,
          });
          return errorResponse(
            res,
            'Account has been locked for 15 minutes due to multiple failed login attempts',
            429,
            'ACCOUNT_LOCKED'
          );
        }

        await user.save();
        await AuditService.log({
          actor: user._id,
          actorRole: user.role,
          action: AUDIT_ACTIONS.LOGIN_FAILED,
          entityType: 'User',
          entityId: user._id,
          after: { failedAttempts: user.failedLoginAttempts },
          req,
        });

        return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Successful login: reset failed counters and update lastLogin
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLoginAt = new Date();
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user);

      await AuditService.log({
        actor: user._id,
        actorRole: user.role,
        action: AUDIT_ACTIONS.LOGIN,
        entityType: 'User',
        entityId: user._id,
        req,
      });

      setAuthCookies(res, accessToken, refreshToken);

      return successResponse(
        res,
        {
          user: user.toJSON(),
          accessToken,
          refreshToken,
        },
        200,
        'Login successful'
      );
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      let decoded;

      try {
        decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      } catch (err) {
        return errorResponse(res, 'Invalid or expired refresh token. Please log in again', 401, 'INVALID_REFRESH_TOKEN');
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return errorResponse(res, 'User session invalid or deactivated', 401, 'UNAUTHORIZED');
      }

      const tokens = generateTokens(user);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      return successResponse(res, tokens, 200, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    clearAuthCookies(res);
    return successResponse(res, null, 200, 'Logged out successfully');
  }

  static async getMe(req, res) {
    return successResponse(res, { user: req.user.toJSON() });
  }
}

module.exports = {
  AuthController,
  registerSchema,
  loginSchema,
  refreshSchema,
};
