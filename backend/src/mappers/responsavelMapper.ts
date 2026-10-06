import type { Responsavel } from '../repositories/responsavelRepository';

export function toPublicResponsavel(responsavel: Responsavel) {
  return {
    id: responsavel.id,
    nome: responsavel.nome,
    email: responsavel.email,
    pinCadastrado: responsavel.pin_hash !== null,
    criadoEm: responsavel.criado_em,
  };
}
