import { z } from 'zod';

const pin = z.string('Informe o PIN').regex(/^\d{4}$/, 'O PIN deve ter exatamente 4 números');

export const pinSchema = z.object({ pin });

export const redefinirPinSchema = z.object({
  senha: z.string('Informe a senha').min(1, 'Informe a senha'),
  pin,
});

export type RedefinirPinInput = z.infer<typeof redefinirPinSchema>;
