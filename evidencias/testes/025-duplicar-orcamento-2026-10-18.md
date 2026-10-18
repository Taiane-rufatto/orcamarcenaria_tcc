# Evidência — Incremento 025: duplicar orçamento

**Data:** 2026-10-18 · **Spec:** `specs/025-duplicar-orcamento/spec.md` · **Decisão:** D040 · **Requisitos:** RF40, US23

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (autora):** percurso de tela; na VPS, a migração `015`. O incremento ainda **não está fechado**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira | **27 arquivos, 303 testes passam**, incluindo CT01–CT10 |
| Suíte do frontend | **7 arquivos, 31 testes passam**; lint e build limpos |
| Migração `015` | aplicada no banco local e no de teste, sem erro |

## Critérios

| Critério | Resultado | Como |
|---|---|---|
| Cópia completa, mesmo memorial e preço, rascunho sem número, referência ao original | passa | `tests/integracao/duplicar.test.ts` (11) |
| Original intacto; emissão de hoje; validade de 10 e de 30 dias | passa | mesmo arquivo |
| Valor ajustado continua ajustado; ajuste só no rascunho novo; registro com número próprio | passa | mesmo arquivo |
| Cadeia de cópias; situações aprovado, recusado, em produção e entregue; erros 409, 404 e 401 | passa | mesmo arquivo |

## Pendente: percurso de tela

1. Abrir um orçamento **enviado** e clicar em "Duplicar para ajustar": abre um rascunho novo com o cabeçalho "Ajuste do orçamento nº X".
2. Conferir que itens, custos, lucro, arredondamento e textos vieram, e que o preço final é o mesmo.
3. Trocar ou remover um item no rascunho novo; conferir que o preço muda.
4. Registrar o rascunho e ver o próximo número; voltar ao original e conferir que nada mudou.
5. Tentar duplicar a partir de um orçamento em rascunho: o botão não aparece.
6. 1366×768 e 390 px (RNF05).

## Limites

Testes automatizados não substituem o percurso de tela. O botão e a navegação não têm teste de componente.
