import cors from 'cors';
import express from 'express';
import type { Database } from './database/types';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { createCriancaRepository } from './repositories/criancaRepository';
import { createResponsavelRepository } from './repositories/responsavelRepository';
import { createSessaoRepository } from './repositories/sessaoRepository';
import { authRoutes } from './routes/auth';
import { criancaRoutes } from './routes/criancas';
import { healthRoutes } from './routes/health';
import { pinRoutes } from './routes/pin';
import { sessaoRoutes } from './routes/sessoes';
import { createAuthService } from './services/authService';
import { createCriancaService } from './services/criancaService';
import { createPinService } from './services/pinService';
import { createSessaoService } from './services/sessaoService';

type AppDependencies = {
  db: Database;
  jwtSecret: string;
  corsOrigins?: string[];
};

export function createApp({ db, jwtSecret, corsOrigins = [] }: AppDependencies) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  const responsavelRepository = createResponsavelRepository(db);
  const authService = createAuthService(responsavelRepository, jwtSecret);
  const pinService = createPinService(responsavelRepository);
  const criancaRepository = createCriancaRepository(db);
  const criancaService = createCriancaService(criancaRepository);
  const sessaoService = createSessaoService(criancaRepository, createSessaoRepository(db));

  app.use('/health', healthRoutes(db));
  app.use('/auth/pin', pinRoutes(pinService, jwtSecret));
  app.use('/auth', authRoutes(authService, jwtSecret));
  app.use('/criancas/:id/sessoes', sessaoRoutes(sessaoService, jwtSecret));
  app.use('/criancas', criancaRoutes(criancaService, jwtSecret));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
