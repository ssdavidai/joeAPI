/**
 * SubContractors Validation Schemas
 *
 * Note: NO UserId (not multi-tenant), has IsActive (soft delete)
 */

const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createSubContractorSchema = {
  body: Joi.object({
    Name: validators.stringRequired(100),
    Email: validators.stringRequired(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(50),
    State: validators.stringOptional(50),
    Zip: validators.stringOptional(20),
    Company: validators.stringOptional(100),
    Phone: validators.stringOptional(100),
    LicenseNo: validators.stringOptional(100),
    LicenseExp: validators.dateOptional,
    LiabilityInsurancePolicyNo: validators.stringOptional(100),
    LiabilityInsuranceExpiry: validators.dateOptional,
    CompInsurancePolicyNo: validators.stringOptional(100),
    CompInsuranceExpiry: validators.dateOptional,
    BondInsurancePolicyNo: validators.stringOptional(100),
    BondInsuranceExpiry: validators.dateOptional,
    Category: validators.stringOptional(150)
  })
};

const updateSubContractorSchema = {
  params: idParamSchema,
  body: Joi.object({
    Name: validators.string(100),
    Email: validators.string(100),
    Address: validators.stringOptional(200),
    City: validators.stringOptional(50),
    State: validators.stringOptional(50),
    Zip: validators.stringOptional(20),
    Company: validators.stringOptional(100),
    Phone: validators.stringOptional(100),
    LicenseNo: validators.stringOptional(100),
    LicenseExp: validators.dateOptional,
    LiabilityInsurancePolicyNo: validators.stringOptional(100),
    LiabilityInsuranceExpiry: validators.dateOptional,
    CompInsurancePolicyNo: validators.stringOptional(100),
    CompInsuranceExpiry: validators.dateOptional,
    BondInsurancePolicyNo: validators.stringOptional(100),
    BondInsuranceExpiry: validators.dateOptional,
    Category: validators.stringOptional(150)
  }).min(1)
};

const listSubContractorsSchema = {
  query: paginationSchema.keys({
    search: Joi.string().max(200).optional(),
    category: Joi.string().max(150).optional(),
    includeInactive: Joi.boolean().default(false)
  })
};

module.exports = {
  createSubContractorSchema,
  updateSubContractorSchema,
  getSubContractorByIdSchema: { params: idParamSchema },
  deleteSubContractorSchema: { params: idParamSchema },
  listSubContractorsSchema
};
