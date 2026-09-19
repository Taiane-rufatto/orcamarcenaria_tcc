CREATE TABLE IF NOT EXISTS marcenaria (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  responsavel TEXT NOT NULL CHECK (length(trim(responsavel)) > 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL UNIQUE REFERENCES marcenaria(id),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessao (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuario(id),
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  expira_em TIMESTAMPTZ NOT NULL,
  encerrada_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expira_em > criado_em)
);

CREATE INDEX IF NOT EXISTS sessao_usuario_ativa_idx
  ON sessao (usuario_id, expira_em)
  WHERE encerrada_em IS NULL;
