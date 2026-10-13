import { z } from 'zod';

const ONE_DAY = 24 * 60 * 60 * 1000;

function tomorrow(): string {
  return new Date(Date.now() + ONE_DAY).toISOString().slice(0, 10);
}

const isoDate = z.iso.date('Use uma data no formato AAAA-MM-DD');

export const sessaoSchema = z.object({
  dataSessao: isoDate.refine((value) => value <= tomorrow(), 'A data da sessão não pode estar no futuro'),
  concluida: z.boolean('Informe se a sessão foi concluída'),
});

export const semanaQuerySchema = z.object({
  inicio: isoDate,
});

export type SessaoInput = z.infer<typeof sessaoSchema>;
