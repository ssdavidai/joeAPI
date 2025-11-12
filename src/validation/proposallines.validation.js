/**
 * ProposalLines Validation
 *
 * FKs: ProposalID (required), EstimateCategoryID (required), ParentEstimateCategoryID (optional)
 * No multi-tenancy, hard delete, special audit fields (nvarchar)
 */

const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createProposalLineSchema = {
  body: Joi.object({
    ProposalID: validators.guidRequired,
    EstimateCategoryID: validators.guidRequired,
    ParentEstimateCategoryID: validators.guidOptional,
    Name: validators.stringOptional(200),
    Description: validators.stringOptional(5000),
    Amount: validators.decimal(18, 2).required(),
    SqFoot: validators.decimal(18, 2).optional(),
    Multiplier: validators.decimal(18, 2).optional(),
    Percentage: Joi.number().optional(),
    Sequence: validators.integer.optional(),
    SqFootLocked: validators.boolean.default(false)
  })
};

const updateProposalLineSchema = {
  params: idParamSchema,
  body: Joi.object({
    ProposalID: validators.guid,
    EstimateCategoryID: validators.guid,
    ParentEstimateCategoryID: validators.guidOptional,
    Name: validators.stringOptional(200),
    Description: validators.stringOptional(5000),
    Amount: validators.decimal(18, 2),
    SqFoot: validators.decimal(18, 2).optional(),
    Multiplier: validators.decimal(18, 2).optional(),
    Percentage: Joi.number().optional(),
    Sequence: validators.integer,
    SqFootLocked: validators.boolean
  }).min(1)
};

const listProposalLinesSchema = {
  query: paginationSchema.keys({
    proposalId: validators.guid.optional()
  })
};

module.exports = {
  createProposalLineSchema,
  updateProposalLineSchema,
  getProposalLineByIdSchema: { params: idParamSchema },
  deleteProposalLineSchema: { params: idParamSchema },
  listProposalLinesSchema
};
