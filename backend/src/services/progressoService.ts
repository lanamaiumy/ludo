import type { CriancaRepository } from '../repositories/criancaRepository';
import type { ProgressoRepository } from '../repositories/progressoRepository';
import { ensureChildBelongsTo } from './criancaAccess';

export function createProgressoService(criancas: CriancaRepository, progresso: ProgressoRepository) {
  return {
    async list(responsavelId: string, criancaId: string) {
      await ensureChildBelongsTo(criancas, responsavelId, criancaId);
      return progresso.listByCrianca(criancaId);
    },

    async unlock(responsavelId: string, criancaId: string, cenario: string) {
      await ensureChildBelongsTo(criancas, responsavelId, criancaId);
      return progresso.unlock(criancaId, cenario);
    },

    async complete(responsavelId: string, criancaId: string, cenario: string) {
      await ensureChildBelongsTo(criancas, responsavelId, criancaId);
      return progresso.complete(criancaId, cenario);
    },
  };
}

export type ProgressoService = ReturnType<typeof createProgressoService>;
