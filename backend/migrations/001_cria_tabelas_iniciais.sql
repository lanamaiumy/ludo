CREATE TABLE responsavel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE crianca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsavel_id UUID NOT NULL REFERENCES responsavel (id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_crianca_responsavel ON crianca (responsavel_id);

CREATE TABLE configuracao (
  crianca_id UUID PRIMARY KEY REFERENCES crianca (id) ON DELETE CASCADE,
  volume_maximo INT NOT NULL CHECK (volume_maximo BETWEEN 1 AND 100),
  tempo_sessao_minutos INT NOT NULL CHECK (tempo_sessao_minutos IN (5, 10)),
  atualizado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE historico_sessao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id UUID NOT NULL REFERENCES crianca (id) ON DELETE CASCADE,
  data_sessao DATE NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_historico_sessao_crianca_data ON historico_sessao (crianca_id, data_sessao);

CREATE TABLE progresso_trilha (
  crianca_id UUID NOT NULL REFERENCES crianca (id) ON DELETE CASCADE,
  cenario VARCHAR(50) NOT NULL,
  desbloqueado BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (crianca_id, cenario)
);
