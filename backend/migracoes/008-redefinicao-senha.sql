-- Recuperação de senha por e-mail (RF07, D028). Guarda só o hash SHA-256 do token enviado no link:
-- quem lê o banco não consegue usar o link. Cada pedido vale 1 hora e uma vez só.
CREATE TABLE IF NOT EXISTS redefinicao_senha (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuario(id),
  token_hash TEXT NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  usada_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS redefinicao_senha_usuario_idx ON redefinicao_senha (usuario_id, criado_em);
