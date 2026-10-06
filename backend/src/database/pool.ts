import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({ connectionString: env.databaseUrl });

pool.on('error', (error) => {
  console.error('Conexão com o banco de dados perdida', error.message);
});
