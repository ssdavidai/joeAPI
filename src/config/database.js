/**
 * Database Configuration and Connection Pool
 *
 * Connects to chaconstruction-test MSSQL database
 * Provides connection pool for efficient database access
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true, // Azure SQL requires encryption
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist, reuses existing pool
 *
 * @returns {Promise<sql.ConnectionPool>}
 */
const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config)
      .then(pool => {
        console.log('✅ Connected to SQL Server');

        // Handle pool errors
        pool.on('error', err => {
          console.error('💥 Database pool error:', err);
          poolPromise = null; // Reset pool on error
        });

        return pool;
      })
      .catch(err => {
        console.error('❌ Failed to connect to SQL Server:', err.message);
        poolPromise = null; // Reset on failure
        throw err;
      });
  }

  return poolPromise;
};

/**
 * Execute a query with automatic connection management
 *
 * @param {string} query - SQL query string
 * @param {Object} params - Query parameters {key: value}
 * @returns {Promise<sql.IResult>}
 */
const executeQuery = async (query, params = {}) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });

    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

/**
 * Execute a stored procedure
 *
 * @param {string} procedureName - Name of stored procedure
 * @param {Object} params - Procedure parameters {key: {type, value}}
 * @returns {Promise<sql.IResult>}
 */
const executeProcedure = async (procedureName, params = {}) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters with types
    Object.keys(params).forEach(key => {
      const param = params[key];
      request.input(key, param.type, param.value);
    });

    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('Procedure execution error:', error);
    throw error;
  }
};

/**
 * Close database connection pool
 * Call this on application shutdown
 */
const closePool = async () => {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
    console.log('📴 Database connection pool closed');
  }
};

/**
 * Check database connection health
 *
 * @returns {Promise<boolean>}
 */
const checkHealth = async () => {
  try {
    const result = await executeQuery('SELECT 1 AS healthy');
    return result.recordset[0].healthy === 1;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
};

module.exports = {
  sql,
  getPool,
  executeQuery,
  executeProcedure,
  closePool,
  checkHealth
};
