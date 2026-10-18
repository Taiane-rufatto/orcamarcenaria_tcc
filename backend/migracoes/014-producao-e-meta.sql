-- Spec 024: situações "em produção" e "entregue" depois de aprovado, e meta de faturamento do mês (D039). Idempotente.
-- Orientação de 08/10/2026: além de rascunho, enviado, aprovado e recusado, considerar em produção e entregue.
-- A coluna era VARCHAR(10) e "em_producao" tem 11 caracteres.
ALTER TABLE orcamento ALTER COLUMN situacao TYPE VARCHAR(20);
ALTER TABLE orcamento DROP CONSTRAINT IF EXISTS orcamento_situacao_check;
ALTER TABLE orcamento ADD CONSTRAINT orcamento_situacao_check
  CHECK (situacao IN ('rascunho','enviado','aprovado','recusado','vencido','em_producao','entregue'));

-- Meta de faturamento do mês: quanto a marcenaria quer aprovar por mês. Opcional e só compara; não é previsão.
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS meta_do_mes NUMERIC(12,2);
ALTER TABLE configuracao DROP CONSTRAINT IF EXISTS configuracao_meta_do_mes_check;
ALTER TABLE configuracao ADD CONSTRAINT configuracao_meta_do_mes_check CHECK (meta_do_mes IS NULL OR meta_do_mes > 0);
