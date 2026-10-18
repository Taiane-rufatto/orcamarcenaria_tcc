-- Spec 025: duplicar orçamento para ajustar (RF40, D040). Idempotente.
-- O rascunho novo guarda de qual orçamento veio, para a tela mostrar "ajuste do orçamento nº X".
-- O original não muda; a referência só aponta para ele (nada é apagado, RNF10).
ALTER TABLE orcamento ADD COLUMN IF NOT EXISTS origem_id UUID REFERENCES orcamento(id);
