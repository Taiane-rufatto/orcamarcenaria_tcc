# Evidências — Spec 008: validação formal do cálculo

**Data:** 2026-09-30  
**Branch:** `spec/008-validacao-calculo` · **Commit verificado:** `640972b` (código idêntico ao `main` após o PR #8)  
**Ambiente:** local (Windows 11, PostgreSQL local, banco principal) · **Navegador:** Microsoft Edge

Pré-requisito: valores de referência conferidos em planilha pela autora em 2026-09-30 (B08, `conferencia-casos-de-teste.xlsx`).

## Suíte automatizada (RNF21)

| Verificação | Resultado |
|---|---|
| `backend/npx vitest run` | 13 arquivos, 139 testes aprovados |
| `backend/tests/unidade/calculo.test.ts` | lê os dez casos de `casos-de-teste-referencia.csv` e confere todas as etapas de cada um; 45 testes aprovados |
| `frontend/npm test` | 2 arquivos, 13 testes aprovados |

## Ensaio automatizado pela tela (D025 — evidência complementar)

Edge dirigido por Playwright (1280 px), script fora do repositório, seguindo `008-roteiro-casos-pela-tela.md`. Conta de ensaio própria ("Marcenaria Ensaio 008", dados fictícios) e cliente "Cliente Teste 008". Um orçamento por caso, itens avulsos, lucro e arredondamento definidos em "Dados e lucro". Foram lidos os sete valores do memorial (materiais, serviços, adicionais, custo direto, lucro, ajuste e preço final) e comparados à referência.

| Caso | Custo direto | Lucro | Ajuste | Preço final (tela) | Referência | Diferença |
|---|---|---|---|---|---|---|
| CT01 | R$ 289,90 | R$ 0,00 | R$ 0,00 | R$ 289,90 | R$ 289,90 | R$ 0,00 |
| CT02 | R$ 724,75 | R$ 310,61 | R$ 0,00 | R$ 1.035,36 | R$ 1.035,36 | R$ 0,00 |
| CT03 | R$ 1.931,10 | R$ 827,61 | R$ 1,29 | R$ 2.760,00 | R$ 2.760,00 | R$ 0,00 |
| CT04 | R$ 1.931,10 | R$ 579,33 | R$ 9,57 | R$ 2.520,00 | R$ 2.520,00 | R$ 0,00 |
| CT05 | R$ 41,55 | R$ 10,39 | R$ 0,00 | R$ 51,94 | R$ 51,94 | R$ 0,00 |
| CT06 | R$ 622,50 | R$ 311,25 | R$ 0,25 | R$ 934,00 | R$ 934,00 | R$ 0,00 |
| CT07 | R$ 746,25 | R$ 610,57 | R$ 3,18 | R$ 1.360,00 | R$ 1.360,00 | R$ 0,00 |
| CT08 | R$ 3.832,57 | R$ 1.277,52 | R$ 0,00 | R$ 5.110,09 | R$ 5.110,09 | R$ 0,00 |
| CT09 | R$ 1.392,74 | R$ 2.089,11 | R$ 0,15 | R$ 3.482,00 | R$ 3.482,00 | R$ 0,00 |
| CT10 | R$ 22,50 | R$ 0,00 | R$ 0,00 | R$ 22,50 | R$ 22,50 | R$ 0,00 |

**10 de 10** com os sete valores do memorial iguais à referência. Nenhum erro de página.

### Casos negativos pela tela

| Caso | Entrada | Mensagem exibida | Resultado |
|---|---|---|---|
| CN01 | Margem = 100 | "A margem deve ser menor que 100%" | Bloqueado; memorial inalterado |
| CN02 | Quantidade 0 | "A quantidade deve ser maior que zero" | Bloqueado; item não incluído |
| CN02 | Quantidade −1 | "Informe a quantidade com até 3 casas decimais" | Bloqueado; item não incluído (ver observação) |
| CN03 | Valor unitário −5,00 | "Informe o valor unitário, sem sinal negativo, com até 4 casas decimais" | Bloqueado; item não incluído |
| CN04 | Validade antes da emissão | "A validade não pode ser anterior à data de emissão" | Bloqueado |
| CN05 | Registrar sem itens | "Inclua ao menos um item antes de registrar o orçamento" | Bloqueado; continua rascunho |
| CN06 | Novo orçamento sem cliente | Validação do navegador no campo Cliente ("Selecione um item na lista.") | Bloqueado; nada criado |

**Observação (sem correção nesta spec):** quantidade negativa é bloqueada, mas a mensagem fala de casas decimais em vez de sinal negativo. Não afeta o cálculo nem a RN10 (a entrada é recusada); registrada para ajuste de texto futuro.

## Execução formal pela autora (D025)

A autora lançou os dez casos à mão, na própria conta, em 2026-09-30, das 14h44 às 15h46 (horário de Brasília); navegador não informado. Fez isso a partir dos dados dos casos, **antes** do ensaio e da redação do roteiro, usando descrições de projeto próprias (fictícias) e registrando cada orçamento. Os valores foram lidos do banco pelo agente (consulta só de leitura) e cada orçamento foi associado ao caso pela forma de lucro, percentual, arredondamento, custo direto e número de itens.

| Caso | Lucro lançado | Itens | Custo direto | Lucro | Ajuste | Preço final | Referência | Diferença |
|---|---|---|---|---|---|---|---|---|
| CT01 | markup 0% | 1 | R$ 289,90 | R$ 0,00 | R$ 0,00 | R$ 289,90 | R$ 289,90 | R$ 0,00 |
| CT02 | margem 30% | 1 | R$ 724,75 | R$ 310,61 | R$ 0,00 | R$ 1.035,36 | R$ 1.035,36 | R$ 0,00 |
| CT03 | margem 30% | 6 | R$ 1.931,10 | R$ 827,61 | R$ 1,29 | R$ 2.760,00 | R$ 2.760,00 | R$ 0,00 |
| CT04 | markup 30% | 6 | R$ 1.931,10 | R$ 579,33 | R$ 9,57 | R$ 2.520,00 | R$ 2.520,00 | R$ 0,00 |
| CT05 | margem 20% | 2 | R$ 41,55 | R$ 10,39 | R$ 0,00 | R$ 51,94 | R$ 51,94 | R$ 0,00 |
| CT06 | markup 50% | 2 | R$ 622,50 | R$ 311,25 | R$ 0,25 | R$ 934,00 | R$ 934,00 | R$ 0,00 |
| CT07 | margem 45% | 1 | R$ 746,25 | R$ 610,57 | R$ 3,18 | R$ 1.360,00 | R$ 1.360,00 | R$ 0,00 |
| CT08 | margem 25% | 12 | R$ 3.832,57 | R$ 1.277,52 | R$ 0,00 | R$ 5.110,09 | R$ 5.110,09 | R$ 0,00 |
| CT09 | margem 60% | 2 | R$ 1.392,74 | R$ 2.089,11 | R$ 0,15 | R$ 3.482,00 | R$ 3.482,00 | R$ 0,00 |
| CT10 | markup 0% | 1 | R$ 22,50 | R$ 0,00 | R$ 0,00 | R$ 22,50 | R$ 22,50 | R$ 0,00 |

**10 de 10 com diferença R$ 0,00** no preço final, no custo direto, no lucro e no ajuste.

**Desvios em relação aos casos:**
- CT01 foi lançado com markup 0%, e o caso define margem 0%. Com percentual zero as duas fórmulas dão o custo, então o preço final não muda; a margem 0% (RN05 com zero) está coberta pelo ensaio e pela suíte automatizada.
- CT10 foi lançado duas vezes, com o mesmo resultado.

## O que esta execução prova e o que não prova

- **Prova:** os dez casos, com valores de referência conferidos previamente em planilha (B08) e lançados na aplicação pela pesquisadora, têm diferença nula após o arredondamento (RNF06, critério de aprovação da proposta); a suíte automatizada cobre os dez casos (RNF21); as entradas inválidas da RN10 são bloqueadas pela tela.
- **Não prova:** comportamento em outros navegadores ou fora do ambiente local; a execução formal não seguiu o roteiro, que foi escrito depois.
