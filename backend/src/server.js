// server.js — entry point
// env.js MUST be imported first so the app refuses to start with bad config.
import './config/env.js';
import 'dotenv/config';
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { startWorker, stopWorker } from './jobs/worker.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    logger.info(`🚀 BuildMart API Server running on port ${PORT}`);
    logger.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Start background jobs worker
  await startWorker();

  // Graceful shutdown handling
  const handleShutdown = async (signal) => {
    logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed. No longer accepting new connections.');
      });
    }

    try {
      await stopWorker();
      await closeDB();
      logger.info('✅ Database and background jobs closed cleanly. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }

    // Force exit if hanging
    setTimeout(() => {
      logger.warn('Forcing server exit after 10s timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error('Fatal error during server startup:', err);
  process.exit(1);
});

export default app;
