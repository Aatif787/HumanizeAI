const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

console.log('Starting server...');

const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const humanizerRoutes = require('./routes/humanizer');
const userRoutes = require('./routes/user');
const detectionRoutes = require('./routes/detection');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com', 'https://unpkg.com', 'https://use.fontawesome.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com', 'https://use.fontawesome.com'],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdnjs.cloudflare.com', 'https://cdn.tailwindcss.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      mediaSrc: ['\'self\'', 'data:', 'https:'], // Added for video support
      connectSrc: ['\'self\''],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) },
  skip: () => process.env.VERCEL // Skip detailed logging on Vercel to avoid potential issues
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/humanize', authenticateToken, humanizerRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/detect', authenticateToken, detectionRoutes);

// Serve static files (frontend) with cache control.
//
// Important: Avoid `immutable` caching for same-filename assets (e.g. video.mp4),
// otherwise Vercel/CDN/browsers can keep serving old bytes after redeploy.
const isVercel = Boolean(process.env.VERCEL);
app.use(express.static(path.join(__dirname, '../public'), {
  // On Vercel, prefer revalidation-friendly defaults so new deployments show immediately.
  maxAge: isVercel ? 0 : '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    const p = filePath.toLowerCase();
    if (p.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      return;
    }

    if (p.endsWith('.js') || p.endsWith('.css')) {
      res.setHeader('Cache-Control', isVercel ? 'no-cache, must-revalidate' : 'public, max-age=86400, must-revalidate');
      return;
    }

    // Media/images: DO NOT use immutable unless filenames are content-hashed.
    if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.svg') || p.endsWith('.mp4') || p.endsWith('.webp') || p.endsWith('.gif')) {
      res.setHeader('Cache-Control', isVercel ? 'no-cache, must-revalidate' : 'public, max-age=86400, must-revalidate');
    }
  }
}));

// Serve required frontend scripts from project root with no-cache for development/root files
const serveScript = (fileName) => (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, `../${fileName}`));
};

app.get('/advanced-humanizer.js', serveScript('advanced-humanizer.js'));
app.get('/script.js', serveScript('script.js'));
app.get('/ai-detection-tester.js', serveScript('ai-detection-tester.js'));
app.get('/on-device-detection-integration.js', serveScript('on-device-detection-integration.js'));

// Main entry point for frontend - strictly no-cache
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Fallback for SPA-like routing (optional but good for stability)
app.get('*', (req, res, next) => {
  // If it's an API route, let it fall through to the API routes or 404
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Only listen if we're not running as a Vercel function
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    }
  } catch (error) {
    console.error('❌ Server startup error:', error);
    logger.error('Server startup error:', error);
    // Don't exit on Vercel
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
