# Tarefas — Clientes

## Fase 1 — Dados e API

- [x] T001 Criar `backend/migracoes/005-clientes.sql` (tabela, vínculo, migração dos nomes, `NOT NULL`); conferir o banco principal antes e depois.
- [x] T002 Repositório, validações e rotas de cliente (cadastro, busca, edição, inativação, reativação).
- [x] T003 Orçamento com `clienteId`: validação, caso de uso (cliente ativo da marcenaria ao criar e trocar), consulta e lista com o nome do cadastro.
- [x] T004 [P] Integração: `clientes.test.ts` (US06, TI03) e ajuste de `orcamento.test.ts` e `registro.test.ts` para criar cliente antes.

## Fase 2 — Telas

- [x] T005 Serviço e página de clientes; item no menu.
- [x] T006 Seleção de cliente no novo orçamento e nos dados do rascunho.

## Fase 3 — Evidências e fechamento

- [ ] T007 Testes, builds, lint, regressão dos dez casos; percurso de tela; registrar em `evidencias/testes/`.
- [ ] T008 Validação manual da autora.
- [ ] T009 Atualizar documentação (arquitetura, matriz, TI03) e fechar com `fechar-spec` após revisão do diff.
