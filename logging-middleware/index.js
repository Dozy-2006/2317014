const winston = require('winston');
const path = require('path');

// Write log files into the vehicle-scheduler-be directory so they stay within the project boundaries
const logDir = path.resolve(__dirname, '../vehicle-scheduler-be');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'vehicle-scheduler' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

// Express request logging middleware
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMsg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    const logMeta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip
    };

    if (res.statusCode >= 500) {
      logger.error(logMsg, logMeta);
    } else if (res.statusCode >= 400) {
      logger.warn(logMsg, logMeta);
    } else {
      logger.info(logMsg, logMeta);
    }
  });

  next();
};

module.exports = {
  logger,
  loggingMiddleware
};
