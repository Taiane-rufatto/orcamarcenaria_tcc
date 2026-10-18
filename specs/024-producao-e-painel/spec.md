# Spec 024 — Em produção, entregue e painel de saúde do negócio

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-18
**Status:** implementada e verificada por testes automatizados em 2026-10-18 (D039). **Falta o percurso de tela pela autora.** A migração `014` ainda não foi aplicada na VPS.
Origem: resumo da orientação de 08/10/2026 feito pela autora, seções 2 (painel) e 3 (ponto de equilíbrio, na versão que ela escolheu: só a meta do mês).

## Contexto

O painel da spec 019 só contava orçamentos por situação. O resumo da autora pede mais: os estados "em produção" e "entregue", o funil até a entrega, a visão de preços dos materiais, como a mão de obra está sendo cobrada e, no ponto de equilíbrio, uma meta. Sobre a meta, a autora escolheu **só a meta do mês no painel**, sem horas disponíveis nem valor da hora, que era a parte que achou complicada.

## Histórias e requisitos

US22; RF60 a RF63; regras RN18, RN19 e RN20 em `regras-de-calculo.md` §6.3 (e a atualização da RN09); decisão D039.

## O que muda

1. **Em produção e entregue (RF60).** Depois de aprovado: "Começou a produção" e "Já foi entregue" (ou "Marcar como entregue" quando já está em produção). Sem voltar atrás; somente leitura como as outras situações finais. Aparecem na lista, no filtro por situação e nos selos.
2. **Meta do mês (RF61, RN20).** Campo opcional em Minha marcenaria. O painel mostra "Sua meta é R$ X. Você aprovou R$ Y (Z%). Faltam R$ W." ou "Meta batida!".
3. **Mão de obra (RF62, RN18 e RN19).** Soma da mão de obra, participação no preço e **valor médio da hora de serviço** contra o mês anterior ("subiu 10,00%").
4. **Preços dos materiais (RF63, RN19).** Os 10 materiais mais usados nos últimos 90 dias nos orçamentos enviados, com "subindo 8,00% (de R$ 289,90 para R$ 313,09)", "estável" ou "caindo". Usa o histórico de custo da spec 020.
5. **Aprovação.** O painel passa a mostrar "Em produção" e "Entregues" dentro dos aprovados.

## Capacidade entregável

1. **Entrega:** os cinco itens acima, com a migração `014`.
2. **Fica de fora:** meta com horas disponíveis e valor mínimo por hora (a autora preferiu não); gráficos e comparação de vários meses; estoque; previsão de faturamento.
3. **Demonstração:** definir uma meta de R$ 10.000,00; aprovar orçamentos; marcar um como em produção e outro como entregue; abrir o Painel do mês e ver os aprovados, a meta, a mão de obra e os preços dos materiais.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Funil: aprovado inclui em produção e entregue, com contagem à parte; taxa de aprovação | `backend/tests/unidade/painel.test.ts` |
| Cobrança: média ponderada da hora, participação no preço, rascunho fora, sem horas | mesmo arquivo |
| Variação: de 289,90 a 313,09 = +8,00%, de 313,09 a 289,90 = −7,41%, 0,00% = estável, sem anterior não compara | mesmo arquivo |
| Meta: 69,60%, falta 3.040,00; batida; zerada; sem meta | mesmo arquivo |
| Transições: aprovado → em produção → entregue; aprovado → entregue; o resto 409; mensagem com "em produção" | `backend/tests/integracao/painel.test.ts` |
| O painel conta produção e entrega dentro dos aprovados; a lista filtra por elas | mesmo arquivo |
| Meta: grava com vírgula, limpa, recusa 0, negativo, letras e 3 casas; painel compara; isolamento | mesmo arquivo |
| Cobrança no painel: 60,00 por hora em outubro contra 40,00 em setembro (+50,00%); participação 42,86% | mesmo arquivo |
| Preços: mais usados primeiro, subindo, estável e caindo; rascunho e avulso fora; isolamento | mesmo arquivo |
| Migração `014` repetida com orçamentos em produção e entregues já gravados | `npm run migrar` no banco de teste |
| Cálculo e preço inalterados | Suíte do backend inteira (CT01–CT10) |
| Tela do painel e telas de situação | `Painel.test.tsx` e percurso de tela (pendente) |

## Riscos

- A coluna `situacao` era `VARCHAR(10)`; "em_producao" tem 11 caracteres. Foi alargada para 20. Este problema só apareceu no teste de integração.
- A migração `004-situacoes.sql` precisou ser **editada** (exceção à regra de nunca editar migração antiga), porque o migrador reaplica todos os arquivos e ela recriaria a restrição só com cinco situações. Ver D039.
- Os preços dependem do histórico de custo; materiais novos aparecem como "estável" até o custo mudar.

## Evidências

`evidencias/testes/024-producao-e-painel-2026-10-18.md`.
