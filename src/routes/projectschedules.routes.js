const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectschedules.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/projectschedules.validation');

router.use(authenticate);
router.get('/', validate(schemas.listProjectSchedulesSchema), asyncHandler(controller.getAllProjectSchedules));
router.get('/:id', validate(schemas.getProjectScheduleByIdSchema), asyncHandler(controller.getProjectScheduleById));
router.post('/', validate(schemas.createProjectScheduleSchema), asyncHandler(controller.createProjectSchedule));
router.put('/:id', validate(schemas.updateProjectScheduleSchema), asyncHandler(controller.updateProjectSchedule));
router.delete('/:id', validate(schemas.deleteProjectScheduleSchema), asyncHandler(controller.deleteProjectSchedule));

module.exports = router;
