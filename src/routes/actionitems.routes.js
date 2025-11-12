const express = require('express');
const router = express.Router();
const controller = require('../controllers/actionitems.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const schemas = require('../validation/actionitems.validation');

router.use(authenticate);
router.get('/', validate(schemas.listActionItemsSchema), asyncHandler(controller.getAllActionItems));
router.get('/:id', validate(schemas.getActionItemByIdSchema), asyncHandler(controller.getActionItemById));
router.post('/', validate(schemas.createActionItemSchema), asyncHandler(controller.createActionItem));
router.put('/:id', validate(schemas.updateActionItemSchema), asyncHandler(controller.updateActionItem));
router.delete('/:id', validate(schemas.deleteActionItemSchema), asyncHandler(controller.deleteActionItem));

module.exports = router;
