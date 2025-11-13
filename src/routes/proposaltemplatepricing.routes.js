const express = require('express');
const router = express.Router();
const { getProposalTemplatePricing, getProposalTemplatePricingById } = require('../controllers/proposaltemplatepricing.controller');

router.get('/pricing', getProposalTemplatePricing);
router.get('/:id/pricing', getProposalTemplatePricingById);

module.exports = router;
