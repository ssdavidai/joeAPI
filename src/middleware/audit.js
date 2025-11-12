/**
 * Audit Trail Middleware
 *
 * Automatically populates audit fields:
 * - CreatedBy / DateCreated (on INSERT)
 * - UpdatedBy / DateUpdated (on UPDATE)
 *
 * Works by adding fields to request body before controller processes
 */

/**
 * Add audit fields for CREATE operations
 *
 * Adds:
 * - CreatedBy = req.userId
 * - DateCreated = current timestamp
 * - UserId = req.userId (for multi-tenancy)
 */
const auditCreate = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return next(); // Auth middleware should catch this
  }

  const now = new Date();

  // Add audit fields to body
  req.body.CreatedBy = req.user.userId;
  req.body.DateCreated = now;
  req.body.UserId = req.user.userId;

  console.log('📝 Audit (CREATE):', {
    userId: req.user.userId,
    timestamp: now.toISOString()
  });

  next();
};

/**
 * Add audit fields for UPDATE operations
 *
 * Adds:
 * - UpdatedBy = req.userId
 * - DateUpdated = current timestamp
 *
 * Prevents modification of:
 * - CreatedBy
 * - DateCreated
 * - UserId
 */
const auditUpdate = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return next(); // Auth middleware should catch this
  }

  const now = new Date();

  // Add audit fields to body
  req.body.UpdatedBy = req.user.userId;
  req.body.DateUpdated = now;

  // Remove immutable fields from update
  delete req.body.CreatedBy;
  delete req.body.DateCreated;
  delete req.body.UserId;
  delete req.body.ID;

  console.log('📝 Audit (UPDATE):', {
    userId: req.user.userId,
    timestamp: now.toISOString()
  });

  next();
};

/**
 * Get audit values for SQL queries
 * Helper function to get audit field values
 *
 * @param {Object} user - req.user object
 * @param {string} operation - 'create' or 'update'
 * @returns {Object} Audit field values
 */
const getAuditValues = (user, operation = 'create') => {
  const now = new Date();

  if (operation === 'create') {
    return {
      CreatedBy: user.userId,
      DateCreated: now,
      UserId: user.userId,
      IsDeleted: false,
      IsActive: true
    };
  }

  if (operation === 'update') {
    return {
      UpdatedBy: user.userId,
      DateUpdated: now
    };
  }

  return {};
};

/**
 * Get soft delete values
 * Helper for soft delete operations
 *
 * @param {Object} user - req.user object
 * @param {string} type - 'IsDeleted' or 'IsActive'
 * @returns {Object} Soft delete field values
 */
const getSoftDeleteValues = (user, type = 'IsDeleted') => {
  const values = {
    UpdatedBy: user.userId,
    DateUpdated: new Date()
  };

  if (type === 'IsActive') {
    values.IsActive = false;
  } else {
    values.IsDeleted = true;
  }

  return values;
};

module.exports = {
  auditCreate,
  auditUpdate,
  getAuditValues,
  getSoftDeleteValues
};
