# Tarefas — Registro e acompanhamento do orçamento

## Fase 1 — Dados e regras

- [ ] T001 Criar `backend/migracoes/004-situacoes.sql` (cinco situações, número ↔ situação, índice da listagem) e aplicar nos bancos de teste e principal.
- [ ] T002 [P] Escrever `backend/tests/integracao/registro.test.ts`: registro e numeração por marcenaria, CN05/CN06, transições permitidas e recusadas, vencimento, edição bloqueada fora de rascunho (RN09), valores preservados no registro (RF38), listagem com busca e filtros, isolamento.
- [ ] T003 Implementar registro, mudança de situação, vencimento e listagem no repositório e no caso de uso.
- [ ] T004 Rotas e validações (`GET /orcamentos`, `POST /orcamentos/:id/registrar`, `POST /orcamentos/:id/situacao`).

## Fase 2 — Telas

- [ ] T005 Lista de orçamentos com busca e filtros em `Orcamentos.tsx`.
- [ ] T006 Número, ações de situação e modo somente leitura em `Orcamento.tsx`.

## Fase 3 — Evidências e fechamento

- [ ] T007 Testes, builds, lint e regressão dos dez casos (`verificar-calculo`); percurso de tela; registrar em `evidencias/testes/`.
- [ ] T008 Validação manual da autora.
- [ ] T009 Atualizar documentação (arquitetura, matriz de verificação, `resultado-casos-de-teste.md` com CN05/CN06) e fechar com `fechar-spec` após revisão do diff.

## Ordem

T001 antes de tudo; T002 e T003–T004 juntos; telas depois da API; fechamento por último.
