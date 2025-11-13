const express = require('express');
const router = express.Router();
const { getAllTransactions, getTransactionSummary } = require('../controllers/transactions.controller');

router.get('/', getAllTransactions);
router.get('/summary', getTransactionSummary);

module.exports = router;
