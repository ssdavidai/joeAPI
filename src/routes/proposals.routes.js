const express = require('express');
const router = express.Router();
const controller = require('../controllers/proposals.controller');
const { authenticate } = require('../middleware/auth');
const { enforceMultiTenancy } = require('../middleware/multiTenancy');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/proposals.validation');

router.use(authenticate);
router.use(enforceMultiTenancy);

router.get('/', validate(schemas.listProposalsSchema), asyncHandler(controller.getAllProposals));
router.get('/:id', validate(schemas.getProposalByIdSchema), asyncHandler(controller.getProposalById));
router.post('/', validate(schemas.createProposalSchema), asyncHandler(controller.createProposal));
router.put('/:id', validate(schemas.updateProposalSchema), asyncHandler(controller.updateProposal));
router.delete('/:id', validate(schemas.deleteProposalSchema), asyncHandler(controller.deleteProposal));

module.exports = router;
