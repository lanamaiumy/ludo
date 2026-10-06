import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import type { CriancaService } from '../services/criancaService';
import { configuracaoSchema, criancaIdSchema, criancaSchema } from '../validators/criancaSchemas';

export function criancaRoutes(service: CriancaService, jwtSecret: string): Router {
  const router = Router();

  router.use(authenticate(jwtSecret));

  router.get('/', async (_request, response) => {
    response.json(await service.list(response.locals.responsavelId));
  });

  router.post('/', async (request, response) => {
    const { nome } = criancaSchema.parse(request.body);
    const crianca = await service.create(response.locals.responsavelId, nome);
    response.status(201).json(crianca);
  });

  router.get('/:id', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    response.json(await service.get(response.locals.responsavelId, id));
  });

  router.patch('/:id', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    const { nome } = criancaSchema.parse(request.body);
    response.json(await service.rename(response.locals.responsavelId, id, nome));
  });

  router.delete('/:id', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    await service.remove(response.locals.responsavelId, id);
    response.status(204).end();
  });

  router.put('/:id/configuracao', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    const configuracao = configuracaoSchema.parse(request.body);
    response.json(await service.updateConfiguracao(response.locals.responsavelId, id, configuracao));
  });

  router.put('/:id/configuracao/padrao', async (request, response) => {
    const { id } = criancaIdSchema.parse(request.params);
    response.json(await service.restoreDefaultConfiguracao(response.locals.responsavelId, id));
  });

  return router;
}
