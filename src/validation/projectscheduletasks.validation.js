const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createProjectScheduleTaskSchema = {
  body: Joi.object({
    ProjectScheduleId: validators.guidRequired,
    ConstructionTaskId: validators.guidRequired,
    Name: validators.stringRequired(150),
    Sequence: validators.integer.required(),
    Duration: validators.integer.required(),
    StartDate: validators.date.required(),
    EndDate: validators.date.required(),
    Pred1: validators.guidOptional,
    Lag1: validators.integer.optional(),
    Pred2: validators.guidOptional,
    Lag2: validators.integer.optional(),
    Pred3: validators.guidOptional,
    Lag3: validators.integer.optional()
  })
};

const updateProjectScheduleTaskSchema = {
  params: idParamSchema,
  body: Joi.object({
    ProjectScheduleId: validators.guid,
    ConstructionTaskId: validators.guid,
    Name: validators.string(150),
    Sequence: validators.integer,
    Duration: validators.integer,
    StartDate: validators.date,
    EndDate: validators.date,
    Pred1: validators.guidOptional,
    Lag1: validators.integer.optional(),
    Pred2: validators.guidOptional,
    Lag2: validators.integer.optional(),
    Pred3: validators.guidOptional,
    Lag3: validators.integer.optional()
  }).min(1)
};

module.exports = {
  createProjectScheduleTaskSchema,
  updateProjectScheduleTaskSchema,
  getProjectScheduleTaskByIdSchema: { params: idParamSchema },
  deleteProjectScheduleTaskSchema: { params: idParamSchema },
  listProjectScheduleTasksSchema: {
    query: paginationSchema.keys({
      scheduleId: validators.guid.optional()
    })
  }
};
