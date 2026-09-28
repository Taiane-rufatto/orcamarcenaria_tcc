# Resultado dos Casos de Teste — Cálculo do Orçamento

Preencher a cada execução completa. Os valores de referência vêm de `casos-de-teste-referencia.csv` e devem ser **conferidos em planilha pela autora antes da execução no sistema**, conforme o método descrito na proposta.

- **Execução nº:** 1 — preliminar, no domínio (Spec 003). A execução formal pela tela é do incremento 008
- **Data:** 2026-09-28
- **Versão / commit:** `3cc3b4b` (branch `spec/003-composicao-calculo`)
- **Executado por:** suíte automatizada (`backend/tests/unidade/calculo.test.ts`); CT03 também pela tela, e pela autora manualmente
- **Ambiente:** local
- **Navegador:** Microsoft Edge (somente CT03 e CT04 pela tela)

| Caso | Valor de referência (R$) | Valor do sistema (R$) | Diferença (R$) | Situação | Observação / defeito |
|---|---|---|---|---|---|
| CT01 | 289,90 | 289,90 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT02 | 1.035,36 | 1.035,36 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT03 | 2.760,00 | 2.760,00 | 0,00 | Aprovado | Também pela API e pela tela; memorial conferido à mão |
| CT04 | 2.520,00 | 2.520,00 | 0,00 | Aprovado | Também pela API e pela tela |
| CT05 | 51,94 | 51,94 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT06 | 934,00 | 934,00 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT07 | 1.360,00 | 1.360,00 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT08 | 5.110,09 | 5.110,09 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT09 | 3.482,00 | 3.482,00 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |
| CT10 | 22,50 | 22,50 | 0,00 | Aprovado | Domínio; custo direto e preço bruto também iguais |

**Casos aprovados:** 10 de 10 · **Percentual:** 100% — valores de referência ainda não conferidos em planilha pela autora (B08)

## Casos negativos

| Caso | Comportamento esperado | Comportamento observado | Situação |
|---|---|---|---|
| CN01 | Margem = 100 é bloqueada | Recusada com mensagem no domínio, na API e na tela; nada gravado | Aprovado |
| CN02 | Quantidade zero ou negativa é bloqueada | 400 com mensagem (domínio e API) | Aprovado |
| CN03 | Valor unitário negativo é bloqueado | 400 com mensagem (domínio e API) | Aprovado |
| CN04 | Validade anterior à emissão é bloqueada | 400 com mensagem (API) | Aprovado |
| CN05 | Orçamento sem itens não é registrado | Registro (RF32) ainda não existe | Pendente — incremento 004 |
| CN06 | Orçamento sem cliente não é registrado | Rascunho sem cliente já é recusado (400); regra de registro no 004 | Parcial — concluir no 004 |

## Testes de isolamento entre contas

| Caso | Esperado | Observado | Situação |
|---|---|---|---|
| TI01 | Listagem vazia para a outra marcenaria | Catálogo (002) e orçamento (003): outra marcenaria recebe 404 e não usa material alheio | Aprovado para o que existe; listagem de orçamentos no 004 |
| TI02 | "Não encontrado" ao acessar orçamento alheio por ID | 404 ao consultar e alterar orçamento alheio (integração, 003) | Aprovado |
| TI03 | "Não encontrado" ao editar cliente alheio | | |
| TI04 | Redirecionamento ao login sem sessão | Verificado na Spec 001 | Aprovado |

## Defeitos encontrados

| # | Caso de origem | Descrição | Severidade | Correção | Reexecutado em |
|---|---|---|---|---|---|
| 1 | Revisão de código | `NaN`/`Infinity`/`1e3` aceitos e erro 500 com `""` no domínio | Média | Validação de formato no domínio | 2026-09-28, 10 de 10 |

## Conclusão da execução

Execução nº 1 (2026-09-28): 10 de 10 casos com diferença nula no domínio; CN01–CN04 aprovados; CN05 e CN06 dependem do registro (004). Não substitui a execução formal: falta a conferência em planilha (B08) e o lançamento dos dez casos pela tela (incremento 008). Detalhes em `003-calculo-2026-09-28.md`.
