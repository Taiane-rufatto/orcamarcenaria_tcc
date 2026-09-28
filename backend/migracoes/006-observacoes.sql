-- Spec 006: textos do orçamento impressos no PDF (RF41, D022). Idempotente.
-- especificacoes: o que o cliente recebe ("Armário com cinco portas…"), no alto do PDF.
-- observacoes: condições como prazo e pagamento, no fim do PDF.
ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS observacoes VARCHAR(1000);
ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS especificacoes VARCHAR(4000);
