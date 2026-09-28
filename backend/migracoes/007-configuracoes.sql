-- Spec 007: dados de contato da marcenaria (RF05) e padrões do orçamento (RF19–RF22, D024). Idempotente.
ALTER TABLE marcenaria ADD COLUMN IF NOT EXISTS telefone VARCHAR(30);
ALTER TABLE marcenaria ADD COLUMN IF NOT EXISTS email_contato VARCHAR(200);
ALTER TABLE marcenaria ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);
ALTER TABLE marcenaria ADD COLUMN IF NOT EXISTS endereco VARCHAR(300);

-- Os DEFAULT abaixo são o único lugar dos padrões iniciais (D017, D024): markup 150% (2,5× o custo),
-- sem arredondamento e validade de 10 dias. A linha é criada na primeira leitura da configuração.
CREATE TABLE IF NOT EXISTS configuracao (
  marcenaria_id UUID PRIMARY KEY REFERENCES marcenaria(id),
  modo_lucro VARCHAR(6) NOT NULL DEFAULT 'markup' CHECK (modo_lucro IN ('margem','markup')),
  percentual_lucro_padrao NUMERIC(5,2) NOT NULL DEFAULT 150 CHECK (percentual_lucro_padrao >= 0),
  regra_arredondamento VARCHAR(12) NOT NULL DEFAULT 'duas_casas' CHECK (regra_arredondamento IN ('duas_casas','real_inteiro','dezena')),
  validade_padrao_dias INT NOT NULL DEFAULT 10 CHECK (validade_padrao_dias BETWEEN 1 AND 365),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
