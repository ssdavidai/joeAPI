const express = require('express');
const router = express.Router();
const { getDeposits, getDepositByProject } = require('../controllers/deposits.controller');

router.get('/', getDeposits);
router.get('/:projectId', getDepositByProject);

module.exports = router;
