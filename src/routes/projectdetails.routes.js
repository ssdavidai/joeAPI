const express = require('express');
const router = express.Router();
const { getProjectDetails } = require('../controllers/projectdetails.controller');

router.get('/:id/details', getProjectDetails);

module.exports = router;
