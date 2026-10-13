import type { Database } from '../database/types';

export type Progresso = {
  cenario: string;
  desbloqueado: boolean;
  concluido: boolean;
};

const COLUMNS = 'cenario, desbloqueado, concluido';

export function createProgressoRepository(db: Database) {
  async function advance(criancaId: string, cenario: string, concluido: boolean): Promise<Progresso> {
    const { rows } = await db.query<Progresso>(
      `INSERT INTO progresso_trilha (crianca_id, cenario, desbloqueado, concluido)
       VALUES ($1, $2, true, $3)
       ON CONFLICT (crianca_id, cenario) DO UPDATE
       SET desbloqueado = true,
           concluido = progresso_trilha.concluido OR EXCLUDED.concluido
       RETURNING ${COLUMNS}`,
      [criancaId, cenario, concluido],
    );
    return rows[0];
  }

  return {
    async listByCrianca(criancaId: string): Promise<Progresso[]> {
      const { rows } = await db.query<Progresso>(
        `SELECT ${COLUMNS} FROM progresso_trilha WHERE crianca_id = $1 ORDER BY cenario`,
        [criancaId],
      );
      return rows;
    },

    unlock(criancaId: string, cenario: string): Promise<Progresso> {
      return advance(criancaId, cenario, false);
    },

    complete(criancaId: string, cenario: string): Promise<Progresso> {
      return advance(criancaId, cenario, true);
    },
  };
}

export type ProgressoRepository = ReturnType<typeof createProgressoRepository>;
