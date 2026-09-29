const { MongoMemoryServer } = require('mongodb-memory-server');

async function test() {
  console.log('Starting MongoMemoryServer...');
  const mem = await MongoMemoryServer.create();
  console.log('Started successfully at:', mem.getUri());
  await mem.stop();
  console.log('Stopped successfully.');
}

test().catch((err) => {
  console.error('MongoMemoryServer error:', err);
});
