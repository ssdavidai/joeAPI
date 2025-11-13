const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/actionitemcostchange.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/actionitemcostchange.validation');

router.use(authenticate);
router.get('/', asyncHandler(controller.getCostChange));
router.post('/', validate(schemas.createCostChangeSchema), asyncHandler(controller.createCostChange));
router.put('/', validate(schemas.updateCostChangeSchema), asyncHandler(controller.updateCostChange));
router.delete('/', asyncHandler(controller.deleteCostChange));

module.exports = router;
