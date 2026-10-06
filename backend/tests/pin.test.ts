import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { registerAndLogin, validRegistration } from './helpers/session';
import { createTestDatabase, type TestDatabase } from './helpers/testDatabase';

const JWT_SECRET = 'segredo-de-teste';

let database: TestDatabase;
let app: Express;
let token: string;

function createPin(pin: string) {
  return request(app).post('/auth/pin').set('Authorization', `Bearer ${token}`).send({ pin });
}

function verifyPin(pin: string) {
  return request(app).post('/auth/pin/verificar').set('Authorization', `Bearer ${token}`).send({ pin });
}

function resetPin(senha: string, pin: string) {
  return request(app).put('/auth/pin').set('Authorization', `Bearer ${token}`).send({ senha, pin });
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

describe('POST /auth/pin', () => {
  it('cria o PIN e guarda apenas o hash', async () => {
    const response = await createPin('2580');

    assert.equal(response.status, 201);
    assert.equal(response.body.pinCadastrado, true);

    const { rows } = await database.query<{ pin_hash: string }>(
      'SELECT pin_hash FROM responsavel WHERE email = $1',
      [validRegistration.email],
    );
    assert.notEqual(rows[0].pin_hash, '2580');
    assert.match(rows[0].pin_hash, /^\$2[aby]\$10\$/);
  });

  it('não deixa criar o PIN de novo', async () => {
    await createPin('2580');

    const response = await createPin('1111');

    assert.equal(response.status, 409);
    assert.equal((await verifyPin('2580')).status, 204);
  });

  it('aceita apenas 4 números', async () => {
    for (const pin of ['123', '12345', '12a4', ' 1234']) {
      const response = await createPin(pin);
      assert.equal(response.status, 400, `PIN "${pin}" deveria ser recusado`);
    }
  });

  it('exige o token de acesso', async () => {
    const response = await request(app).post('/auth/pin').send({ pin: '2580' });

    assert.equal(response.status, 401);
  });
});

describe('POST /auth/pin/verificar', () => {
  it('libera com o PIN certo e recusa o errado', async () => {
    await createPin('2580');

    assert.equal((await verifyPin('2580')).status, 204);

    const wrong = await verifyPin('0000');
    assert.equal(wrong.status, 403);
    assert.deepEqual(wrong.body, { mensagem: 'PIN incorreto' });
  });

  it('avisa quando o PIN ainda não foi criado', async () => {
    const response = await verifyPin('2580');

    assert.equal(response.status, 409);
  });

  it('bloqueia depois de 5 erros, mesmo com o PIN certo', async () => {
    await createPin('2580');

    for (let i = 0; i < 5; i++) {
      await verifyPin('0000');
    }

    assert.equal((await verifyPin('2580')).status, 429);
  });

  it('não conta os acertos no limite de tentativas', async () => {
    await createPin('2580');

    for (let i = 0; i < 6; i++) {
      assert.equal((await verifyPin('2580')).status, 204);
    }
  });
});

describe('PUT /auth/pin', () => {
  it('troca o PIN quando a senha da conta confere', async () => {
    await createPin('2580');

    const response = await resetPin(validRegistration.senha, '7391');

    assert.equal(response.status, 200);
    assert.equal((await verifyPin('7391')).status, 204);
    assert.equal((await verifyPin('2580')).status, 403);
  });

  it('mantém o PIN antigo quando a senha está errada', async () => {
    await createPin('2580');

    const response = await resetPin('senha-errada', '7391');

    assert.equal(response.status, 403);
    assert.equal((await verifyPin('2580')).status, 204);
  });
});
