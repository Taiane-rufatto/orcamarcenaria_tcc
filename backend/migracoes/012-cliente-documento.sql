-- Spec 022: CPF ou CNPJ opcional no cadastro de cliente (RF54, D036). Idempotente.
-- Guarda só os dígitos (11 do CPF ou 14 do CNPJ); a validação dos dígitos verificadores é feita na API.
-- Não é único: o mesmo documento pode aparecer em dois cadastros (ex.: pessoa e empresa), e a conversa com o
-- orientador pediu para o cadastro de cliente continuar simples.
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS documento VARCHAR(14);
ALTER TABLE cliente DROP CONSTRAINT IF EXISTS cliente_documento_check;
ALTER TABLE cliente ADD CONSTRAINT cliente_documento_check CHECK (documento IS NULL OR documento ~ '^[0-9]{11}$|^[0-9]{14}$');
