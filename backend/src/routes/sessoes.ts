import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import type { SessaoService } from '../services/sessaoService';
import { criancaIdSchema } from '../validators/criancaSchemas';
import { semanaQuerySchema, sessaoSchema } from '../validators/sessaoSchemas';

export function sessaoRoutes(service: SessaoService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate(jwtSecret));

  router.post('/', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    const sessao = sessaoSchema.parse(request.body);
    response.status(201).json(await service.register(response.locals.responsavelId, id, sessao));
  });

  router.get('/semana', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    const { inicio } = semanaQuerySchema.parse(request.query);
    response.json(await service.week(response.locals.responsavelId, id, inicio));
  });

  return router;
}
