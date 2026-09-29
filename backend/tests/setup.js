const { connectDB, disconnectDB } = require('../src/config/database');
const mongoose = require('mongoose');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.USE_MEMORY_DB = 'true';
  process.env.THREAT_INTEL_MODE = 'offline';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      if (collection.collectionName !== 'settings') {
        await collection.deleteMany({});
      }
    }
  }
});
