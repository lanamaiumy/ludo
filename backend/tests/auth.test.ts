import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { createTestDatabase, type TestDatabase } from './helpers/testDatabase';

const JWT_SECRET = 'segredo-de-teste';
const validRegistration = {
  nome: 'Juliana Souza',
  email: 'juliana@exemplo.com',
  senha: 'senha-segura-123',
};

let database: TestDatabase;
let app: Express;

async function registerAndLogin() {
  await request(app).post('/auth/cadastro').send(validRegistration);
  const response = await request(app)
    .post('/auth/login')
    .send({ email: validRegistration.email, senha: validRegistration.senha });
  return response.body as { token: string; responsavel: { id: string } };
}

before(async () => {
  database = await createTestDatabase();
});

after(async () => {
  await database.close();
});

beforeEach(async () => {
  await database.reset();
  app = createApp({ db: database.db, jwtSecret: JWT_SECRET });
});

describe('POST /auth/cadastro', () => {
  it('cria o responsável sem PIN e não devolve a senha', async () => {
    const response = await request(app).post('/auth/cadastro').send(validRegistration);

    assert.equal(response.status, 201);
    assert.equal(response.body.nome, 'Juliana Souza');
    assert.equal(response.body.email, 'juliana@exemplo.com');
    assert.equal(response.body.pinCadastrado, false);
    assert.equal('senha' in response.body, false);
    assert.equal('senha_hash' in response.body, false);
  });

  it('guarda a senha apenas como hash', async () => {
    await request(app).post('/auth/cadastro').send(validRegistration);

    const { rows } = await database.query<{ senha_hash: string }>(
      'SELECT senha_hash FROM responsavel WHERE email = $1',
      [validRegistration.email],
    );

    assert.notEqual(rows[0].senha_hash, validRegistration.senha);
    assert.match(rows[0].senha_hash, /^\$2[aby]\$10\$/);
  });

  it('normaliza o e-mail e recusa cadastro repetido', async () => {
    await request(app).post('/auth/cadastro').send(validRegistration);

    const response = await request(app)
      .post('/auth/cadastro')
      .send({ ...validRegistration, email: '  JULIANA@Exemplo.com ' });

    assert.equal(response.status, 409);
    assert.deepEqual(response.body, { mensagem: 'Este e-mail já está cadastrado' });
  });

  it('recusa dados inválidos apontando cada campo', async () => {
    const response = await request(app)
      .post('/auth/cadastro')
      .send({ nome: ' ', email: 'nao-e-email', senha: '123' });

    assert.equal(response.status, 400);
    assert.equal(response.body.mensagem, 'Dados inválidos');
    assert.deepEqual(Object.keys(response.body.erros).sort(), ['email', 'nome', 'senha']);
  });
});

describe('POST /auth/login', () => {
  it('devolve um token assinado para o responsável', async () => {
    const { token, responsavel } = await registerAndLogin();

    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    assert.equal(payload.sub, responsavel.id);
    assert.ok(payload.exp);
  });

  it('usa a mesma resposta para senha errada e e-mail inexistente', async () => {
    await request(app).post('/auth/cadastro').send(validRegistration);

    const wrongPassword = await request(app)
      .post('/auth/login')
      .send({ email: validRegistration.email, senha: 'senha-errada' });
    const unknownEmail = await request(app)
      .post('/auth/login')
      .send({ email: 'ninguem@exemplo.com', senha: 'senha-errada' });

    assert.equal(wrongPassword.status, 401);
    assert.deepEqual(wrongPassword.body, unknownEmail.body);
    assert.equal(unknownEmail.status, 401);
  });

  it('bloqueia novas tentativas depois de 10 em sequência', async () => {
    const attempt = () =>
      request(app).post('/auth/login').send({ email: 'ninguem@exemplo.com', senha: 'qualquer' });

    for (let i = 0; i < 10; i++) {
      await attempt();
    }
    const response = await attempt();

    assert.equal(response.status, 429);
  });
});

describe('GET /auth/perfil', () => {
  it('devolve o responsável dono do token', async () => {
    const { token } = await registerAndLogin();

    const response = await request(app).get('/auth/perfil').set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.email, validRegistration.email);
    assert.equal(response.body.pinCadastrado, false);
  });

  it('exige o token de acesso', async () => {
    const response = await request(app).get('/auth/perfil');

    assert.equal(response.status, 401);
  });

  it('recusa token assinado com outro segredo ou expirado', async () => {
    const { responsavel } = await registerAndLogin();
    const forged = jwt.sign({}, 'outro-segredo', { subject: responsavel.id });
    const expired = jwt.sign({}, JWT_SECRET, { subject: responsavel.id, expiresIn: -10 });

    for (const token of [forged, expired]) {
      const response = await request(app).get('/auth/perfil').set('Authorization', `Bearer ${token}`);
      assert.equal(response.status, 401);
    }
  });
});
