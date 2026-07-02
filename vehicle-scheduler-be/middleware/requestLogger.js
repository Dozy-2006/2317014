const logger = require('../config/logger');

let externalMiddleware = null;

try {
  const { loggingMiddleware } = require('../../logging-middleware');
  externalMiddleware = loggingMiddleware;
} catch (error) {
}

const requestLogger = (req, res, next) => {
  if (externalMiddleware) {
    return externalMiddleware(req, res, next);
  }

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMsg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip
    };

    if (res.statusCode >= 500) {
      logger.error(logMsg, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(logMsg, meta);
    } else {
      logger.info(logMsg, meta);
    }
  });

  next();
};

module.exports = requestLogger;
