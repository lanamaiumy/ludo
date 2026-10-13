import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import type { ProgressoService } from '../services/progressoService';
import { criancaIdSchema } from '../validators/criancaSchemas';
import { cenarioParamsSchema } from '../validators/progressoSchemas';

export function progressoRoutes(service: ProgressoService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate(jwtSecret));

  router.get('/', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    response.json(await service.list(response.locals.responsavelId, id));
  });

  router.post('/:cenario/desbloqueio', async (request, response) => {
    const { id, cenario } = cenarioParamsSchema.parse(request.params);
    response.json(await service.unlock(response.locals.responsavelId, id, cenario));
  });

  router.post('/:cenario/conclusao', async (request, response) => {
    const { id, cenario } = cenarioParamsSchema.parse(request.params);
    response.json(await service.complete(response.locals.responsavelId, id, cenario));
  });

  return router;
}
