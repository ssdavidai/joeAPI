/**
 * Error Handler Middleware
 *
 * Catches all errors and returns consistent error responses
 * Handles different error types appropriately
 */

const response = require('../utils/response');

/**
 * Global error handler
 * Must be registered as the last middleware in Express app
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId
  });

  // Joi validation errors
  if (err.isJoi) {
    return response.error(
      res,
      'Validation failed',
      400,
      err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    );
  }

  // SQL errors
  if (err.name === 'RequestError') {
    // SQL Server specific error
    if (err.number === 547) {
      // Foreign key constraint violation
      return response.error(res, 'Foreign key constraint violation', 400);
    }
    if (err.number === 2627 || err.number === 2601) {
      // Unique constraint violation
      return response.error(res, 'Duplicate entry', 409);
    }
    return response.error(res, 'Database error', 500);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return response.error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return response.error(res, 'Token expired', 401);
  }

  // Custom application errors
  if (err.statusCode) {
    return response.error(res, err.message, err.statusCode);
  }

  // Default 500 error
  return response.error(
    res,
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
    500
  );
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res) => {
  response.error(res, `Route ${req.method} ${req.path} not found`, 404);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
