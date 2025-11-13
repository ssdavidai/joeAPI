const Joi = require('joi');
const { validators, paginationSchema } = require('../utils/validation');

const createActionItemSchema = {
  body: Joi.object({
    Title: validators.stringRequired(5000),
    Description: validators.stringRequired(5000),
    ProjectId: validators.guidOptional,
    ActionTypeId: validators.integer.required(),
    DueDate: validators.date.required(),
    Status: validators.integer.required(),
    Source: validators.integer.required(),
    IsArchived: validators.boolean.default(false),
    AcceptedBy: validators.integer.optional(),
    // Nested objects for creating related data
    CostChange: Joi.object({
      Amount: Joi.number().required(),
      EstimateCategoryId: validators.guid.required(),
      RequiresClientApproval: validators.boolean.default(true)
    }).optional(),
    ScheduleChange: Joi.object({
      NoOfDays: validators.integer.required(),
      ConstructionTaskId: validators.guid.required(),
      RequiresClientApproval: validators.boolean.default(true)
    }).optional(),
    SupervisorIds: Joi.array().items(validators.integer).optional(),
    InitialComment: validators.string(5000).optional()
  })
};

const updateActionItemSchema = {
  params: Joi.object({ id: validators.integer.required() }),
  body: Joi.object({
    Title: validators.string(5000),
    Description: validators.string(5000),
    ProjectId: validators.guidOptional,
    ActionTypeId: validators.integer,
    DueDate: validators.date,
    Status: validators.integer,
    Source: validators.integer,
    IsArchived: validators.boolean,
    AcceptedBy: validators.integer.optional()
  }).min(1)
};

module.exports = {
  createActionItemSchema,
  updateActionItemSchema,
  getActionItemByIdSchema: { params: Joi.object({ id: validators.integer.required() }) },
  deleteActionItemSchema: { params: Joi.object({ id: validators.integer.required() }) },
  listActionItemsSchema: {
    query: paginationSchema.keys({
      projectId: validators.guid.optional(),
      includeDeleted: Joi.boolean().default(false),
      includeArchived: Joi.boolean().default(false)
    })
  }
};
