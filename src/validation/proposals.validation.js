const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createProposalSchema = {
  body: Joi.object({
    Number: validators.integer.required(),
    ClientId: validators.guidOptional,
    TemplateId: validators.guidOptional,
    QBClassId: validators.guidOptional,
    QBCustomerId: validators.guidOptional,
    ProposalProjectId: validators.guidOptional,
    Date: validators.date.required(),
    TotalAmount: validators.decimal(18, 2).required(),
    DocStatus: validators.stringRequired(5000),
    IsArchived: validators.boolean.default(false),
    IncludeLinesWithZeroAmount: validators.boolean.default(false)
  })
};

const updateProposalSchema = {
  params: idParamSchema,
  body: Joi.object({
    Number: validators.integer,
    ClientId: validators.guidOptional,
    TemplateId: validators.guidOptional,
    QBClassId: validators.guidOptional,
    QBCustomerId: validators.guidOptional,
    ProposalProjectId: validators.guidOptional,
    Date: validators.date,
    TotalAmount: validators.decimal(18, 2),
    DocStatus: validators.string(5000),
    IsArchived: validators.boolean,
    IncludeLinesWithZeroAmount: validators.boolean
  }).min(1)
};

module.exports = {
  createProposalSchema,
  updateProposalSchema,
  getProposalByIdSchema: { params: idParamSchema },
  deleteProposalSchema: { params: idParamSchema },
  listProposalsSchema: {
    query: paginationSchema.keys({
      clientId: validators.guidOptional,
      includeDeleted: Joi.boolean().default(false),
      includeArchived: Joi.boolean().default(false)
    })
  }
};
