import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './pool';

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'migrations');

async function listPendingMigrations(): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migracoes (
      nome VARCHAR(255) PRIMARY KEY,
      aplicada_em TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query<{ nome: string }>('SELECT nome FROM migracoes');
  const applied = new Set(rows.map((row) => row.nome));
  const files = await readdir(MIGRATIONS_DIR);

  return files
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();
}

async function applyMigration(file: string): Promise<void> {
  const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf-8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migracoes (nome) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log(`Migração aplicada: ${file}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrate(): Promise<void> {
  const pending = await listPendingMigrations();

  for (const file of pending) {
    await applyMigration(file);
  }

  console.log(pending.length > 0 ? 'Banco de dados atualizado' : 'Nenhuma migração pendente');
}

migrate()
  .catch((error) => {
    console.error('Falha ao aplicar as migrações', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
