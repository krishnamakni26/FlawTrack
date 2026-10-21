const { MongoMemoryServer } = require('../backend/node_modules/mongodb-memory-server');
const mongoose = require('../backend/node_modules/mongoose');
const { spawn } = require('child_process');
const http = require('http');

async function runLocalProdTest() {
  console.log('Starting In-Memory MongoDB for Local Production Verification...');
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri() + 'flawtrack';
  console.log('MongoDB URI:', mongoUri);

  // Set environment variables for production
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5001';
  process.env.MONGO_URI = mongoUri;
  process.env.JWT_SECRET = 'a'.repeat(64);
  process.env.JWT_REFRESH_SECRET = 'b'.repeat(64);
  process.env.CLIENT_URL = 'http://localhost:4173';
  process.env.FRONTEND_URL = 'http://localhost:4173';
  process.env.THREAT_INTEL_MODE = 'offline';

  // Seed the database
  console.log('\n--- Running Seed ---');
  const seed = require('../backend/scripts/seed');
  await seed(false); // keep connection open or let backend reuse
  await mongoose.disconnect();

  // Start backend server in production mode
  console.log('\n--- Starting Production Backend on Port 5001 ---');
  const backendProc = spawn('node', ['src/server.js'], {
    cwd: './backend',
    env: { ...process.env, PORT: '5001', MONGO_URI: mongoUri },
    stdio: 'inherit',
    shell: true,
  });

  // Start Vite Preview on Port 4173
  console.log('\n--- Starting Vite Preview on Port 4173 ---');
  const frontendProc = spawn('npm', ['run', 'preview', '--', '--port', '4173', '--host'], {
    cwd: './frontend',
    env: { ...process.env },
    stdio: 'inherit',
    shell: true,
  });

  // Wait for both to be accessible
  console.log('\nWaiting for servers to be healthy...');
  let healthy = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const res = await fetch('http://localhost:5001/api/health');
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'ok') {
          healthy = true;
          break;
        }
      }
    } catch (e) {
      // wait
    }
  }

  if (!healthy) {
    console.error('Backend failed to become healthy!');
    backendProc.kill();
    frontendProc.kill();
    await mongod.stop();
    process.exit(1);
  }
  console.log('Backend is healthy!');

  // Run the smoke test suite!
  console.log('\n--- Executing Smoke Test Suite ---');
  const smokeProc = spawn('node', ['scripts/smoke-test.js', 'http://localhost:5001', 'http://localhost:4173'], {
    stdio: 'inherit',
    shell: true,
  });

  smokeProc.on('exit', async (code) => {
    console.log(`\nSmoke test finished with exit code ${code}`);
    backendProc.kill();
    frontendProc.kill();
    await mongod.stop();
    process.exit(code || 0);
  });
}

runLocalProdTest().catch(err => {
  console.error('Local verification failed:', err);
  process.exit(1);
});
