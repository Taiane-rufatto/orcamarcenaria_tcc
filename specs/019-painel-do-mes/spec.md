# Spec 019 — Painel do mês

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-14
**Status:** implementada e verificada por testes automatizados em 2026-10-14 (D035). **Falta o percurso de tela pela autora** (`evidencias/testes/019-020-painel-e-fornecedor-2026-10-14.md`).
Origem: orientação de 08/10/2026 (ata §6 e §7), item S7/S9 da análise da spec 016.

## Contexto

O professor sugeriu dar ao marceneiro uma visão simples do negócio: quantos orçamentos enviou, quantos foram aprovados. Os dados já existem (situações do orçamento, RN09); falta resumir, em frases simples, sem gráfico e sem estado novo.

## Histórias e requisitos

US19; RF47 e RF48; regra RN14 em `regras-de-calculo.md` §6.1; decisão D035.

## Regra (RN14)

- Entram os orçamentos cuja **data de emissão** está no mês (não existe data de aprovação gravada).
- **Enviados** = todos menos os rascunhos. Aprovados, recusados, vencidos e aguardando (enviados sem resposta) são contados à parte.
- **Valor aprovado** = soma dos preços finais dos aprovados. **Lucro aprovado** = soma de (preço final − custo direto total) deles.
- **Taxa de aprovação** = aprovados ÷ enviados × 100, duas casas. Sem enviados, não há taxa.
- O vencimento automático (RF36) é aplicado antes de contar. O painel só **soma o que já está gravado**; não recalcula preço.

Exemplo (valores fictícios): aprovados 4.200,00 (custo 2.100,00) e 2.760,00 (custo 1.931,10); mais um recusado, um vencido, um enviado e um rascunho → 5 enviados, valor 6.960,00, lucro 2.928,90 (42,08% do preço), taxa 40,00%.

## Capacidade entregável

1. **Entrega:** tela **Painel do mês** no menu, com seletor de mês (padrão: o atual). Mostra "X de Y orçamentos enviados foram aprovados (Z%)", a contagem por situação e "Você aprovou R$ … com R$ … de lucro".
2. **Fica de fora:** gráficos; comparação entre meses; estados "em produção" e "entregue"; meta mensal; exportar.
3. **Demonstração:** com orçamentos de outubro registrados, abrir o painel e conferir as contagens; trocar para setembro e ver outro resumo; abrir um mês sem envios e ver a mensagem.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Contagens, soma, lucro e taxa corretos, incluindo arredondamento, mês vazio e rascunho fora da conta | `backend/tests/unidade/painel.test.ts` (5 testes), conferidos à mão |
| Só o mês pedido entra; aprovado de outro mês não conta | Teste de integração |
| Enviado sem resposta = aguardando; validade vencida = vencido | Teste de integração |
| Mês inválido dá 400; sem parâmetro usa o mês atual; exige login | Teste de integração |
| Uma marcenaria não vê o painel de outra | Teste de integração |
| Preço e cálculo do orçamento inalterados | Suíte do backend e `calculo.ts` sem diff |
| Tela: frases e valores da API, mês vazio, erro | `Painel.test.tsx` (3 testes) |
| RNF05 a 1366×768 e 390 px, com o menu de seis itens | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/019-020-painel-e-fornecedor-2026-10-14.md`.

## Perguntas em aberto

Nenhuma. Gráficos e comparação entre meses ficam para o TCC II.
