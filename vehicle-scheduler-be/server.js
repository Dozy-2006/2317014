require('dotenv').config();

const express = require('express');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const scheduleRouter = require('./routes/schedule');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/', scheduleRouter);

app.use((req, res, next) => {
  const err = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Vehicle Maintenance Scheduler service running on port ${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
