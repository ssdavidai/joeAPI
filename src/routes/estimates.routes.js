const express = require('express');
const router = express.Router();
const controller = require('../controllers/estimates.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/estimates.validation');

router.use(authenticate);
router.get('/', validate(schemas.listEstimatesSchema), asyncHandler(controller.getAllEstimates));
router.get('/:id', validate(schemas.getEstimateByIdSchema), asyncHandler(controller.getEstimateById));
router.post('/', validate(schemas.createEstimateSchema), asyncHandler(controller.createEstimate));
router.put('/:id', validate(schemas.updateEstimateSchema), asyncHandler(controller.updateEstimate));
router.delete('/:id', validate(schemas.deleteEstimateSchema), asyncHandler(controller.deleteEstimate));

module.exports = router;
