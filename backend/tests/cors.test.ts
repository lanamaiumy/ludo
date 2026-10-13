import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import type { Database } from '../src/database/types';

const db = { query: async () => ({ rows: [] }) } as unknown as Database;
const app = createApp({ db, jwtSecret: 'segredo-de-teste', corsOrigins: ['http://localhost:8081'] });

describe('CORS', () => {
  it('libera a origem do app web configurada', async () => {
    const response = await request(app).get('/health').set('Origin', 'http://localhost:8081');

    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:8081');
  });

  it('não libera origens que não estão na lista', async () => {
    const response = await request(app).get('/health').set('Origin', 'http://site-qualquer.com');

    assert.equal(response.headers['access-control-allow-origin'], undefined);
  });

  it('responde à verificação prévia do navegador com o cabeçalho de autorização', async () => {
    const response = await request(app)
      .options('/criancas')
      .set('Origin', 'http://localhost:8081')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    assert.equal(response.status, 204);
    assert.match(String(response.headers['access-control-allow-headers']), /authorization/i);
  });
});
