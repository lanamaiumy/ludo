import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { registerAndLogin } from './helpers/session';
import { createTestDatabase, type TestDatabase } from './helpers/testDatabase';

const JWT_SECRET = 'segredo-de-teste';

let database: TestDatabase;
let app: Express;
let token: string;

function api(method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string, authToken = token) {
  return request(app)[method](path).set('Authorization', `Bearer ${authToken}`);
}

async function createCrianca(nome = 'Theo', authToken = token) {
  const response = await api('post', '/criancas', authToken).send({ nome });
  return response.body as { id: string };
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
  ({ token } = await registerAndLogin(app));
});

describe('POST /criancas', () => {
  it('cria a criança já com a configuração padrão', async () => {
    const response = await api('post', '/criancas').send({ nome: '  Theo ' });

    assert.equal(response.status, 201);
    assert.equal(response.body.nome, 'Theo');
    assert.equal(response.body.configuracao.volumeMaximo, 50);
    assert.equal(response.body.configuracao.tempoSessaoMinutos, 5);
  });

  it('exige o nome', async () => {
    const response = await api('post', '/criancas').send({ nome: '   ' });

    assert.equal(response.status, 400);
    assert.ok(response.body.erros.nome);
  });

  it('exige o token de acesso', async () => {
    const response = await request(app).post('/criancas').send({ nome: 'Theo' });

    assert.equal(response.status, 401);
  });
});

describe('GET /criancas', () => {
  it('lista apenas as crianças do responsável logado', async () => {
    await createCrianca('Theo');
    await createCrianca('Ana');
    const { token: otherToken } = await registerAndLogin(app, 'outra@exemplo.com');
    await createCrianca('Pedro', otherToken);

    const response = await api('get', '/criancas');

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.map((crianca: { nome: string }) => crianca.nome),
      ['Theo', 'Ana'],
    );
  });
});

describe('acesso por dono', () => {
  it('trata a criança de outra família como inexistente', async () => {
    const crianca = await createCrianca('Theo');
    const { token: otherToken } = await registerAndLogin(app, 'outra@exemplo.com');

    const attempts = [
      api('get', `/criancas/${crianca.id}`, otherToken),
      api('patch', `/criancas/${crianca.id}`, otherToken).send({ nome: 'Invasor' }),
      api('put', `/criancas/${crianca.id}/configuracao`, otherToken).send({ volumeMaximo: 100, tempoSessaoMinutos: 10 }),
      api('delete', `/criancas/${crianca.id}`, otherToken),
    ];

    for (const response of await Promise.all(attempts)) {
      assert.equal(response.status, 404);
    }

    const own = await api('get', `/criancas/${crianca.id}`);
    assert.equal(own.body.nome, 'Theo');
    assert.equal(own.body.configuracao.volumeMaximo, 50);
  });

  it('recusa identificador que não é UUID', async () => {
    const response = await api('get', '/criancas/123');

    assert.equal(response.status, 400);
  });
});

describe('PATCH e DELETE /criancas/:id', () => {
  it('renomeia a criança', async () => {
    const crianca = await createCrianca('Theo');

    const response = await api('patch', `/criancas/${crianca.id}`).send({ nome: 'Theodoro' });

    assert.equal(response.status, 200);
    assert.equal(response.body.nome, 'Theodoro');
  });

  it('remove a criança junto com a configuração', async () => {
    const crianca = await createCrianca('Theo');

    const response = await api('delete', `/criancas/${crianca.id}`);

    assert.equal(response.status, 204);
    const { rows } = await database.query('SELECT 1 FROM configuracao WHERE crianca_id = $1', [crianca.id]);
    assert.equal(rows.length, 0);
  });
});

describe('PUT /criancas/:id/configuracao', () => {
  it('atualiza volume máximo e tempo de sessão', async () => {
    const crianca = await createCrianca();

    const response = await api('put', `/criancas/${crianca.id}/configuracao`)
      .send({ volumeMaximo: 30, tempoSessaoMinutos: 10 });

    assert.equal(response.status, 200);
    assert.equal(response.body.configuracao.volumeMaximo, 30);
    assert.equal(response.body.configuracao.tempoSessaoMinutos, 10);
  });

  it('recusa valores fora das regras do projeto', async () => {
    const crianca = await createCrianca();
    const invalid = [
      { volumeMaximo: 0, tempoSessaoMinutos: 5 },
      { volumeMaximo: 101, tempoSessaoMinutos: 5 },
      { volumeMaximo: 40.5, tempoSessaoMinutos: 5 },
      { volumeMaximo: 40, tempoSessaoMinutos: 7 },
      { volumeMaximo: 40 },
    ];

    for (const body of invalid) {
      const response = await api('put', `/criancas/${crianca.id}/configuracao`).send(body);
      assert.equal(response.status, 400, `deveria recusar ${JSON.stringify(body)}`);
    }
  });

  it('volta para a configuração padrão', async () => {
    const crianca = await createCrianca();
    await api('put', `/criancas/${crianca.id}/configuracao`).send({ volumeMaximo: 90, tempoSessaoMinutos: 10 });

    const response = await api('put', `/criancas/${crianca.id}/configuracao/padrao`);

    assert.equal(response.status, 200);
    assert.equal(response.body.configuracao.volumeMaximo, 50);
    assert.equal(response.body.configuracao.tempoSessaoMinutos, 5);
  });
});
