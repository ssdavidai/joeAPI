/**
 * Authentication Middleware
 *
 * Validates JWT bearer tokens
 * Extracts user information from token
 * In development mode, uses DEV_USER_ID from .env
 */

const jwt = require('jsonwebtoken');
const response = require('../utils/response');

/**
 * Authenticate JWT bearer token
 *
 * In development: Uses DEV_USER_ID from .env (no token required)
 * In production: Validates JWT token from Authorization header
 *
 * Sets req.user with userId and other claims
 */
const authenticate = (req, res, next) => {
  try {
    // Development mode: use mock user
    if (process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
      req.user = {
        userId: parseInt(process.env.DEV_USER_ID),
        email: 'dev@example.com',
        isDevelopment: true
      };
      console.log('🔓 Development mode: Using DEV_USER_ID =', req.user.userId);
      return next();
    }

    // Production mode: validate JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return response.error(res, 'No authorization header provided', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      return response.error(res, 'Invalid authorization format. Use: Bearer <token>', 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      return response.error(res, 'No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token must contain userId
    if (!decoded.userId) {
      return response.error(res, 'Invalid token: missing userId', 401);
    }

    // Set user info on request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

    console.log('🔐 Authenticated user:', req.user.userId);
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.error(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return response.error(res, 'Token expired', 401);
    }
    return response.error(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication
 * Does not fail if no token provided, but validates if present
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };
    }

    next();
  } catch (error) {
    // Invalid token, but don't fail - just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
