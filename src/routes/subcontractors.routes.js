const express = require('express');
const router = express.Router();
const controller = require('../controllers/subcontractors.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createSubContractorSchema,
  updateSubContractorSchema,
  getSubContractorByIdSchema,
  deleteSubContractorSchema,
  listSubContractorsSchema
} = require('../validation/subcontractors.validation');

router.use(authenticate);

router.get('/', validate(listSubContractorsSchema), asyncHandler(controller.getAllSubContractors));
router.get('/:id', validate(getSubContractorByIdSchema), asyncHandler(controller.getSubContractorById));
router.post('/', validate(createSubContractorSchema), asyncHandler(controller.createSubContractor));
router.put('/:id', validate(updateSubContractorSchema), asyncHandler(controller.updateSubContractor));
router.delete('/:id', validate(deleteSubContractorSchema), asyncHandler(controller.deleteSubContractor));

module.exports = router;
