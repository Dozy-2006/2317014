const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

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
