import { z } from 'zod';

const email = z
  .string('Informe o e-mail')
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido').max(150, 'O e-mail pode ter no máximo 150 caracteres'));

export const cadastroSchema = z.object({
  nome: z
    .string('Informe o nome')
    .trim()
    .min(2, 'Informe o nome')
    .max(100, 'O nome pode ter no máximo 100 caracteres'),
  email,
  senha: z
    .string('Informe a senha')
    .min(8, 'A senha precisa ter pelo menos 8 caracteres')
    .max(72, 'A senha pode ter no máximo 72 caracteres'),
});

export const loginSchema = z.object({
  email,
  senha: z.string('Informe a senha').min(1, 'Informe a senha'),
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
