const express = require('express');
const router = express.Router();
const { getEstimateRevisionHistory } = require('../controllers/estimaterevisions.controller');

router.get('/revision-history', getEstimateRevisionHistory);

module.exports = router;
