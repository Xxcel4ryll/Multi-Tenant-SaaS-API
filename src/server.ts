import app from './app';
import config from './config';
import logger from './utils/logger';
import { testConnection } from './database';
import { initializeAssociations } from './modules';

const PORT = config.port;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize model associations
    initializeAssociations();
    logger.info('Model associations initialized');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.node_env} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}${config.api_prefix}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (): void => {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();

export default app;
