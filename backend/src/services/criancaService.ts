import { AppError } from '../errors/AppError';
import { toPublicCrianca } from '../mappers/criancaMapper';
import type { ConfiguracaoInput, Crianca, CriancaRepository } from '../repositories/criancaRepository';

function ensureFound(crianca: Crianca | null) {
  if (!crianca) {
    throw new AppError(404, 'Criança não encontrada');
  }
  return toPublicCrianca(crianca);
}

export function createCriancaService(repository: CriancaRepository) {
  return {
    async list(responsavelId: string) {
      const criancas = await repository.listByResponsavel(responsavelId);
      return criancas.map(toPublicCrianca);
    },

    async get(responsavelId: string, id: string) {
      return ensureFound(await repository.findById(responsavelId, id));
    },

    async create(responsavelId: string, nome: string) {
      return toPublicCrianca(await repository.create(responsavelId, nome));
    },

    async rename(responsavelId: string, id: string, nome: string) {
      return ensureFound(await repository.rename(responsavelId, id, nome));
    },

    async remove(responsavelId: string, id: string) {
      if (!(await repository.remove(responsavelId, id))) {
        throw new AppError(404, 'Criança não encontrada');
      }
    },

    async updateConfiguracao(responsavelId: string, id: string, configuracao: ConfiguracaoInput) {
      return ensureFound(await repository.updateConfiguracao(responsavelId, id, configuracao));
    },

    async restoreDefaultConfiguracao(responsavelId: string, id: string) {
      return ensureFound(await repository.restoreDefaultConfiguracao(responsavelId, id));
    },
  };
}

export type CriancaService = ReturnType<typeof createCriancaService>;
