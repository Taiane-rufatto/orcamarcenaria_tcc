-- Spec 018: meta mensal, horas produtivas e horas estimadas do orçamento (RF44–RF46, D033). Idempotente.
-- Todas opcionais: sem elas o aviso de equilíbrio simplesmente não aparece.
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS meta_mensal NUMERIC(12,2);
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS horas_produtivas_mes NUMERIC(6,2);
ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS horas_estimadas NUMERIC(7,2);

ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_meta_mensal_check;
ALTER TABLE configuracao ADD CONSTRAINT configuracao_meta_mensal_check CHECK (meta_mensal IS NULL OR meta_mensal > 0);
ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_horas_produtivas_mes_check;
ALTER TABLE configuracao ADD CONSTRAINT configuracao_horas_produtivas_mes_check CHECK (horas_produtivas_mes IS NULL OR horas_produtivas_mes > 0);
ALTER TABLE orcamento DROP CONSTRAINT IF EXISTS orcamento_horas_estimadas_check;
ALTER TABLE orcamento ADD CONSTRAINT orcamento_horas_estimadas_check CHECK (horas_estimadas IS NULL OR horas_estimadas > 0);
