/**
 * Clients Routes
 *
 * All CRUD operations for Clients
 * Multi-tenant (filtered by UserId)
 */

const express = require('express');
const router = express.Router();

const clientsController = require('../controllers/clients.controller');
const { authenticate } = require('../middleware/auth');
const { enforceMultiTenancy } = require('../middleware/multiTenancy');
const { validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createClientSchema,
  updateClientSchema,
  getClientByIdSchema,
  deleteClientSchema,
  listClientsSchema
} = require('../validation/clients.validation');

// All routes require authentication and multi-tenancy
router.use(authenticate);
router.use(enforceMultiTenancy);

/**
 * @route   GET /api/v1/clients
 * @desc    Get all clients (with pagination and search, filtered by UserId)
 * @access  Private
 */
router.get(
  '/',
  validate(listClientsSchema),
  asyncHandler(clientsController.getAllClients)
);

/**
 * @route   GET /api/v1/clients/:id
 * @desc    Get client by ID (filtered by UserId)
 * @access  Private
 */
router.get(
  '/:id',
  validate(getClientByIdSchema),
  asyncHandler(clientsController.getClientById)
);

/**
 * @route   POST /api/v1/clients
 * @desc    Create new client
 * @access  Private
 */
router.post(
  '/',
  validate(createClientSchema),
  asyncHandler(clientsController.createClient)
);

/**
 * @route   PUT /api/v1/clients/:id
 * @desc    Update client (filtered by UserId)
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateClientSchema),
  asyncHandler(clientsController.updateClient)
);

/**
 * @route   DELETE /api/v1/clients/:id
 * @desc    Delete client (hard delete, filtered by UserId)
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteClientSchema),
  asyncHandler(clientsController.deleteClient)
);

module.exports = router;
