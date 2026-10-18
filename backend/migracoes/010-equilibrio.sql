-- Spec 018: lucro mínimo que o marceneiro aceita, em % do preço de venda (RF44–RF46, D033). Idempotente.
-- Opcional: sem ele, a tela só mostra o lucro do orçamento e nunca avisa.
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS lucro_minimo NUMERIC(5,2);
ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_lucro_minimo_check;
ALTER TABLE configuracao ADD CONSTRAINT configuracao_lucro_minimo_check CHECK (lucro_minimo IS NULL OR (lucro_minimo > 0 AND lucro_minimo < 100));

-- Primeira ideia da spec (meta mensal e horas), trocada antes de ser publicada: nunca chegou a ser usada.
ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_meta_mensal_check;
ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_horas_produtivas_mes_check;
ALTER TABLE configuracao DROP COLUMN IF EXISTS meta_mensal;
ALTER TABLE configuracao DROP COLUMN IF EXISTS horas_produtivas_mes;
ALTER TABLE orcamento DROP CONSTRAINT IF EXISTS orcamento_horas_estimadas_check;
ALTER TABLE orcamento DROP COLUMN IF EXISTS horas_estimadas;
