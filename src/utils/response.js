/**
 * Response Formatter Utility
 *
 * Provides consistent response format for all API endpoints
 */

/**
 * Success response format
 *
 * @param {Object} res - Express response object
 * @param {*} data - Data to return
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response format
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {*} errors - Optional detailed error information
 */
const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response format
 *
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total count of items
 * @param {string} message - Optional success message
 */
const paginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  success,
  error,
  paginated
};
