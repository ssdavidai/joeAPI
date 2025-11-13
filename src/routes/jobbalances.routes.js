const express = require('express');
const router = express.Router();
const { getJobBalances, getJobBalanceByProject } = require('../controllers/jobbalances.controller');

router.get('/', getJobBalances);
router.get('/:projectId', getJobBalanceByProject);

module.exports = router;
