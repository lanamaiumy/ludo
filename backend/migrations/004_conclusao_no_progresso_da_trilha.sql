ALTER TABLE progresso_trilha
  ADD COLUMN concluido BOOLEAN NOT NULL DEFAULT false,
  ADD CONSTRAINT progresso_trilha_conclusao_exige_desbloqueio CHECK (desbloqueado OR NOT concluido);
