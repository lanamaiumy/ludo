import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { registerAndLogin } from './helpers/session';
import { createTestDatabase, type TestDatabase } from './helpers/testDatabase';

const JWT_SECRET = 'segredo-de-teste';
const MONDAY = '2026-10-05';

let database: TestDatabase;
let app: Express;
let token: string;

function api(method: 'get' | 'post', path: string, authToken = token) {
  return request(app)[method](path).set('Authorization', `Bearer ${authToken}`);
}

async function createCrianca(nome = 'Theo', authToken = token) {
  const response = await api('post', '/criancas', authToken).send({ nome });
  return response.body.id as string;
}

function registerSession(criancaId: string, dataSessao: string, concluida: boolean) {
  return api('post', `/criancas/${criancaId}/sessoes`).send({ dataSessao, concluida });
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

describe('POST /criancas/:id/sessoes', () => {
  it('registra a sessão no dia informado pelo aparelho', async () => {
    const criancaId = await createCrianca();

    const response = await registerSession(criancaId, MONDAY, true);

    assert.equal(response.status, 201);
    assert.equal(response.body.dataSessao, MONDAY);
    assert.equal(response.body.concluida, true);
  });

  it('recusa data inválida, data no futuro e campos ausentes', async () => {
    const criancaId = await createCrianca();
    const invalid = [
      { dataSessao: '05/10/2026', concluida: true },
      { dataSessao: '2099-01-01', concluida: true },
      { dataSessao: MONDAY },
      { concluida: true },
    ];

    for (const body of invalid) {
      const response = await api('post', `/criancas/${criancaId}/sessoes`).send(body);
      assert.equal(response.status, 400, `deveria recusar ${JSON.stringify(body)}`);
    }
  });
});

describe('GET /criancas/:id/sessoes/semana', () => {
  it('resume os sete dias a partir do início informado', async () => {
    const criancaId = await createCrianca();
    await registerSession(criancaId, MONDAY, true);
    await registerSession(criancaId, MONDAY, false);
    await registerSession(criancaId, '2026-10-07', true);
    await registerSession(criancaId, '2026-10-12', true);

    const response = await api('get', `/criancas/${criancaId}/sessoes/semana?inicio=${MONDAY}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.inicio, MONDAY);
    assert.equal(response.body.dias.length, 7);
    assert.deepEqual(response.body.dias[0], { data: MONDAY, sessoes: 2, concluidas: 1, utilizado: true });
    assert.deepEqual(response.body.dias[1], { data: '2026-10-06', sessoes: 0, concluidas: 0, utilizado: false });
    assert.equal(response.body.dias[2].utilizado, true);
    assert.equal(response.body.dias[6].data, '2026-10-11');
    assert.deepEqual(
      response.body.dias.map((dia: { utilizado: boolean }) => dia.utilizado),
      [true, false, true, false, false, false, false],
    );
  });

  it('não mistura as sessões de crianças diferentes', async () => {
    const theo = await createCrianca('Theo');
    const ana = await createCrianca('Ana');
    await registerSession(ana, MONDAY, true);

    const response = await api('get', `/criancas/${theo}/sessoes/semana?inicio=${MONDAY}`);

    assert.equal(response.body.dias[0].sessoes, 0);
  });

  it('exige o início da semana', async () => {
    const criancaId = await createCrianca();

    const response = await api('get', `/criancas/${criancaId}/sessoes/semana`);

    assert.equal(response.status, 400);
  });
});

describe('acesso por dono', () => {
  it('trata a criança de outra família como inexistente', async () => {
    const criancaId = await createCrianca();
    const { token: otherToken } = await registerAndLogin(app, 'outra@exemplo.com');

    const register = await api('post', `/criancas/${criancaId}/sessoes`, otherToken)
      .send({ dataSessao: MONDAY, concluida: true });
    const week = await api('get', `/criancas/${criancaId}/sessoes/semana?inicio=${MONDAY}`, otherToken);

    assert.equal(register.status, 404);
    assert.equal(week.status, 404);
  });

  it('exige o token de acesso', async () => {
    const criancaId = await createCrianca();

    const response = await request(app).get(`/criancas/${criancaId}/sessoes/semana?inicio=${MONDAY}`);

    assert.equal(response.status, 401);
  });
});
