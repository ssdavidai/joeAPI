const express = require('express');
const router = express.Router();
const { getProposalPipeline } = require('../controllers/proposalpipeline.controller');

router.get('/pipeline', getProposalPipeline);

module.exports = router;
