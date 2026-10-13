import { AppError } from '../errors/AppError';
import type { CriancaRepository } from '../repositories/criancaRepository';

export async function ensureChildBelongsTo(
  criancas: CriancaRepository,
  responsavelId: string,
  criancaId: string,
): Promise<void> {
  if (!(await criancas.findById(responsavelId, criancaId))) {
    throw new AppError(404, 'Criança não encontrada');
  }
}
