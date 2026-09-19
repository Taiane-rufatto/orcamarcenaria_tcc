# Tarefas — Catálogo de materiais e serviços

## Fase 1 — Fundação

- [x] T001 Criar `backend/migracoes/002-catalogo.sql` com tabelas material e servico, `NUMERIC(12,4)`, chaves por marcenaria e inativação lógica.
- [x] T002 Criar repositórios filtrados obrigatoriamente por `marcenaria_id` em `backend/src/infra/repositorios/catalogo-repositorio.ts`.
- [x] T003 Criar validações Zod de unidade, descrição, tipo de cobrança e decimal com até quatro casas em `backend/src/api/validacoes/catalogo.ts`.

## Fase 2 — US03: materiais

- [x] T004 [P] [US03] Escrever testes unitários de validação decimal e unidades em `backend/tests/unidade/catalogo.test.ts`.
- [x] T005 [US03] Implementar casos de uso e rotas autenticadas de cadastro/listagem de materiais em `backend/src/aplicacao/catalogo/` e `backend/src/api/rotas/catalogo.ts`.
- [x] T006 [US03] Criar serviço e tela de materiais em `frontend/src/servicos/catalogo.ts` e `frontend/src/paginas/Materiais.tsx`.

## Fase 3 — US04: manutenção

- [x] T007 [P] [US04] Escrever integração de busca, filtro, edição, inativação e TI01 no banco de testes em `backend/tests/integracao/catalogo.test.ts`.
- [x] T008 [US04] Implementar edição, busca, filtro e inativação autenticadas de materiais.
- [x] T009 [US04] Integrar busca, filtro, edição e inativação na tela de materiais.

## Fase 4 — US05: serviços

- [x] T010 [P] [US05] Estender testes de unidade e integração para serviços.
- [x] T011 [US05] Implementar casos de uso e rotas autenticadas de serviço.
- [x] T012 [US05] Criar tela e fluxo de serviços no frontend.

## Fase 4b — Reativação (D015)

- [x] T016 [P] [US04, US05] Estender a integração: reativar material e serviço, voltar à listagem de ativos e negar reativação de registro de outra marcenaria (TI01) em `backend/tests/integracao/catalogo.test.ts`.
- [x] T017 [US04, US05] Implementar `POST /materiais/:id/reativar` e `POST /servicos/:id/reativar` filtrados por `marcenaria_id` da sessão.
- [x] T018 [US04, US05] Exibir "Reativar" nas linhas inativas das telas de materiais e serviços.

## Fase 5 — Evidências

- [x] T013 Executar migração, testes e builds; registrar em `evidencias/testes/`.
- [x] T014 Executar `quickstart.md` com dados fictícios e registrar validação manual.
- [ ] T015 Atualizar documentos de estado e fechar a Spec após revisão. *(documentos atualizados; falta a revisão humana do diff, B12)*

> Nota T005/T011: os casos de uso ficaram nas próprias rotas + repositório (não há regra de negócio além de validar e gravar); a pasta `aplicacao/catalogo/` não foi criada para não gerar camada decorativa.

## Ordem

T001–T003 bloqueiam as histórias. US03 precede US04; US05 pode seguir após a fundação. T016–T018 dependem de US04 e US05. T013–T015 dependem de todas as histórias, inclusive T016–T018 (T013 e T014 precisam ser reexecutados após a reativação).
