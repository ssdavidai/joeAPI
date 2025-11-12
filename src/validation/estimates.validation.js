const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createEstimateSchema = {
  body: Joi.object({
    Amount: validators.decimal(18, 2).optional(),
    EstimateSubCategoryID: validators.guidOptional,
    QBClassID: validators.guidOptional,
    ProjectCompletionDate: validators.dateOptional
  })
};

const updateEstimateSchema = {
  params: idParamSchema,
  body: Joi.object({
    Amount: validators.decimal(18, 2).optional(),
    EstimateSubCategoryID: validators.guidOptional,
    QBClassID: validators.guidOptional,
    ProjectCompletionDate: validators.dateOptional
  }).min(1)
};

module.exports = {
  createEstimateSchema,
  updateEstimateSchema,
  getEstimateByIdSchema: { params: idParamSchema },
  deleteEstimateSchema: { params: idParamSchema },
  listEstimatesSchema: { query: paginationSchema }
};
