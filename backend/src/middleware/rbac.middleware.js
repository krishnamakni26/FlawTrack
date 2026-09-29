const { ROLES } = require('../config/constants');
const { errorResponse } = require('../utils/response');

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' lacks sufficient privileges for this operation`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Ensures REPORTER users can only query and view their own reports
 */
const enforceOwnership = (modelField = 'reportedBy') => {
  return (req, res, next) => {
    if (req.user && req.user.role === ROLES.REPORTER) {
      req.ownershipFilter = { [modelField]: req.user._id };
    } else {
      req.ownershipFilter = {};
    }
    next();
  };
};

module.exports = {
  authorizeRoles,
  enforceOwnership,
};
