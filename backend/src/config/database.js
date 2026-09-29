const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let mongoMemoryServer = null;

const connectDB = async (customUri = null) => {
  let uri = customUri || env.MONGODB_URI;

  if (env.USE_MEMORY_DB || env.NODE_ENV === 'test') {
    try {
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

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected successfully to ${uri.includes('localhost') || uri.includes('127.0.0.1') ? 'local/memory instance' : 'remote cluster'}`);
  } catch (err) {
    logger.warn(`Connection to ${uri} failed: ${err.message}. Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      logger.info(`Fallback: Connected to MongoMemoryServer at ${memUri}`);
    } catch (memErr) {
      logger.error(`Critical: MongoDB connection failed completely: ${memErr.message}`);
      throw memErr;
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
