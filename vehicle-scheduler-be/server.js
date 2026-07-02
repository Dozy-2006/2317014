// Load environment variables
require('dotenv').config();

const express = require('express');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const scheduleRouter = require('./routes/schedule');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Integrate global request logging middleware
app.use(requestLogger);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Application routing
app.use('/', scheduleRouter);

// Catch-all route for unmatched paths (404)
app.use((req, res, next) => {
  const err = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Centralized error handling middleware
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Vehicle Maintenance Scheduler service running on port ${PORT}`);
});

// Handle unhandled Promise rejections and uncaught Exceptions to avoid silent crashes
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  // Graceful exit
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
