/**
 * Standardized API Response Utilities
 */

const successResponse = (res, data = null, statusCode = 200, message = null) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
