const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/actionitemschedulechange.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/actionitemschedulechange.validation');

router.use(authenticate);
router.get('/', asyncHandler(controller.getScheduleChange));
router.post('/', validate(schemas.createScheduleChangeSchema), asyncHandler(controller.createScheduleChange));
router.put('/', validate(schemas.updateScheduleChangeSchema), asyncHandler(controller.updateScheduleChange));
router.delete('/', asyncHandler(controller.deleteScheduleChange));

module.exports = router;
