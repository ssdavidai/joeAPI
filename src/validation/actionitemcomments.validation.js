const Joi = require('joi');
const { validators } = require('../utils/validation');

const createCommentSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required()
  }),
  body: Joi.object({
    Comment: validators.stringRequired(5000)
  })
};

const updateCommentSchema = {
  params: Joi.object({
    actionItemId: validators.integer.required(),
    commentId: validators.integer.required()
  }),
  body: Joi.object({
    Comment: validators.stringRequired(5000)
  })
};

module.exports = {
  createCommentSchema,
  updateCommentSchema
};
