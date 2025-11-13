const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/actionitemsupervisors.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/actionitemsupervisors.validation');

router.use(authenticate);
router.get('/', asyncHandler(controller.getAllSupervisors));
router.get('/:supervisorAssignmentId', asyncHandler(controller.getSupervisorById));
router.post('/', validate(schemas.assignSupervisorSchema), asyncHandler(controller.assignSupervisor));
router.delete('/:supervisorAssignmentId', asyncHandler(controller.removeSupervisor));

module.exports = router;
