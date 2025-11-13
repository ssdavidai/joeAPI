const Joi = require('joi');
const { validators } = require('../utils/validation');

const assignSupervisorSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    SupervisorId: validators.integer.required()
  })
};

module.exports = {
  assignSupervisorSchema
};
