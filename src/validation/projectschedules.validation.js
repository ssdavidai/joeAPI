const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createProjectScheduleSchema = {
  body: Joi.object({
    ProjectId: validators.guidOptional,
    Status: validators.stringOptional(50),
    StartDate: validators.date.required()
  })
};

const updateProjectScheduleSchema = {
  params: idParamSchema,
  body: Joi.object({
    ProjectId: validators.guidOptional,
    Status: validators.stringOptional(50),
    StartDate: validators.date
  }).min(1)
};

module.exports = {
  createProjectScheduleSchema,
  updateProjectScheduleSchema,
  getProjectScheduleByIdSchema: { params: idParamSchema },
  deleteProjectScheduleSchema: { params: idParamSchema },
  listProjectSchedulesSchema: { query: paginationSchema }
};
