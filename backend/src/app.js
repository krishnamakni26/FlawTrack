const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { errorResponse } = require('./utils/response');

const app = express();

// Trust reverse proxy (essential for Render / Vercel / Heroku secure cookies and rate-limiting)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Compression & Cookies
app.use(compression());
app.use(cookieParser());

// Strict CORS with normalized origin
const normalizedClientUrl = (env.CLIENT_URL || env.FRONTEND_URL || '').replace(/\/+$/, '');
const allowedOrigins = [
  normalizedClientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or automated test runners)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'Content-Disposition'],
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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(mongoSanitize());

// Health Check Endpoint (matches STEP 1 requirement: { status: "ok", db: "connected|down", uptime, time })
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return res.status(200).json({
    status: 'ok',
    db: isDbConnected ? 'connected' : 'down',
    uptime: Math.round(process.uptime() * 100) / 100,
    time: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
};

app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);
app.get('/health', healthHandler);

// API Routes Mount points (both /api and /api/v1 supported for full compatibility)
const routes = require('./routes');
app.use('/api', routes);
app.use('/api/v1', routes);

// 404 Route Handler
app.use('*', (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
