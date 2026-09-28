-- Spec 003: orçamento em rascunho, seus itens e custos adicionais (arquitetura.md §5.1).
-- Ajustes do 003: cliente em texto livre (D018, o 005 traz cliente_id); numero nulo e só a situação
-- 'rascunho' (o 004 traz numeração e situações). Os totais são gravados pelo domínio a cada alteração (D019).
CREATE TABLE IF NOT EXISTS orcamento (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  numero INT,
  cliente_nome TEXT NOT NULL CHECK (length(trim(cliente_nome)) > 0),
  descricao_projeto TEXT NOT NULL CHECK (length(trim(descricao_projeto)) > 0),
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL CHECK (data_validade >= data_emissao),
  situacao VARCHAR(10) NOT NULL DEFAULT 'rascunho' CHECK (situacao IN ('rascunho')),
  modo_lucro VARCHAR(6) NOT NULL CHECK (modo_lucro IN ('margem','markup')),
  percentual_lucro NUMERIC(5,2) NOT NULL CHECK (percentual_lucro >= 0),
  regra_arredondamento VARCHAR(12) NOT NULL CHECK (regra_arredondamento IN ('duas_casas','real_inteiro','dezena')),
  subtotal_materiais NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal_servicos NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_adicionais NUMERIC(12,2) NOT NULL DEFAULT 0,
  custo_direto_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_lucro NUMERIC(12,2) NOT NULL DEFAULT 0,
  ajuste_arredondamento NUMERIC(12,2) NOT NULL DEFAULT 0,
  preco_final NUMERIC(12,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (marcenaria_id, numero)
);

-- Descrição, unidade e valor unitário são cópias do catálogo (RN08); material_id/servico_id só
-- registram a origem e ficam nulos no item avulso (RN03). valor_unitario_catalogo guarda o valor
-- copiado na inclusão; o ajuste manual (US08) é derivado dele pelo banco e nunca fica desatualizado.
CREATE TABLE IF NOT EXISTS orcamento_item (
  id UUID PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES orcamento(id),
  tipo VARCHAR(8) NOT NULL CHECK (tipo IN ('material','servico')),
  material_id UUID REFERENCES material(id) CHECK (material_id IS NULL OR tipo = 'material'),
  servico_id UUID REFERENCES servico(id) CHECK (servico_id IS NULL OR tipo = 'servico'),
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
  unidade VARCHAR(3) NOT NULL CHECK (unidade IN ('un','m','m²','ml','ch','kg','L','pç','h')),
  quantidade NUMERIC(12,3) NOT NULL CHECK (quantidade > 0),
  valor_unitario NUMERIC(12,4) NOT NULL CHECK (valor_unitario >= 0),
  valor_unitario_catalogo NUMERIC(12,4),
  valor_linha NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_ajustado_manualmente BOOLEAN GENERATED ALWAYS AS (COALESCE(valor_unitario <> valor_unitario_catalogo, false)) STORED,
  ordem INT NOT NULL,
  CHECK ((material_id IS NULL AND servico_id IS NULL) = (valor_unitario_catalogo IS NULL))
);
CREATE INDEX IF NOT EXISTS orcamento_item_orcamento_idx ON orcamento_item (orcamento_id, ordem);

CREATE TABLE IF NOT EXISTS orcamento_custo_adicional (
  id UUID PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES orcamento(id),
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  ordem INT NOT NULL
);
CREATE INDEX IF NOT EXISTS orcamento_custo_adicional_orcamento_idx ON orcamento_custo_adicional (orcamento_id, ordem);
