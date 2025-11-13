const Joi = require('joi');
const { validators } = require('../utils/validation');

const createScheduleChangeSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    NoOfDays: validators.integer.required(),
    ConstructionTaskId: validators.guid.required(),
    RequiresClientApproval: validators.boolean.default(true)
  })
};

const updateScheduleChangeSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    NoOfDays: validators.integer.optional(),
    ConstructionTaskId: validators.guid.optional(),
    RequiresClientApproval: validators.boolean.optional()
  }).min(1)
};

module.exports = {
  createScheduleChangeSchema,
  updateScheduleChangeSchema
};
