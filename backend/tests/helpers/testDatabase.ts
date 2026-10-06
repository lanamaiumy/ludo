import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import type { Database } from '../../src/database/types';

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'migrations');

export async function createTestDatabase() {
  const pglite = new PGlite();
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    await pglite.exec(await readFile(path.join(MIGRATIONS_DIR, file), 'utf-8'));
  }

  return {
    db: pglite as unknown as Database,
    query: <T>(sql: string, params?: unknown[]) => pglite.query<T>(sql, params),
    reset: () => pglite.exec('TRUNCATE responsavel CASCADE'),
    close: () => pglite.close(),
  };
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;
