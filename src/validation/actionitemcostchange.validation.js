const Joi = require('joi');
const { validators } = require('../utils/validation');

const createCostChangeSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    Amount: Joi.number().required(),
    EstimateCategoryId: validators.guid.required(),
    RequiresClientApproval: validators.boolean.default(true)
  })
};

const updateCostChangeSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    Amount: Joi.number().optional(),
    EstimateCategoryId: validators.guid.optional(),
    RequiresClientApproval: validators.boolean.optional()
  }).min(1)
};

module.exports = {
  createCostChangeSchema,
  updateCostChangeSchema
};
