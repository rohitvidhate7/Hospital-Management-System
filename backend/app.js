const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Local imports
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { protect, authorize } = require('./middleware/auth');

// Init app
const app = express();

// Connect DB
connectDB();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS - secure origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL || '',
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Health check - public
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital Management API is healthy and running',
    data: { timestamp: new Date().toISOString() }
  });
});

// API Routes v1 - all protected by default
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', protect, require('./routes/patients'));
app.use('/api/doctors', protect, require('./routes/doctors'));
app.use('/api/departments', protect, require('./routes/departments'));
app.use('/api/services', protect, require('./routes/services'));
app.use('/api/appointments', protect, require('./routes/appointments'));
app.use('/api/bookings', protect, require('./routes/bookings'));
app.use('/api/payments', protect, require('./routes/payments'));
app.use('/api/dashboard', protect, require('./routes/dashboard'));

// 404 handler for API routes
app.use('/api/*', (req, res, next) => {
  console.error(`🚫 404 API Route Not Found: ${req.method} ${req.originalUrl}`);
  console.error('Available routes:', [
    '/api/health', '/api/auth/*', '/api/patients', '/api/doctors',
    '/api/departments', '/api/services', '/api/appointments', 
    '/api/bookings', '/api/payments', '/api/dashboard'
  ].join('\\n'));
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
    method: req.method,
    available: ['/api/health', '/api/auth/login', '/api/auth/register']
  });
});

// Global error handler - last
app.use(errorHandler);

module.exports = app;

