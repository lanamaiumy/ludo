import express from 'express';
import type { Database } from './database/types';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { healthRoutes } from './routes/health';

export function createApp(db: Database) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.use('/health', healthRoutes(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
