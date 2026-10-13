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

function api(method: 'get' | 'post', path: string, authToken = token) {
  return request(app)[method](path).set('Authorization', `Bearer ${authToken}`);
}

async function createCrianca(nome = 'Theo', authToken = token) {
  const response = await api('post', '/criancas', authToken).send({ nome });
  return response.body.id as string;
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

describe('GET /criancas/:id/progresso', () => {
  it('começa vazio para uma criança nova', async () => {
    const criancaId = await createCrianca();

    const response = await api('get', `/criancas/${criancaId}/progresso`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, []);
  });
});

describe('desbloqueio e conclusão', () => {
  it('desbloqueia um cenário sem concluí-lo', async () => {
    const criancaId = await createCrianca();

    const response = await api('post', `/criancas/${criancaId}/progresso/sala/desbloqueio`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { cenario: 'sala', desbloqueado: true, concluido: false });
  });

  it('concluir também desbloqueia o cenário', async () => {
    const criancaId = await createCrianca();

    const response = await api('post', `/criancas/${criancaId}/progresso/quarto/conclusao`);

    assert.deepEqual(response.body, { cenario: 'quarto', desbloqueado: true, concluido: true });
  });

  it('nunca desfaz uma conclusão ao desbloquear de novo', async () => {
    const criancaId = await createCrianca();
    await api('post', `/criancas/${criancaId}/progresso/sala/conclusao`);

    const response = await api('post', `/criancas/${criancaId}/progresso/sala/desbloqueio`);

    assert.equal(response.body.concluido, true);
  });

  it('lista o avanço guardado, um registro por cenário', async () => {
    const criancaId = await createCrianca();
    await api('post', `/criancas/${criancaId}/progresso/quarto/conclusao`);
    await api('post', `/criancas/${criancaId}/progresso/quarto/conclusao`);
    await api('post', `/criancas/${criancaId}/progresso/sala/desbloqueio`);

    const response = await api('get', `/criancas/${criancaId}/progresso`);

    assert.deepEqual(response.body, [
      { cenario: 'quarto', desbloqueado: true, concluido: true },
      { cenario: 'sala', desbloqueado: true, concluido: false },
    ]);
  });

  it('recusa identificador de cenário fora do padrão', async () => {
    const criancaId = await createCrianca();

    for (const cenario of ['Sala', 'sala%20de%20estar', 'x'.repeat(51)]) {
      const response = await api('post', `/criancas/${criancaId}/progresso/${cenario}/conclusao`);
      assert.equal(response.status, 400, `deveria recusar "${cenario}"`);
    }
  });

  it('separa o progresso de cada criança', async () => {
    const theo = await createCrianca('Theo');
    const ana = await createCrianca('Ana');
    await api('post', `/criancas/${ana}/progresso/quarto/conclusao`);

    const response = await api('get', `/criancas/${theo}/progresso`);

    assert.deepEqual(response.body, []);
  });
});

describe('regras do banco', () => {
  it('não aceita cenário concluído sem estar desbloqueado', async () => {
    const criancaId = await createCrianca();

    await assert.rejects(
      database.query(
        'INSERT INTO progresso_trilha (crianca_id, cenario, desbloqueado, concluido) VALUES ($1, $2, false, true)',
        [criancaId, 'parque'],
      ),
      /progresso_trilha_conclusao_exige_desbloqueio/,
    );
  });
});

describe('acesso por dono', () => {
  it('trata a criança de outra família como inexistente', async () => {
    const criancaId = await createCrianca();
    const { token: otherToken } = await registerAndLogin(app, 'outra@exemplo.com');

    const list = await api('get', `/criancas/${criancaId}/progresso`, otherToken);
    const complete = await api('post', `/criancas/${criancaId}/progresso/quarto/conclusao`, otherToken);

    assert.equal(list.status, 404);
    assert.equal(complete.status, 404);
  });

  it('exige o token de acesso', async () => {
    const criancaId = await createCrianca();

    const response = await request(app).get(`/criancas/${criancaId}/progresso`);

    assert.equal(response.status, 401);
  });
});
