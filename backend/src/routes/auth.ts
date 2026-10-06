import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../middlewares/authenticate';
import type { AuthService } from '../services/authService';
import { cadastroSchema, loginSchema } from '../validators/authSchemas';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function authRoutes(service: AuthService, jwtSecret: string): Router {
  const router = Router();

  const attemptsLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  });

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
