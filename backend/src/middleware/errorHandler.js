const { ZodError } = require('zod');
const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return errorResponse(res, 'Validation Error', 400, 'VALIDATION_ERROR', issues);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid identifier format for field '${err.path}'`, 400, 'INVALID_ID');
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `A record with this ${field} already exists`, 409, 'DUPLICATE_KEY');
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 'Database Validation Error', 400, 'VALIDATION_ERROR', errors);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Uploaded file exceeds the maximum allowed size limit', 400, 'FILE_TOO_LARGE');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 'Too many files uploaded. Maximum 5 allowed', 400, 'TOO_MANY_FILES');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, `Unexpected upload field: '${err.field}'. Expected 'attachments'`, 400, 'UNEXPECTED_FIELD');
    }
    return errorResponse(res, err.message, 400, 'UPLOAD_ERROR');
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.code && typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal server error occurred';

  return errorResponse(
    res,
    message,
    statusCode,
    errorCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = errorHandler;
