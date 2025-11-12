/**
 * Clients Validation Schemas
 *
 * Based on actual Clients table schema:
 * - Id: uniqueidentifier (PK)
 * - UserId: int (nullable) - MULTI-TENANT
 * - Name: nvarchar(100), required
 * - Address: nchar(200), optional
 * - City: nvarchar(100), optional
 * - State: nvarchar(10), optional
 * - CompanyName: nvarchar(100), optional
 * - EmailAddress: nvarchar(100), required
 * - SecondaryEmailAddress: nvarchar(250), optional
 * - Phone: nvarchar(50), optional
 * - Audit fields: CreatedBy, DateCreated, UpdatedBy, DateUpdated
 *
 * Note: This table HAS UserId (multi-tenant) but NO soft delete field
 */

const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

/**
 * Create client schema
 */
const createClientSchema = {
  body: Joi.object({
    Name: validators.stringRequired(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(100),
    State: validators.stringOptional(10),
    CompanyName: validators.stringOptional(100),
    EmailAddress: validators.stringRequired(100),
    SecondaryEmailAddress: validators.stringOptional(250),
    Phone: validators.stringOptional(50)
  })
};

/**
 * Update client schema
 */
const updateClientSchema = {
  params: idParamSchema,
  body: Joi.object({
    Name: validators.string(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(100),
    State: validators.stringOptional(10),
    CompanyName: validators.stringOptional(100),
    EmailAddress: validators.string(100),
    SecondaryEmailAddress: validators.stringOptional(250),
    Phone: validators.stringOptional(50)
  }).min(1) // At least one field required for update
};

/**
 * Get client by ID schema
 */
const getClientByIdSchema = {
  params: idParamSchema
};

/**
 * Delete client schema
 */
const deleteClientSchema = {
  params: idParamSchema
};

/**
 * List clients schema
 */
const listClientsSchema = {
  query: paginationSchema.keys({
    search: Joi.string().max(200).optional()
  })
};

module.exports = {
  createClientSchema,
  updateClientSchema,
  getClientByIdSchema,
  deleteClientSchema,
  listClientsSchema
};
