import { Server } from 'http';
import { Middleware } from 'koa';

type GracefulShutdownOpts = {
  logger?: any;
  forceTimeout?: number;
}

export const shutdownMiddleware = (server:Server, opts:GracefulShutdownOpts = {}): Middleware=> {
  const logger = opts.logger || console; // Defaults to console
  const forceTimeout = typeof opts.forceTimeout === 'number' ? opts.forceTimeout : (30 * 1000); // Defaults to 30s

  let shuttingDown = false;

  process.on('SIGTERM', function gracefulExit() {
    if (shuttingDown) {
      // We already know we're shutting down, don't continue this function
      return;
    } else {
      shuttingDown = true;
    }

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return process.exit(0);
    }

    logger.warn('Received kill signal (SIGTERM), shutting down...');

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, forceTimeout);

    server.close(() => {
      logger.info('Closed out remaining connections');
      process.exit(0);
    });
  });

  process.on('SIGINT', function gracefulExit() {
    if (shuttingDown) {
      // We already know we're shutting down, don't continue this function
      return;
    } else {
      shuttingDown = true;
    }

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return process.exit(0);
    }

    logger.warn('Received kill signal (SIGINT), shutting down...');

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, forceTimeout);

    server.close(() => {
      logger.info('Closed out remaining connections');
      process.exit(0);
    });
  });

  return function shutdown(ctx, next) {
    if (shuttingDown) {
      ctx.status = 503;
      ctx.set('Connection', 'close');
      ctx.body = 'Server is in the process of shutting down';
    } else {
      return next();
    }
  };
};