const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { successResponse, errorResponse } = require('./utils/response');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Strict CORS
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});
app.use('/api', globalLimiter);

// Body Parsing & Sanitation
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize());

// Health Check
app.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

app.get('/api/v1/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    service: 'VulnTrack API v1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// API Routes Mount point
const routes = require('./routes');
app.use('/api/v1', routes);

// 404 Route Handler
app.use('*', (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
