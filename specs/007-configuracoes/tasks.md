# Tarefas — Configurações da marcenaria

## Fase 1 — Dados e API

- [x] T001 Migração `007-configuracoes.sql`; aplicar nos dois bancos.
- [x] T002 `validarLucro` exportado do domínio (sem mudar fórmula) e regressão dos dez casos.
- [x] T003 Repositório, validações e rotas de configuração; orçamento novo usando a configuração; contatos no PDF.
- [x] T004 [P] Integração `configuracoes.test.ts`: padrões iniciais, edição, não retroatividade, validade calculada, CT03/CT04/CT06 pela configuração, margem ≥ 100, CNPJ, isolamento; unidade do PDF com contatos.

## Fase 2 — Tela

- [ ] T005 Página "Minha marcenaria" (dados, padrões, senha) e item no menu; validade opcional no novo orçamento.

## Fase 3 — Evidências e fechamento

- [ ] T006 Testes, builds, lint, regressão, percurso de tela (1280 e 390 px); registrar em `evidencias/testes/`.
- [ ] T007 Validação manual da autora.
- [ ] T008 Documentação (arquitetura, matriz) e `fechar-spec` após revisão do diff.
