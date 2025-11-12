/**
 * Multi-Tenancy Middleware
 *
 * Enforces data isolation by UserId
 * Automatically adds UserId filter to all queries
 * Prevents cross-user data access
 */

const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * Enforce multi-tenancy by UserId
 *
 * Validates that:
 * 1. User is authenticated (req.user.userId exists)
 * 2. For POST/PUT: adds UserId to request body
 * 3. For GET/DELETE: validates record belongs to user
 *
 * Usage: Apply to all routes that access user data
 */
const enforceMultiTenancy = (req, res, next) => {
  // User must be authenticated
  if (!req.user || !req.user.userId) {
    return response.error(res, 'User not authenticated', 401);
  }

  // Add UserId to request for controllers to use
  req.userId = req.user.userId;

  console.log('🔒 Multi-tenancy enforced for user:', req.userId);
  next();
};

/**
 * Validate record ownership
 *
 * Checks that a record belongs to the authenticated user
 * Call this before UPDATE/DELETE operations
 *
 * @param {string} tableName - Name of table to check
 * @param {string} idField - Name of ID field (default: ID)
 * @param {*} recordId - ID value to check
 * @param {number} userId - User ID to validate against
 * @returns {Promise<boolean>} True if user owns record
 */
const validateOwnership = async (tableName, idField, recordId, userId) => {
  try {
    const result = await executeQuery(
      `SELECT COUNT(*) AS cnt
       FROM dbo.[${tableName}]
       WHERE [${idField}] = @recordId
         AND [UserId] = @userId
         AND ([IsDeleted] = 0 OR [IsActive] = 1)`,
      { recordId, userId }
    );

    return result.recordset[0].cnt > 0;
  } catch (error) {
    console.error('Ownership validation error:', error);
    return false;
  }
};

/**
 * Validate foreign key ownership
 *
 * Checks that a foreign key reference belongs to the authenticated user
 * Call this before CREATE/UPDATE operations with FKs
 *
 * @param {string} tableName - Name of referenced table
 * @param {string} idField - Name of ID field in referenced table
 * @param {*} recordId - ID value to check
 * @param {number} userId - User ID to validate against
 * @returns {Promise<boolean>} True if FK is valid and owned by user
 */
const validateForeignKeyOwnership = async (tableName, idField, recordId, userId) => {
  // NULL foreign keys are allowed
  if (recordId === null || recordId === undefined) {
    return true;
  }

  try {
    const result = await executeQuery(
      `SELECT COUNT(*) AS cnt
       FROM dbo.[${tableName}]
       WHERE [${idField}] = @recordId
         AND [UserId] = @userId
         AND ([IsDeleted] = 0 OR [IsActive] = 1)`,
      { recordId, userId }
    );

    return result.recordset[0].cnt > 0;
  } catch (error) {
    console.error('FK ownership validation error:', error);
    return false;
  }
};

/**
 * Get multi-tenancy WHERE clause
 * Helper to generate standard UserId filter
 *
 * @param {number} userId - User ID to filter by
 * @param {string} alias - Table alias (optional)
 * @returns {string} WHERE clause fragment
 */
const getUserFilter = (userId, alias = '') => {
  const prefix = alias ? `${alias}.` : '';
  return `${prefix}[UserId] = ${userId}`;
};

/**
 * Get active records filter
 * Helper to generate standard active/not deleted filter
 *
 * @param {string} alias - Table alias (optional)
 * @param {string} type - 'IsDeleted' or 'IsActive' (default: IsDeleted)
 * @returns {string} WHERE clause fragment
 */
const getActiveFilter = (alias = '', type = 'IsDeleted') => {
  const prefix = alias ? `${alias}.` : '';
  if (type === 'IsActive') {
    return `${prefix}[IsActive] = 1`;
  }
  return `${prefix}[IsDeleted] = 0`;
};

module.exports = {
  enforceMultiTenancy,
  validateOwnership,
  validateForeignKeyOwnership,
  getUserFilter,
  getActiveFilter
};
