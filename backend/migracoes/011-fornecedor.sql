-- Spec 020: fornecedor, fornecedor do material, histórico de custo e data da última atualização do preço
-- (RF16, RF49–RF52, D034). Idempotente: o migrador reaplica todos os arquivos a cada execução.
CREATE TABLE IF NOT EXISTS fornecedor (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  telefone VARCHAR(30),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (marcenaria_id, nome)
);

ALTER TABLE material ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES fornecedor(id);

-- Data em que o preço foi cadastrado, trocado ou confirmado. Materiais antigos partem da última atualização.
ALTER TABLE material ADD COLUMN IF NOT EXISTS custo_atualizado_em TIMESTAMPTZ;
UPDATE material SET custo_atualizado_em = atualizado_em WHERE custo_atualizado_em IS NULL;
ALTER TABLE material ALTER COLUMN custo_atualizado_em SET DEFAULT now();
ALTER TABLE material ALTER COLUMN custo_atualizado_em SET NOT NULL;

-- Uma linha a cada preço cadastrado, trocado ou confirmado (RF16). Nada é apagado.
CREATE TABLE IF NOT EXISTS material_custo_historico (
  id UUID PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES material(id),
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  custo_unitario NUMERIC(12,4) NOT NULL,
  fornecedor_id UUID REFERENCES fornecedor(id),
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS material_custo_historico_idx ON material_custo_historico (material_id, registrado_em DESC);

-- Materiais que já existiam ganham a primeira linha do histórico, uma única vez.
INSERT INTO material_custo_historico (id, material_id, marcenaria_id, custo_unitario, fornecedor_id, registrado_em)
  SELECT gen_random_uuid(), m.id, m.marcenaria_id, m.custo_unitario, m.fornecedor_id, m.custo_atualizado_em
  FROM material m
  WHERE NOT EXISTS (SELECT 1 FROM material_custo_historico h WHERE h.material_id = m.id);
