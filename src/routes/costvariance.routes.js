const express = require('express');
const router = express.Router();
const { getCostVariance } = require('../controllers/costvariance.controller');

router.get('/', getCostVariance);

module.exports = router;
