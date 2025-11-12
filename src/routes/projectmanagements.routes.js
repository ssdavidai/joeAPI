const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectmanagements.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/projectmanagements.validation');

router.use(authenticate);
router.get('/', validate(schemas.listProjectManagementsSchema), asyncHandler(controller.getAllProjectManagements));
router.get('/:id', validate(schemas.getProjectManagementByIdSchema), asyncHandler(controller.getProjectManagementById));
router.post('/', validate(schemas.createProjectManagementSchema), asyncHandler(controller.createProjectManagement));
router.put('/:id', validate(schemas.updateProjectManagementSchema), asyncHandler(controller.updateProjectManagement));
router.delete('/:id', validate(schemas.deleteProjectManagementSchema), asyncHandler(controller.deleteProjectManagement));

module.exports = router;
