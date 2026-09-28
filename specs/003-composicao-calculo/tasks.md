# Tarefas — Composição e cálculo do orçamento

## Fase 1 — Domínio do cálculo (bloqueia tudo)

- [x] T001 [P] Escrever `backend/tests/unidade/calculo.test.ts`: CT01–CT10 lidos de `evidencias/testes/casos-de-teste-referencia.csv`, conferindo subtotais, custo direto, preço bruto, lucro, ajuste e preço final.
- [x] T002 Implementar `backend/src/dominio/orcamento/calculo.ts` seguindo `regras-de-calculo.md` §2 (RN-C01, RN-C02, RN01–RN07).
- [x] T003 Casos negativos no domínio (RN10, CN01–CN03), formato estrito dos números (sem NaN, Infinity, notação científica ou casas além de §1) e multiplicador equivalente no markup (D018).

## Fase 2 — Persistência

- [x] T004 Criar `backend/migracoes/003-orcamento.sql` (orcamento, orcamento_item, orcamento_custo_adicional), aplicar no banco de teste e no principal.
- [x] T005 Criar `backend/src/infra/repositorios/orcamento-repositorio.ts`, sempre filtrado por `marcenaria_id`, com escrita + recálculo em transação.

## Fase 3 — API (US07–US11)

- [x] T006 [P] Escrever `backend/tests/integracao/orcamento.test.ts`: criar rascunho, adicionar/alterar/remover itens e adicionais, CT03 pela API, RF14, item inativo recusado, isolamento entre marcenarias, CN04.
- [x] T007 Validações Zod em `backend/src/api/validacoes/orcamento.ts` (quantidade 3 casas, valor 4 casas, percentual 2 casas, datas).
- [x] T008 Rotas em `backend/src/api/rotas/orcamentos.ts`, com `ErroCalculo` traduzido para 400.

## Fase 4 — Telas

- [x] T009 Serviço `frontend/src/servicos/orcamentos.ts` e formulário de novo orçamento na página `Orcamentos.tsx` (sem página separada).
- [x] T010 Tela do orçamento (`Orcamento.tsx`, componente `Memorial.tsx`): itens do catálogo e avulsos, custos adicionais, lucro, arredondamento e memorial (RF31), sem nenhuma conta no frontend.

## Fase 5 — Evidências e fechamento

- [x] T011 Rodar migração, testes, builds e lint; executar a rotina `verificar-calculo` e registrar em `evidencias/testes/`.
- [x] T012 Validação manual com o exemplo de `regras-de-calculo.md` §4 e com markup 150% (2,50×), usando dados fictícios.
- [x] T013 Atualizar documentação (`arquitetura.md` §5 e §8, matriz de verificação) e fechar a spec com `fechar-spec` após revisão do diff pela autora.

## Ordem

T001–T003 bloqueiam o resto. T004–T005 antes de T006–T008. T009–T010 dependem da API. T011–T013 por último.

> Nota T005 (revisão da autora, 2026-09-28): todo comando do repositório filtra por `marcenaria_id`, inclusive itens e custos (pelo orçamento); a marca de ajuste manual é coluna gerada, comparando com o valor copiado do catálogo; a consulta lê em `REPEATABLE READ`; e `alterar` recusa orçamento fora de `rascunho` (RN09, 409). Esse último ainda não tem teste porque o banco só admite `rascunho` — **o incremento 004 deve incluir o teste** ao introduzir as demais situações.
