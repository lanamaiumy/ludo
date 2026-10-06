import type { Database } from '../database/types';

export type Responsavel = {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  pin_hash: string | null;
  criado_em: Date;
};

type NewResponsavel = {
  nome: string;
  email: string;
  senhaHash: string;
};

const COLUMNS = 'id, nome, email, senha_hash, pin_hash, criado_em';

export function createResponsavelRepository(db: Database) {
  return {
    async findByEmail(email: string): Promise<Responsavel | null> {
      const { rows } = await db.query<Responsavel>(
        `SELECT ${COLUMNS} FROM responsavel WHERE email = $1`,
        [email],
      );
      return rows[0] ?? null;
    },

    async findById(id: string): Promise<Responsavel | null> {
      const { rows } = await db.query<Responsavel>(
        `SELECT ${COLUMNS} FROM responsavel WHERE id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },

    async create({ nome, email, senhaHash }: NewResponsavel): Promise<Responsavel> {
      const { rows } = await db.query<Responsavel>(
        `INSERT INTO responsavel (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
        [nome, email, senhaHash],
      );
      return rows[0];
    },

    async updatePinHash(id: string, pinHash: string): Promise<Responsavel> {
      const { rows } = await db.query<Responsavel>(
        `UPDATE responsavel SET pin_hash = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, pinHash],
      );
      return rows[0];
    },
  };
}

export type ResponsavelRepository = ReturnType<typeof createResponsavelRepository>;
