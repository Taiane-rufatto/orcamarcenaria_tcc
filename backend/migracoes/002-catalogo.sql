CREATE TABLE IF NOT EXISTS material (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  descricao VARCHAR(300),
  unidade VARCHAR(3) NOT NULL CHECK (unidade IN ('un','m','m²','ml','ch','kg','L','pç')),
  custo_unitario NUMERIC(12,4) NOT NULL CHECK (custo_unitario > 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(), atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (marcenaria_id, nome)
);
CREATE TABLE IF NOT EXISTS servico (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0), descricao VARCHAR(300),
  tipo_cobranca VARCHAR(8) NOT NULL CHECK (tipo_cobranca IN ('hora','unidade')),
  valor_unitario NUMERIC(12,4) NOT NULL CHECK (valor_unitario > 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(), atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (marcenaria_id, nome)
);
