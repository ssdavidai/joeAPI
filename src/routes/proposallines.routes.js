const express = require('express');
const router = express.Router();
const controller = require('../controllers/proposallines.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/proposallines.validation');

router.use(authenticate);
router.get('/', validate(schemas.listProposalLinesSchema), asyncHandler(controller.getAllProposalLines));
router.get('/:id', validate(schemas.getProposalLineByIdSchema), asyncHandler(controller.getProposalLineById));
router.post('/', validate(schemas.createProposalLineSchema), asyncHandler(controller.createProposalLine));
router.put('/:id', validate(schemas.updateProposalLineSchema), asyncHandler(controller.updateProposalLine));
router.delete('/:id', validate(schemas.deleteProposalLineSchema), asyncHandler(controller.deleteProposalLine));

module.exports = router;
