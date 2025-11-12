const Joi = require('joi');
const { validators, paginationSchema, idParamSchema } = require('../utils/validation');

const createProjectManagementSchema = {
  body: Joi.object({
    QBClassID: validators.guidRequired,
    ConstructionTaskID: validators.guidRequired,
    Status: validators.stringRequired(50),
    ProgressPercentage: validators.decimal(5, 2).required(),
    Notes: validators.stringRequired(5000),
    Description: validators.stringRequired(5000),
    StartDate: validators.dateOptional,
    EndDate: validators.dateOptional,
    AssignedTo: validators.guidOptional,
    Pred1ID: validators.guidOptional,
    Pred1LagID: validators.guidOptional,
    Pred2ID: validators.guidOptional,
    Pred2LagID: validators.guidOptional,
    Pred3ID: validators.guidOptional,
    Pred3LagID: validators.guidOptional
  })
};

const updateProjectManagementSchema = {
  params: idParamSchema,
  body: Joi.object({
    QBClassID: validators.guid,
    ConstructionTaskID: validators.guid,
    Status: validators.string(50),
    ProgressPercentage: validators.decimal(5, 2),
    Notes: validators.string(5000),
    Description: validators.string(5000),
    StartDate: validators.dateOptional,
    EndDate: validators.dateOptional,
    AssignedTo: validators.guidOptional,
    Pred1ID: validators.guidOptional,
    Pred1LagID: validators.guidOptional,
    Pred2ID: validators.guidOptional,
    Pred2LagID: validators.guidOptional,
    Pred3ID: validators.guidOptional,
    Pred3LagID: validators.guidOptional
  }).min(1)
};

module.exports = {
  createProjectManagementSchema,
  updateProjectManagementSchema,
  getProjectManagementByIdSchema: { params: idParamSchema },
  deleteProjectManagementSchema: { params: idParamSchema },
  listProjectManagementsSchema: { query: paginationSchema }
};
