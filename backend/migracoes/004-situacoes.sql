-- Spec 004: situações do orçamento (RN09) e numeração no registro (RN11, D020).
-- Migração idempotente: o migrador reaplica todos os arquivos, e 003-orcamento.sql não é editado.
-- Como o migrador reaplica este arquivo a cada execução, a lista abaixo precisa aceitar TODAS as situações que
-- existem hoje: com só as cinco originais, o ADD CONSTRAINT falharia assim que houvesse um orçamento "em
-- produção" ou "entregue" (spec 024, D039). A migração 014 repete a mesma lista e alarga a coluna.
ALTER TABLE orcamento DROP CONSTRAINT IF EXISTS orcamento_situacao_check;
ALTER TABLE orcamento ADD CONSTRAINT orcamento_situacao_check
  CHECK (situacao IN ('rascunho','enviado','aprovado','recusado','vencido','em_producao','entregue'));

-- Rascunho nunca tem número; orçamento registrado sempre tem (D020).
ALTER TABLE orcamento DROP CONSTRAINT IF EXISTS orcamento_numero_situacao_check;
ALTER TABLE orcamento ADD CONSTRAINT orcamento_numero_situacao_check
  CHECK ((situacao = 'rascunho') = (numero IS NULL));

-- Listagem da marcenaria, dos mais recentes aos mais antigos (RF37).
CREATE INDEX IF NOT EXISTS orcamento_listagem_idx ON orcamento (marcenaria_id, data_emissao DESC);
