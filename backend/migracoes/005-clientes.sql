-- Spec 005: cadastro de clientes (RF08–RF10) e vínculo com o orçamento (D021).
-- Migração idempotente: o migrador reaplica todos os arquivos a cada execução.
CREATE TABLE IF NOT EXISTS cliente (
  id UUID PRIMARY KEY,
  marcenaria_id UUID NOT NULL REFERENCES marcenaria(id),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0), -- não é único: homônimos são comuns (D021)
  telefone VARCHAR(30),
  email VARCHAR(200),
  endereco VARCHAR(300),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cliente_marcenaria_nome_idx ON cliente (marcenaria_id, nome);

ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES cliente(id);

-- Converte o cliente em texto livre do 003 (D018): um cliente por nome distinto em cada marcenaria,
-- orçamentos ligados a ele e a coluna antiga removida. Roda só enquanto cliente_nome existir,
-- então acontece uma única vez e nenhum orçamento fica sem cliente.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orcamento' AND column_name = 'cliente_nome') THEN
    INSERT INTO cliente (id, marcenaria_id, nome)
      SELECT gen_random_uuid(), marcenaria_id, trim(cliente_nome)
      FROM orcamento WHERE cliente_id IS NULL
      GROUP BY marcenaria_id, trim(cliente_nome);
    UPDATE orcamento o SET cliente_id = c.id
      FROM cliente c
      WHERE o.cliente_id IS NULL AND c.marcenaria_id = o.marcenaria_id AND c.nome = trim(o.cliente_nome);
    ALTER TABLE orcamento DROP COLUMN cliente_nome;
  END IF;
END $$;

ALTER TABLE orcamento ALTER COLUMN cliente_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS orcamento_cliente_idx ON orcamento (cliente_id);
