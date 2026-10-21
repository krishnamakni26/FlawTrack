const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const Setting = require('./models/Setting');
const { initCronJobs } = require('./jobs');
const logger = require('./utils/logger');

let server = null;

// Graceful process error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason: reason?.message || reason, stack: reason?.stack });
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  // Avoid abrupt exit if possible, or close server cleanly
});

const startServer = async () => {
  try {
    await connectDB();

    // Ensure default settings exist in DB
    await Setting.getSettings();

    // Auto-seed if database is empty (e.g. running with in-memory DB or fresh mongo)
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Empty database detected. Seeding demo users, assets, and vulnerabilities...');
      const seed = require('../scripts/seed');
      await seed(false);
    }

    // Initialize scheduled cron jobs
    initCronJobs();

    // Port and Host binding
    const PORT = parseInt(process.env.PORT || env.PORT || 5000, 10);
    const HOST = '0.0.0.0';

    server = app.listen(PORT, HOST, () => {
      logger.info(`FlawTrack Backend Server running on http://${HOST}:${PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`Health check available at http://${HOST}:${PORT}/api/health`);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          await disconnectDB();
          process.exit(0);
        });
      } else {
        await disconnectDB();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
