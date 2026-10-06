import { z } from 'zod';

export const criancaIdSchema = z.object({
  id: z.uuid('Identificador de criança inválido'),
});

export const criancaSchema = z.object({
  nome: z
    .string('Informe o nome da criança')
    .trim()
    .min(1, 'Informe o nome da criança')
    .max(100, 'O nome pode ter no máximo 100 caracteres'),
});

export const configuracaoSchema = z.object({
  volumeMaximo: z
    .int('O volume máximo deve ser um número inteiro')
    .min(1, 'O volume máximo deve ficar entre 1 e 100')
    .max(100, 'O volume máximo deve ficar entre 1 e 100'),
  tempoSessaoMinutos: z.union([z.literal(5), z.literal(10)], 'O tempo de sessão deve ser de 5 ou 10 minutos'),
});
