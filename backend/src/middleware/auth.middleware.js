const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies.token || req.cookies.accessToken)) {
      token = req.cookies.token || req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Authentication token missing or invalid', 401, 'UNAUTHORIZED');
    }
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session token has expired. Please refresh your token or log in again', 401, 'TOKEN_EXPIRED');
      }
      return errorResponse(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, 'User account no longer exists', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account has been deactivated. Contact an administrator', 403, 'ACCOUNT_DEACTIVATED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate,
};
