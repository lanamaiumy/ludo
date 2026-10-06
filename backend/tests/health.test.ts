import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import type { Database } from '../src/database/types';

function appWithDatabase(query: () => Promise<unknown>) {
  const db = { query } as unknown as Database;
  return createApp({ db, jwtSecret: 'segredo-de-teste' });
}

describe('GET /health', () => {
  it('responde 200 quando o banco está acessível', async () => {
    const app = appWithDatabase(async () => ({ rows: [] }));

    const response = await request(app).get('/health');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok', banco: 'conectado' });
  });

  it('responde 503 quando o banco não responde', async () => {
    const app = appWithDatabase(async () => {
      throw new Error('conexão recusada');
    });

    const response = await request(app).get('/health');

    assert.equal(response.status, 503);
    assert.deepEqual(response.body, { status: 'indisponivel', banco: 'desconectado' });
  });
});

describe('tratamento de erros', () => {
  const app = appWithDatabase(async () => ({ rows: [] }));

  it('responde 404 para rota inexistente', async () => {
    const response = await request(app).get('/rota-que-nao-existe');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { mensagem: 'Rota não encontrada' });
  });

  it('responde 400 para JSON malformado sem expor detalhes', async () => {
    const response = await request(app)
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { mensagem: 'Requisição inválida' });
  });
});
