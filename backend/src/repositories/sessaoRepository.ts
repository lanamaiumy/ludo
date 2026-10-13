import type { Database } from '../database/types';

export type Sessao = {
  id: string;
  data_sessao: string;
  concluida: boolean;
};

export type ResumoDoDia = {
  data: string;
  sessoes: number;
  concluidas: number;
};

export function createSessaoRepository(db: Database) {
  return {
    async create(criancaId: string, dataSessao: string, concluida: boolean): Promise<Sessao> {
      const { rows } = await db.query<Sessao>(
        `INSERT INTO historico_sessao (crianca_id, data_sessao, concluida) VALUES ($1, $2, $3)
         RETURNING id, to_char(data_sessao, 'YYYY-MM-DD') AS data_sessao, concluida`,
        [criancaId, dataSessao, concluida],
      );
      return rows[0];
    },

    async summarizeWeek(criancaId: string, inicio: string): Promise<ResumoDoDia[]> {
      const { rows } = await db.query<ResumoDoDia>(
        `SELECT to_char(dia, 'YYYY-MM-DD') AS data,
                count(h.id)::int AS sessoes,
                count(h.id) FILTER (WHERE h.concluida)::int AS concluidas
         FROM generate_series($2::date, $2::date + 6, interval '1 day') AS dia
         LEFT JOIN historico_sessao h ON h.crianca_id = $1 AND h.data_sessao = dia::date
         GROUP BY dia
         ORDER BY dia`,
        [criancaId, inicio],
      );
      return rows;
    },
  };
}

export type SessaoRepository = ReturnType<typeof createSessaoRepository>;
