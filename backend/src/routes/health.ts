import { Router } from 'express';
import type { Database } from '../database/types';

export function healthRoutes(db: Database): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    try {
      await db.query('SELECT 1');
      response.json({ status: 'ok', banco: 'conectado' });
    } catch {
      response.status(503).json({ status: 'indisponivel', banco: 'desconectado' });
    }
  });

  return router;
}
