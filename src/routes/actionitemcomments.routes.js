const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/actionitemcomments.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/actionitemcomments.validation');

router.use(authenticate);
router.get('/', asyncHandler(controller.getAllComments));
router.get('/:commentId', asyncHandler(controller.getCommentById));
router.post('/', validate(schemas.createCommentSchema), asyncHandler(controller.createComment));
router.put('/:commentId', validate(schemas.updateCommentSchema), asyncHandler(controller.updateComment));
router.delete('/:commentId', asyncHandler(controller.deleteComment));

module.exports = router;
