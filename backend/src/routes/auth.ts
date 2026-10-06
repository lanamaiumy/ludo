import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { limitAttemptsByOrigin } from '../middlewares/rateLimiters';
import type { AuthService } from '../services/authService';
import { cadastroSchema, loginSchema } from '../validators/authSchemas';

export function authRoutes(service: AuthService, jwtSecret: string): Router {
  const router = Router();
  const attemptsLimiter = limitAttemptsByOrigin();

  router.post('/cadastro', attemptsLimiter, async (request, response) => {
    const data = cadastroSchema.parse(request.body);
    const responsavel = await service.register(data);
    response.status(201).json(responsavel);
  });

  router.post('/login', attemptsLimiter, async (request, response) => {
    const data = loginSchema.parse(request.body);
    const session = await service.login(data);
    response.json(session);
  });

  router.get('/perfil', authenticate(jwtSecret), async (_request, response) => {
    const responsavel = await service.profile(response.locals.responsavelId);
    response.json(responsavel);
  });

  return router;
}
