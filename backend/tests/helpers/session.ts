import type { Express } from 'express';
import request from 'supertest';

export const validRegistration = {
  nome: 'Juliana Souza',
  email: 'juliana@exemplo.com',
  senha: 'senha-segura-123',
};

export async function registerAndLogin(app: Express) {
  await request(app).post('/auth/cadastro').send(validRegistration);
  const response = await request(app)
    .post('/auth/login')
    .send({ email: validRegistration.email, senha: validRegistration.senha });
  return response.body as { token: string; responsavel: { id: string } };
}
