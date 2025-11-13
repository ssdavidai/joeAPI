const express = require('express');
const router = express.Router();
const { getAllInvoices, getInvoiceById } = require('../controllers/invoices.controller');

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);

module.exports = router;
