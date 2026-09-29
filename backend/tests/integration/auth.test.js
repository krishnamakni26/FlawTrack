const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth & User Management Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    test('successfully registers new user with REPORTER role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          team: 'AppSec Red Team',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('REPORTER');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
    });

    test('rejects duplicate email with HTTP 409', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Duplicate',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123!',
      });
    });

    test('logs in with valid credentials and returns JWT tokens', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    test('fails login on incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('locks account after 5 consecutive failed login attempts', async () => {
      for (let i = 0; i < 4; i++) {
        const res = await request(app).post('/api/v1/auth/login').send({
          email: 'john@example.com',
          password: 'WrongPassword!',
        });
        expect(res.status).toBe(401);
      }

      // 5th attempt locks account
      const fifthAttempt = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'WrongPassword!',
      });

      expect(fifthAttempt.status).toBe(429);
      expect(fifthAttempt.body.error.code).toBe('ACCOUNT_LOCKED');

      // Subsequent attempt while locked returns 429 even if correct password
      const lockedAttempt = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePassword123!',
      });

      expect(lockedAttempt.status).toBe(429);
      expect(lockedAttempt.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('returns authenticated user profile', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        name: 'Auth User',
        email: 'auth@example.com',
        password: 'Password123!',
      });

      const token = reg.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('auth@example.com');
    });

    test('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
