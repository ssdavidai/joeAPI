const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectscheduletasks.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/projectscheduletasks.validation');

router.use(authenticate);
router.get('/', validate(schemas.listProjectScheduleTasksSchema), asyncHandler(controller.getAllProjectScheduleTasks));
router.get('/:id', validate(schemas.getProjectScheduleTaskByIdSchema), asyncHandler(controller.getProjectScheduleTaskById));
router.post('/', validate(schemas.createProjectScheduleTaskSchema), asyncHandler(controller.createProjectScheduleTask));
router.put('/:id', validate(schemas.updateProjectScheduleTaskSchema), asyncHandler(controller.updateProjectScheduleTask));
router.delete('/:id', validate(schemas.deleteProjectScheduleTaskSchema), asyncHandler(controller.deleteProjectScheduleTask));

module.exports = router;
