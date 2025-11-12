/**
 * Server Entry Point
 *
 * Starts Express server
 * Handles graceful shutdown
 */

const app = require('./app');
const { closePool } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 JoeAPI Server Started');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_DATABASE}`);
  console.log(`🔓 Development User ID: ${process.env.DEV_USER_ID || 'Not set'}`);
  console.log('='.repeat(60));
  console.log(`\n✅ Server ready at http://localhost:${PORT}`);
  console.log(`✅ Health check at http://localhost:${PORT}/health`);
  console.log(`✅ DB health at http://localhost:${PORT}/health/db\n`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('📴 HTTP server closed');

    // Close database pool
    await closePool();

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
