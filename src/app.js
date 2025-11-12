/**
 * Express Application Setup
 *
 * Main Express app with all middleware configured
 * Routes, security, logging, error handling
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { checkHealth } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const response = require('./utils/response');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID middleware (for tracking)
app.use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  response.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  }, 'API is healthy');
});

app.get('/health/db', async (req, res) => {
  try {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      response.success(res, {
        database: 'healthy',
        timestamp: new Date().toISOString()
      }, 'Database connection is healthy');
    } else {
      response.error(res, 'Database connection is unhealthy', 503);
    }
  } catch (error) {
    response.error(res, 'Database health check failed', 503);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  response.success(res, {
    name: 'JoeAPI - Construction Management API',
    version: '1.0.0',
    description: 'REST API for construction management system',
    endpoints: {
      health: '/health',
      dbHealth: '/health/db',
      api: '/api/v1'
    }
  }, 'Welcome to JoeAPI');
});

// API Routes
const contactsRouter = require('./routes/contacts.routes');
const clientsRouter = require('./routes/clients.routes');
const subcontractorsRouter = require('./routes/subcontractors.routes');
const estimatesRouter = require('./routes/estimates.routes');
const proposalsRouter = require('./routes/proposals.routes');
const proposallinesRouter = require('./routes/proposallines.routes');
const projectmanagementsRouter = require('./routes/projectmanagements.routes');
const projectschedulesRouter = require('./routes/projectschedules.routes');
const projectscheduletasksRouter = require('./routes/projectscheduletasks.routes');
const actionitemsRouter = require('./routes/actionitems.routes');

app.use('/api/v1/contacts', contactsRouter);
app.use('/api/v1/clients', clientsRouter);
app.use('/api/v1/subcontractors', subcontractorsRouter);
app.use('/api/v1/estimates', estimatesRouter);
app.use('/api/v1/proposals', proposalsRouter);
app.use('/api/v1/proposallines', proposallinesRouter);
app.use('/api/v1/projectmanagements', projectmanagementsRouter);
app.use('/api/v1/projectschedules', projectschedulesRouter);
app.use('/api/v1/projectscheduletasks', projectscheduletasksRouter);
app.use('/api/v1/actionitems', actionitemsRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
