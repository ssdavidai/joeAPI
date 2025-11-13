const express = require('express');
const router = express.Router();
const { getScheduleRevisions, getScheduleRevisionById } = require('../controllers/schedulerevisions.controller');

router.get('/', getScheduleRevisions);
router.get('/:id', getScheduleRevisionById);

module.exports = router;
