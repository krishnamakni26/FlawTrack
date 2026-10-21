const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let mongoMemoryServer = null;

// Attach persistent lifecycle listeners for observability
let listenersAttached = false;
const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connecting', () => {
    logger.info('MongoDB: Connection state -> CONNECTING');
  });
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB: Connection state -> CONNECTED');
  });
  mongoose.connection.on('open', () => {
    logger.info('MongoDB: Connection state -> OPEN (Ready for operations)');
  });
  mongoose.connection.on('disconnecting', () => {
    logger.warn('MongoDB: Connection state -> DISCONNECTING');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB: Connection state -> DISCONNECTED');
  });
  mongoose.connection.on('close', () => {
    logger.warn('MongoDB: Connection state -> CLOSED');
  });
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });
};

const connectDB = async (customUri = null) => {
  attachConnectionListeners();

  let uri = customUri || env.MONGO_URI || env.MONGODB_URI;

  // In test environment or explicitly requested memory DB in non-production
  if ((env.USE_MEMORY_DB || env.NODE_ENV === 'test') && env.NODE_ENV !== 'production') {
    try {
      // Lazy load only in development/test
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      uri = mongoMemoryServer.getUri();
      logger.info(`Initialized MongoMemoryServer at ${uri}`);
    } catch (err) {
      logger.warn(`Could not start MongoMemoryServer, falling back to ${uri}: ${err.message}`);
    }
  }

  const maxRetries = env.NODE_ENV === 'test' ? 1 : 5;
  const timeoutMs = 10000; // 10s serverSelectionTimeout

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: timeoutMs,
      });

      const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
      logger.info(`MongoDB connected successfully to ${isLocal ? 'local/memory instance' : 'remote cluster'}`);
      return mongoose.connection;
    } catch (err) {
      logger.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);

      if (attempt === maxRetries) {
        // Only in non-production development fallback to memory server if available
        if (env.NODE_ENV === 'development' && !env.USE_MEMORY_DB) {
          try {
            logger.info('Attempting emergency dev fallback to MongoMemoryServer...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongoMemoryServer = await MongoMemoryServer.create();
            const memUri = mongoMemoryServer.getUri();
            await mongoose.connect(memUri, { serverSelectionTimeoutMS: timeoutMs });
            logger.info(`Fallback: Connected to MongoMemoryServer at ${memUri}`);
            return mongoose.connection;
          } catch (memErr) {
            logger.error(`Emergency dev fallback failed: ${memErr.message}`);
          }
        }
        logger.error(`Critical: MongoDB connection failed after ${maxRetries} attempts`);
        throw err;
      }

      // Wait with backoff before retrying
      const delay = Math.min(attempt * 2000, 10000);
      logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return mongoose.connection;
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error(`Error during MongoDB disconnection: ${err.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
