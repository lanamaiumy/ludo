import { AppError } from '../errors/AppError';
import { toPublicResponsavel } from '../mappers/responsavelMapper';
import type { ResponsavelRepository } from '../repositories/responsavelRepository';
import { compareSecret, hashSecret } from '../security/hash';
import type { RedefinirPinInput } from '../validators/pinSchemas';

export function createPinService(repository: ResponsavelRepository) {
  async function findResponsavel(id: string) {
    const responsavel = await repository.findById(id);

    if (!responsavel) {
      throw new AppError(404, 'Responsável não encontrado');
    }

    return responsavel;
  }

  return {
    async create(responsavelId: string, pin: string) {
      const responsavel = await findResponsavel(responsavelId);

      if (responsavel.pin_hash) {
        throw new AppError(409, 'O PIN já foi criado');
      }

      const updated = await repository.updatePinHash(responsavelId, await hashSecret(pin));
      return toPublicResponsavel(updated);
    },

    async verify(responsavelId: string, pin: string) {
      const responsavel = await findResponsavel(responsavelId);

      if (!responsavel.pin_hash) {
        throw new AppError(409, 'Crie o PIN antes de acessar a área restrita');
      }

      if (!(await compareSecret(pin, responsavel.pin_hash))) {
        throw new AppError(403, 'PIN incorreto');
      }
    },

    async reset(responsavelId: string, { senha, pin }: RedefinirPinInput) {
      const responsavel = await findResponsavel(responsavelId);

      if (!(await compareSecret(senha, responsavel.senha_hash))) {
        throw new AppError(403, 'Senha incorreta');
      }

      const updated = await repository.updatePinHash(responsavelId, await hashSecret(pin));
      return toPublicResponsavel(updated);
    },
  };
}

export type PinService = ReturnType<typeof createPinService>;
