/**
 * Contacts Routes
 *
 * All CRUD operations for Contacts
 */

const express = require('express');
const router = express.Router();

const contactsController = require('../controllers/contacts.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createContactSchema,
  updateContactSchema,
  getContactByIdSchema,
  deleteContactSchema,
  listContactsSchema
} = require('../validation/contacts.validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/contacts
 * @desc    Get all contacts (with pagination and search)
 * @access  Private
 */
router.get(
  '/',
  validate(listContactsSchema),
  asyncHandler(contactsController.getAllContacts)
);

/**
 * @route   GET /api/v1/contacts/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getContactByIdSchema),
  asyncHandler(contactsController.getContactById)
);

/**
 * @route   POST /api/v1/contacts
 * @desc    Create new contact
 * @access  Private
 */
router.post(
  '/',
  validate(createContactSchema),
  asyncHandler(contactsController.createContact)
);

/**
 * @route   PUT /api/v1/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateContactSchema),
  asyncHandler(contactsController.updateContact)
);

/**
 * @route   DELETE /api/v1/contacts/:id
 * @desc    Delete contact (soft delete)
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteContactSchema),
  asyncHandler(contactsController.deleteContact)
);

module.exports = router;
