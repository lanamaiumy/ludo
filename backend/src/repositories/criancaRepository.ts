import type { Database } from '../database/types';

export type Crianca = {
  id: string;
  nome: string;
  criado_em: Date;
  volume_maximo: number;
  tempo_sessao_minutos: number;
  atualizado_em: Date;
};

export type ConfiguracaoInput = {
  volumeMaximo: number;
  tempoSessaoMinutos: number;
};

const SELECT_WITH_CONFIGURACAO = `
  SELECT c.id, c.nome, c.criado_em, cfg.volume_maximo, cfg.tempo_sessao_minutos, cfg.atualizado_em
  FROM crianca c
  JOIN configuracao cfg ON cfg.crianca_id = c.id`;

export function createCriancaRepository(db: Database) {
  async function findById(responsavelId: string, id: string): Promise<Crianca | null> {
    const { rows } = await db.query<Crianca>(
      `${SELECT_WITH_CONFIGURACAO} WHERE c.id = $1 AND c.responsavel_id = $2`,
      [id, responsavelId],
    );
    return rows[0] ?? null;
  }

  async function findAfterUpdate(responsavelId: string, id: string, updatedRows: unknown[]) {
    return updatedRows.length > 0 ? findById(responsavelId, id) : null;
  }

  return {
    findById,

    async listByResponsavel(responsavelId: string): Promise<Crianca[]> {
      const { rows } = await db.query<Crianca>(
        `${SELECT_WITH_CONFIGURACAO} WHERE c.responsavel_id = $1 ORDER BY c.criado_em`,
        [responsavelId],
      );
      return rows;
    },

    async create(responsavelId: string, nome: string): Promise<Crianca> {
      const { rows } = await db.query<Crianca>(
        `WITH nova AS (
           INSERT INTO crianca (responsavel_id, nome) VALUES ($1, $2)
           RETURNING id, nome, criado_em
         ), cfg AS (
           INSERT INTO configuracao (crianca_id) SELECT id FROM nova
           RETURNING volume_maximo, tempo_sessao_minutos, atualizado_em
         )
         SELECT nova.id, nova.nome, nova.criado_em, cfg.volume_maximo, cfg.tempo_sessao_minutos, cfg.atualizado_em
         FROM nova, cfg`,
        [responsavelId, nome],
      );
      return rows[0];
    },

    async rename(responsavelId: string, id: string, nome: string): Promise<Crianca | null> {
      const { rows } = await db.query(
        'UPDATE crianca SET nome = $3 WHERE id = $1 AND responsavel_id = $2 RETURNING id',
        [id, responsavelId, nome],
      );
      return findAfterUpdate(responsavelId, id, rows);
    },

    async remove(responsavelId: string, id: string): Promise<boolean> {
      const { rows } = await db.query(
        'DELETE FROM crianca WHERE id = $1 AND responsavel_id = $2 RETURNING id',
        [id, responsavelId],
      );
      return rows.length > 0;
    },

    async updateConfiguracao(
      responsavelId: string,
      id: string,
      { volumeMaximo, tempoSessaoMinutos }: ConfiguracaoInput,
    ): Promise<Crianca | null> {
      const { rows } = await db.query(
        `UPDATE configuracao cfg
         SET volume_maximo = $3, tempo_sessao_minutos = $4, atualizado_em = now()
         FROM crianca c
         WHERE cfg.crianca_id = c.id AND c.id = $1 AND c.responsavel_id = $2
         RETURNING cfg.crianca_id`,
        [id, responsavelId, volumeMaximo, tempoSessaoMinutos],
      );
      return findAfterUpdate(responsavelId, id, rows);
    },

    async restoreDefaultConfiguracao(responsavelId: string, id: string): Promise<Crianca | null> {
      const { rows } = await db.query(
        `UPDATE configuracao cfg
         SET volume_maximo = DEFAULT, tempo_sessao_minutos = DEFAULT, atualizado_em = now()
         FROM crianca c
         WHERE cfg.crianca_id = c.id AND c.id = $1 AND c.responsavel_id = $2
         RETURNING cfg.crianca_id`,
        [id, responsavelId],
      );
      return findAfterUpdate(responsavelId, id, rows);
    },
  };
}

export type CriancaRepository = ReturnType<typeof createCriancaRepository>;
