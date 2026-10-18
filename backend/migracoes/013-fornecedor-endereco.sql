-- Spec 023: endereço do fornecedor (orientação de 08/10/2026: "nome da loja, endereço e contato"). Idempotente.
ALTER TABLE fornecedor ADD COLUMN IF NOT EXISTS endereco VARCHAR(300);
