let externalLogger = null;

try {
  // Dynamically resolve the shared logging middleware to avoid hard dependencies
  const { logger } = require('../../logging-middleware');
  externalLogger = logger;
} catch (error) {
  // Fallback console logging when running in environments where the middleware isn't present
  console.warn('[Logger Setup] Shared logging-middleware not found. Operating with fallback logger.');
}

/**
 * Reusable Logger Abstraction
 * Prevents direct coupling of the application to specific logging libraries or modules.
 */
const logger = {
  info: (message, meta = {}) => {
    if (externalLogger) {
      externalLogger.info(message, meta);
    } else {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  error: (message, meta = {}) => {
    if (externalLogger) {
      externalLogger.error(message, meta);
    } else {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  warn: (message, meta = {}) => {
    if (externalLogger) {
      externalLogger.warn(message, meta);
    } else {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  debug: (message, meta = {}) => {
    if (externalLogger) {
      externalLogger.debug(message, meta);
    } else {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  }
};

module.exports = logger;
