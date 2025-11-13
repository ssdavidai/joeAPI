const express = require('express');
const router = express.Router();
const { getCostRevisions, getCostRevisionById } = require('../controllers/costrevisions.controller');

router.get('/', getCostRevisions);
router.get('/:id', getCostRevisionById);

module.exports = router;
