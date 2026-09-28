-- Spec 006: observações do orçamento, impressas no PDF (RF41, D022). Idempotente.
ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS observacoes VARCHAR(1000);
