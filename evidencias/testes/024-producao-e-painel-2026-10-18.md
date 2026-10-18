# Evidência — Incremento 024: em produção, entregue e painel de saúde do negócio

**Data:** 2026-10-18 · **Spec:** `specs/024-producao-e-painel/spec.md` · **Decisão:** D039 · **Requisitos:** RF60–RF63, US22, RN18–RN20

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (autora):** percurso de tela; na VPS, a migração `014`. O incremento ainda **não está fechado**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira | **26 arquivos, 292 testes passam**, incluindo CT01–CT10 |
| Suíte do frontend | **7 arquivos, 31 testes passam**; lint e build limpos |
| Migração `014` | aplicada no banco local e no de teste; **repetida no banco de teste com 1 orçamento em produção e 3 entregues já gravados**, sem erro |

## Critérios

| Critério | Resultado | Como |
|---|---|---|
| Funil (aprovado inclui produção e entrega), cobrança, variação e meta | passa | `tests/unidade/painel.test.ts` (21), valores conferidos à mão |
| Transições de situação e mensagem "em produção" | passa | `tests/integracao/painel.test.ts` |
| Painel e lista com produção e entrega | passa | mesmo arquivo |
| Meta do mês (grava, limpa, valida, compara, isola) | passa | mesmo arquivo |
| Cobrança da mão de obra e variação da hora contra o mês anterior | passa | mesmo arquivo |
| Preços dos materiais (mais usados, subindo, estável, caindo, rascunho e avulso fora) | passa | mesmo arquivo |
| Tela do painel (aprovação, meta, mão de obra, preços, mês vazio, erro) | passa | `src/paginas/Painel.test.tsx` (7) |

## Valores usados (fictícios, conferíveis à mão)

- **Funil:** aprovados 4.200,00 e 2.760,00 (CT03); mais recusado, vencido, enviado e rascunho → valor aprovado 6.960,00, lucro 2.928,90, taxa 40,00%.
- **Meta:** 6.960,00 de 10.000,00 = 69,60%, faltam 3.040,00.
- **Hora de serviço:** outubro 8 h a 50,00 e 2 h a 100,00 = 600,00 ÷ 10 h = **60,00**; setembro 8 h a 40,00 = **40,00**; variação **+50,00%**.
- **Preços:** MDF de 100,00 para 110,00 (+10,00%); cola de 50,00 para 45,00 (−10,00%); fita sem mudança (estável).

## Pendente: percurso de tela

1. **Minha marcenaria → Meta do mês:** informar `10000,00`.
2. **Orçamento aprovado:** clicar "Começou a produção" e depois "Marcar como entregue"; outro, "Já foi entregue" direto. Ver os selos na lista e o filtro por situação.
3. **Painel do mês:** conferir "Aprovados", "Em produção", "Entregues", a meta com o percentual e quanto falta, "Quanto você cobra pela mão de obra" e "Preços dos materiais que você mais usa". Trocar o mês.
4. Para ver a variação de preço sem esperar, mudar o custo de um material usado em orçamentos enviados e abrir o painel (a comparação é com 90 dias atrás ou o primeiro registro do histórico).
5. Conferir o menu e as telas a 1366×768 e a 390 px (RNF05).

## Limites

Testes automatizados não substituem o percurso de tela. A variação de preço depende do histórico de custo, que só passou a existir com a spec 020.
