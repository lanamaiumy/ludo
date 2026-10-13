import { z } from 'zod';
import { criancaIdSchema } from './criancaSchemas';

export const cenarioParamsSchema = criancaIdSchema.extend({
  cenario: z
    .string()
    .regex(/^[a-z0-9-]{1,50}$/, 'Use o identificador do cenário, em letras minúsculas, números ou hífen'),
});
