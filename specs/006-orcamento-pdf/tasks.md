# Tarefas — Orçamento em PDF

## Fase 1 — Conteúdo e geração

- [ ] T001 Migração `006-observacoes.sql` e observações no cabeçalho do rascunho (validação, repositório, resposta).
- [ ] T002 [P] Extenso em reais com testes de unidade de casos conferidos à mão.
- [ ] T003 [P] Conteúdo do PDF (função pura) com testes: RF41 completo, RF42 nas duas opções a partir do CT03.
- [ ] T004 Desenho com PDFKit, caso de uso e rota `GET /orcamentos/:id/pdf`; integração: download, 409 em rascunho, TI02, RNF19 com dez itens.

## Fase 2 — Tela

- [ ] T005 Campo Observações no rascunho; "Baixar PDF" com a escolha no orçamento registrado.

## Fase 3 — Evidências e fechamento

- [ ] T006 Testes, builds, lint, regressão dos dez casos; PDFs de exemplo conferidos; registrar em `evidencias/testes/`.
- [ ] T007 Validação manual da autora.
- [ ] T008 Documentação (arquitetura, matriz) e `fechar-spec` após revisão do diff.
