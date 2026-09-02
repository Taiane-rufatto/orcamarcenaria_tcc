# Resultado dos Casos de Teste — Cálculo do Orçamento

Preencher a cada execução completa. Os valores de referência vêm de `casos-de-teste-referencia.csv` e devem ser **conferidos em planilha pela autora antes da execução no sistema**, conforme o método descrito na proposta.

- **Execução nº:**
- **Data:**
- **Versão / commit:**
- **Executado por:**
- **Ambiente:** local / VPS
- **Navegador:**

| Caso | Valor de referência (R$) | Valor do sistema (R$) | Diferença (R$) | Situação | Observação / defeito |
|---|---|---|---|---|---|
| CT01 | 289,90 | | | | |
| CT02 | 1.035,36 | | | | |
| CT03 | 2.760,00 | | | | |
| CT04 | 2.520,00 | | | | |
| CT05 | 51,94 | | | | |
| CT06 | 934,00 | | | | |
| CT07 | 1.360,00 | | | | |
| CT08 | 5.110,09 | | | | |
| CT09 | 3.482,00 | | | | |
| CT10 | 22,50 | | | | |

**Casos aprovados:** ___ de 10 · **Percentual:** ___%

## Casos negativos

| Caso | Comportamento esperado | Comportamento observado | Situação |
|---|---|---|---|
| CN01 | Margem = 100 é bloqueada | | |
| CN02 | Quantidade zero ou negativa é bloqueada | | |
| CN03 | Valor unitário negativo é bloqueado | | |
| CN04 | Validade anterior à emissão é bloqueada | | |
| CN05 | Orçamento sem itens não é registrado | | |
| CN06 | Orçamento sem cliente não é registrado | | |

## Testes de isolamento entre contas

| Caso | Esperado | Observado | Situação |
|---|---|---|---|
| TI01 | Listagem vazia para a outra marcenaria | | |
| TI02 | "Não encontrado" ao acessar orçamento alheio por ID | | |
| TI03 | "Não encontrado" ao editar cliente alheio | | |
| TI04 | Redirecionamento ao login sem sessão | | |

## Defeitos encontrados

| # | Caso de origem | Descrição | Severidade | Correção | Reexecutado em |
|---|---|---|---|---|---|
| | | | | | |

## Conclusão da execução

_(registrar: aprovação geral, defeitos pendentes e se é necessária nova execução completa)_
