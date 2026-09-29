const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const AuditService = require('../services/audit.service');
const { ROLES, AUDIT_ACTIONS } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(Object.values(ROLES)),
  team: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(Object.values(ROLES)).optional(),
  team: z.string().optional(),
  isActive: z.boolean().optional(),
});

class UserController {
  static async listUsers(req, res, next) {
    try {
      const { role, search, page = 1, limit = 50 } = req.query;
      const query = {};

      if (role && Object.values(ROLES).includes(role)) {
        query.role = role;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { team: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        User.countDocuments(query),
      ]);

      return successResponse(res, {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req, res, next) {
    try {
      const { name, email, password, role, team } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return errorResponse(res, 'User with this email already exists', 409, 'EMAIL_EXISTS');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || ROLES.REPORTER,
        team: team || '',
      });

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.USER_CREATED,
        entityType: 'User',
        entityId: user._id,
        after: { name: user.name, email: user.email, role: user.role },
        req,
      });

      return successResponse(res, user.toJSON(), 201, 'User created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
      }

      const before = {
        name: user.name,
        role: user.role,
        team: user.team,
        isActive: user.isActive,
      };

      const { name, role, team, isActive } = req.body;
      if (name !== undefined) user.name = name;
      if (role !== undefined) user.role = role;
      if (team !== undefined) user.team = team;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      await AuditService.log({
        actor: req.user._id,
        actorRole: req.user.role,
        action: AUDIT_ACTIONS.USER_UPDATED,
        entityType: 'User',
        entityId: user._id,
        before,
        after: { name: user.name, role: user.role, team: user.team, isActive: user.isActive },
        req,
      });

      return successResponse(res, user.toJSON(), 200, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  UserController,
  createUserSchema,
  updateUserSchema,
};
