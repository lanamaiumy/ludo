import type { CriancaRepository } from '../repositories/criancaRepository';
import type { SessaoRepository } from '../repositories/sessaoRepository';
import type { SessaoInput } from '../validators/sessaoSchemas';
import { ensureChildBelongsTo } from './criancaAccess';

export function createSessaoService(criancas: CriancaRepository, sessoes: SessaoRepository) {
  return {
    async register(responsavelId: string, criancaId: string, { dataSessao, concluida }: SessaoInput) {
      await ensureChildBelongsTo(criancas, responsavelId, criancaId);
      const sessao = await sessoes.create(criancaId, dataSessao, concluida);
      return { id: sessao.id, dataSessao: sessao.data_sessao, concluida: sessao.concluida };
    },

    async week(responsavelId: string, criancaId: string, inicio: string) {
      await ensureChildBelongsTo(criancas, responsavelId, criancaId);
      const dias = await sessoes.summarizeWeek(criancaId, inicio);
      return {
        inicio,
        dias: dias.map((dia) => ({ ...dia, utilizado: dia.sessoes > 0 })),
      };
    },
  };
}

export type SessaoService = ReturnType<typeof createSessaoService>;
