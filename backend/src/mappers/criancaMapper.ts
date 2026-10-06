import type { Crianca } from '../repositories/criancaRepository';

export function toPublicCrianca(crianca: Crianca) {
  return {
    id: crianca.id,
    nome: crianca.nome,
    criadoEm: crianca.criado_em,
    configuracao: {
      volumeMaximo: crianca.volume_maximo,
      tempoSessaoMinutos: crianca.tempo_sessao_minutos,
      atualizadoEm: crianca.atualizado_em,
    },
  };
}
