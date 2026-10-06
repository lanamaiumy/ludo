import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { limitFailedAttemptsByResponsavel } from '../middlewares/rateLimiters';
import type { PinService } from '../services/pinService';
import { pinSchema, redefinirPinSchema } from '../validators/pinSchemas';

export function pinRoutes(service: PinService, jwtSecret: string): Router {
  const router = Router();
  const failedAttemptsLimiter = limitFailedAttemptsByResponsavel();

  router.use(authenticate(jwtSecret));

  router.post('/', async (request, response) => {
    const { pin } = pinSchema.parse(request.body);
    const responsavel = await service.create(response.locals.responsavelId, pin);
    response.status(201).json(responsavel);
  });

  router.post('/verificar', failedAttemptsLimiter, async (request, response) => {
    const { pin } = pinSchema.parse(request.body);
    await service.verify(response.locals.responsavelId, pin);
    response.status(204).end();
  });

  router.put('/', failedAttemptsLimiter, async (request, response) => {
    const data = redefinirPinSchema.parse(request.body);
    const responsavel = await service.reset(response.locals.responsavelId, data);
    response.json(responsavel);
  });

  return router;
}
