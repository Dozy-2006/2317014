const logger = require('../config/logger');

/**
 * Express Error Handling Middleware.
 * Catches errors, logs them with the Winston logger, and returns standard JSON responses.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  // Log error using winston logger (do NOT use console.log)
  logger.error(`App Error: ${message}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    stack: err.stack,
    details
  });

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
      ...(details ? { details } : {})
    }
  });
}

module.exports = errorHandler;
