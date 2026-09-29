const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const Setting = require('./models/Setting');
const { initCronJobs } = require('./jobs');
const logger = require('./utils/logger');

let server = null;

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

    // Start HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(`VulnTrack Backend Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
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
