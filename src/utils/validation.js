/**
 * Validation Utilities
 *
 * Common validation schemas and helpers using Joi
 * Provides reusable validation patterns for all APIs
 */

const Joi = require('joi');

/**
 * Common field validators
 */
const validators = {
  // GUID validator (uniqueidentifier in SQL)
  guid: Joi.string()
    .guid({ version: 'uuidv4' })
    .messages({
      'string.guid': 'Must be a valid GUID/UUID'
    }),

  // Required GUID
  guidRequired: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Must be a valid GUID/UUID',
      'any.required': 'This field is required'
    }),

  // Optional GUID (nullable)
  guidOptional: Joi.string()
    .guid({ version: 'uuidv4' })
    .allow(null)
    .optional()
    .messages({
      'string.guid': 'Must be a valid GUID/UUID'
    }),

  // String with max length
  string: (maxLength = 255) =>
    Joi.string()
      .max(maxLength)
      .trim()
      .messages({
        'string.max': `Must be at most ${maxLength} characters`,
        'string.empty': 'Cannot be empty'
      }),

  // Required string
  stringRequired: (maxLength = 255) =>
    Joi.string()
      .max(maxLength)
      .trim()
      .required()
      .messages({
        'string.max': `Must be at most ${maxLength} characters`,
        'any.required': 'This field is required'
      }),

  // Optional string (nullable)
  stringOptional: (maxLength = 255) =>
    Joi.string()
      .max(maxLength)
      .trim()
      .allow(null, '')
      .optional()
      .messages({
        'string.max': `Must be at most ${maxLength} characters`
      }),

  // Email
  email: Joi.string()
    .email()
    .max(255)
    .trim()
    .messages({
      'string.email': 'Must be a valid email address'
    }),

  // Phone number (basic validation)
  phone: Joi.string()
    .pattern(/^[0-9\s\-\(\)\+]+$/)
    .max(50)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Must be a valid phone number'
    }),

  // Integer
  integer: Joi.number()
    .integer()
    .messages({
      'number.base': 'Must be a number',
      'number.integer': 'Must be an integer'
    }),

  // Positive integer
  positiveInt: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.min': 'Must be at least 1'
    }),

  // Decimal/Money
  decimal: (precision = 18, scale = 2) =>
    Joi.number()
      .precision(scale)
      .messages({
        'number.base': 'Must be a number'
      }),

  // Boolean
  boolean: Joi.boolean()
    .messages({
      'boolean.base': 'Must be true or false'
    }),

  // Date
  date: Joi.date()
    .iso()
    .messages({
      'date.base': 'Must be a valid date',
      'date.format': 'Must be in ISO 8601 format'
    }),

  // Optional date
  dateOptional: Joi.date()
    .iso()
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Must be a valid date',
      'date.format': 'Must be in ISO 8601 format'
    })
};

/**
 * Pagination schema
 * Standard pagination parameters for list endpoints
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
});

/**
 * ID parameter schema
 * For routes with :id parameter
 */
const idParamSchema = Joi.object({
  id: validators.guidRequired
});

/**
 * Validate middleware
 * Express middleware to validate request against Joi schema
 *
 * @param {Object} schema - Joi schema object with body/query/params
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Collect all errors
      stripUnknown: true // Remove unknown fields
    };

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        error.isJoi = true;
        return next(error);
      }
      req.body = value;
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        error.isJoi = true;
        return next(error);
      }
      req.query = value;
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        error.isJoi = true;
        return next(error);
      }
      req.params = value;
    }

    next();
  };
};

/**
 * Sanitize input
 * Remove potentially dangerous characters
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 5000); // Hard limit
};

/**
 * Validate GUID format
 * Quick check without Joi
 */
const isValidGuid = (str) => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

module.exports = {
  validators,
  paginationSchema,
  idParamSchema,
  validate,
  sanitizeString,
  isValidGuid
};
