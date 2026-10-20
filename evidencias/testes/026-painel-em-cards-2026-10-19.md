# Evidência — Spec 026 (painel em cards e ajustes visuais)

**Data:** 2026-10-19 · **Commit:** `cf2093f` (`main`, PR #21) · **Publicado na VPS:** 2026-10-19, `atualizar.sh main`, `/saude` com `api: ok, banco: ok`

## Testes automatizados

| Suíte | Resultado |
|---|---|
| Backend (Vitest, 27 arquivos, banco local) | 303 de 303 aprovados |
| Frontend (Vitest, 7 arquivos) | 31 de 31 aprovados |
| `tsc` do frontend e `eslint` | sem erros |

`Painel.test.tsx` (7 testes) confirma que todas as frases e valores do painel continuam idênticos aos da API; só os rótulos mudaram ("Aprovados", "Vencidos sem resposta", "Rascunhos") e a lista de preços virou tabela (material, usado em, custo antes, custo agora, variação).

## Critérios da spec

| Critério | Resultado |
|---|---|
| Valores e frases do painel iguais aos da API (RF47, RF48, RF60 a RF63) | Verificado: `Painel.test.tsx` |
| Nenhuma conta nova no front | Verificado na revisão do diff: a barra da meta usa o percentual que a API devolve; nenhuma fórmula tocada |
| Cores só em variáveis de `index.css` | Verificado na revisão do diff |
| Cor nunca é o único sinal | Verificado por leitura: cada indicador tem rótulo em texto; a variação tem texto e símbolo |
| Site no ar atualizado | Verificado: `https://54-232-52-91.sslip.io` serve `index-igtejMcx.js` e `index-DFJBXmRY.css` da `main` |
| 1366×768 e 390 px sem rolagem horizontal; demonstração com dados de outubro | **Pendente: percurso de tela pela autora.** Não houve captura de tela nesta sessão (sem Playwright instalado) |

## Cálculo

Nenhum valor, fórmula, arredondamento ou rota da API mudou. A suíte de unidade do cálculo (45 testes, inclui CT01 a CT10) passou no mesmo commit. Não foi refeita a execução formal dos dez casos pela tela, porque nenhuma tela de orçamento mudou de valor; o orçamento ganhou só o card "Duplicar orçamento" e o texto da confirmação de registro.

## Ocultações provisórias (D041)

Card "Quanto sobra de lucro" e campo "Lucro mínimo" (spec 018) e tela, campo, coluna e histórico de fornecedor (specs 020 e 023): só a tela; API, componentes e dados mantidos.
