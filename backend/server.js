require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const emailRoutes = require('./routes/emailRoutes');
const notificationManager = require('./utils/notificationManager');
const { migrateSemesterField } = require('./utils/migration');
const { generalLimiter, subscriptionLimiter, adminLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
}));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://www.myslotreminder.site',
      'https://myslotreminder.site',
      process.env.FRONTEND_URL
    ].filter(Boolean) // Remove any undefined values
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { checkVUWebsiteHealth } = require('./utils/datesheetChecker');
    const mongoose = require('mongoose');
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check VU website accessibility
    const vuWebsiteHealth = await checkVUWebsiteHealth();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    
    // Get system uptime
    const uptime = process.uptime();
    
    res.json({
      success: true,
      message: 'VU Datesheet Notifier is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: uptime,
      system: {
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      services: {
        database: {
          status: dbStatus,
          host: mongoose.connection.host || 'unknown'
        },
        vuWebsite: {
          accessible: vuWebsiteHealth.accessible,
          statusCode: vuWebsiteHealth.statusCode,
          responseTime: vuWebsiteHealth.responseTime,
          lastCheck: vuWebsiteHealth.timestamp
        },
        email: {
          smtpHost: process.env.SMTP_HOST || 'not configured',
          smtpPort: process.env.SMTP_PORT || 'not configured',
          fromEmail: process.env.SMTP_FROM_EMAIL || 'not configured'
        }
      },
      monitoring: {
        checkInterval: process.env.CHECK_INTERVAL || 60000,
        datesheetUrl: process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes with specific rate limiting
app.use('/api', emailRoutes);

// Apply rate limiting to specific endpoints
app.use('/api/subscribe', subscriptionLimiter);
app.use('/api/unsubscribe', subscriptionLimiter);
app.use('/api/notify-all', adminLimiter);
app.use('/api/test-email', adminLimiter);
app.use('/api/reset-notification', adminLimiter);
app.use('/api/start-monitoring', adminLimiter);
app.use('/api/stop-monitoring', adminLimiter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'POST /api/subscribe',
      'POST /api/unsubscribe',
      'GET /api/emails',
      'POST /api/notify-all',
      'GET /api/status',
      'POST /api/test-email',
      'POST /api/reset-notification',
      'POST /api/start-monitoring',
      'POST /api/stop-monitoring'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Global error handler:`, error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Initialize and start the server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize notification manager
    await notificationManager.initialize();

    // Run migration to handle existing subscribers without semester field
    await migrateSemesterField();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] 🚀 Server running on port ${PORT}`);
      console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[${new Date().toISOString()}] Health check: http://localhost:${PORT}/health`);
      console.log(`[${new Date().toISOString()}] API Base: http://localhost:${PORT}/api`);
    });

    // Start datesheet monitoring
    notificationManager.startMonitoring();
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log(`[${new Date().toISOString()}] 🛑 Received SIGTERM, shutting down gracefully...`);
      
      // Stop monitoring
      notificationManager.stopMonitoring();
      
      // Close server
      server.close(() => {
        console.log(`[${new Date().toISOString()}] ✅ Server closed`);
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log(`[${new Date().toISOString()}] 🛑 Received SIGINT, shutting down gracefully...`);
      
      // Stop monitoring
      notificationManager.stopMonitoring();
      
      // Close server
      server.close(() => {
        console.log(`[${new Date().toISOString()}] ✅ Server closed`);
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error(`[${new Date().toISOString()}] ❌ Uncaught Exception:`, error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(`[${new Date().toISOString()}] ❌ Unhandled Rejection at:`, promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to start server:`, error);
    process.exit(1);
  }
}

// Start the server
startServer(); 
