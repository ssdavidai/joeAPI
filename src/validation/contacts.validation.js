/**
 * Contacts Validation Schemas
 *
 * Based on actual Contacts table schema:
 * - Id: uniqueidentifier (PK)
 * - Name: nvarchar(max), required
 * - Email: nvarchar(100), optional
 * - Phone: nvarchar(100), optional
 * - Address: nvarchar(200), optional
 * - City: nvarchar(50), optional
 * - State: nvarchar(50), optional
 * - IsActive: bit
 * - Audit fields: CreatedBy, DateCreated, UpdatedBy, DateUpdated
 *
 * Note: This table has NO UserId field (not multi-tenant)
 */

const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

/**
 * Create contact schema
 */
const createContactSchema = {
  body: Joi.object({
    Name: validators.stringRequired(5000), // nvarchar(max)
    Email: validators.stringOptional(100),
    Phone: validators.stringOptional(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(50),
    State: validators.stringOptional(50)
  })
};

/**
 * Update contact schema
 */
const updateContactSchema = {
  params: idParamSchema,
  body: Joi.object({
    Name: validators.string(5000),
    Email: validators.stringOptional(100),
    Phone: validators.stringOptional(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(50),
    State: validators.stringOptional(50)
  }).min(1) // At least one field required for update
};

/**
 * Get contact by ID schema
 */
const getContactByIdSchema = {
  params: idParamSchema
};

/**
 * Delete contact schema
 */
const deleteContactSchema = {
  params: idParamSchema
};

/**
 * List contacts schema
 */
const listContactsSchema = {
  query: paginationSchema.keys({
    search: Joi.string().max(200).optional(),
    includeInactive: Joi.boolean().default(false)
  })
};

module.exports = {
  createContactSchema,
  updateContactSchema,
  getContactByIdSchema,
  deleteContactSchema,
  listContactsSchema
};
