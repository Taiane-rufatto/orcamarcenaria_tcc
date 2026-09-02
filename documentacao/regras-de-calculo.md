# Regras de Cálculo do Orçamento

Versão 1.0 · Fonte canônica do cálculo. Atende ao objetivo específico OE3 e ao critério da proposta de que **o cálculo possa ser reproduzido manualmente por outra pessoa**. Nenhuma implementação pode divergir deste documento; divergência é defeito, e mudança exige registro em `decisoes.md`.

## 1. Tipos e precisão

| Grandeza | Tipo | Casas decimais | Observação |
|---|---|---|---|
| Quantidade | decimal exato | 3 | Permite 2,5 chapas, 1,750 m |
| Valor unitário | decimal exato | 4 | Permite custos como R$ 1,2350/m |
| Valor de linha, subtotais, totais | decimal exato | 2 | Moeda |
| Percentual de lucro | decimal exato | 2 | Informado em pontos percentuais (ex.: 30,00) |

**RN-C01** — Todo cálculo monetário usa aritmética decimal exata (`NUMERIC`/`DECIMAL` no banco, `decimal`/`BigDecimal` na aplicação). É proibido usar ponto flutuante binário (`float`, `double`, `Number` do JavaScript) em qualquer etapa do cálculo (ver RNF07).

**RN-C02** — O arredondamento padrão é **meio para cima** (`ROUND_HALF_UP`): 0,005 → 0,01. É a regra que uma pessoa reproduz naturalmente com calculadora.

## 2. Sequência de cálculo

A ordem abaixo é obrigatória. Alterá-la muda o resultado por efeito de arredondamento.

```
1. Para cada item de material:  valor_linha = arred2(quantidade × valor_unitario)
2. Para cada item de serviço:   valor_linha = arred2(quantidade × valor_unitario)
3. subtotal_materiais  = Σ valor_linha dos itens de material
4. subtotal_servicos   = Σ valor_linha dos itens de serviço
5. total_adicionais    = Σ valor dos custos adicionais
6. custo_direto_total  = subtotal_materiais + subtotal_servicos + total_adicionais
7. preco_bruto         = aplicar_lucro(custo_direto_total, modo, percentual)
8. valor_lucro         = preco_bruto − custo_direto_total
9. preco_final         = aplicar_arredondamento_comercial(preco_bruto, regra)
```

**RN-C03** — O arredondamento a duas casas ocorre **por linha** (passo 1 e 2) e novamente no preço bruto (passo 7). Não se arredonda a soma intermediária, porque as parcelas já estão arredondadas.

## 3. Regras de negócio

### RN01 — Valor de item de material
`valor_linha = arred2(quantidade × valor_unitario)`, onde `valor_unitario` é o custo do material **no momento em que o item foi adicionado ao orçamento**.

### RN02 — Valor de item de serviço
Idem RN01. Para serviço cobrado por hora, `quantidade` é a quantidade de horas; por unidade, a quantidade de execuções.

### RN03 — Item avulso
Item não vinculado ao catálogo, com descrição, unidade, quantidade e valor unitário informados diretamente. Segue RN01 e compõe o subtotal de materiais ou de serviços conforme o tipo escolhido.

### RN04 — Custos adicionais
Lançados como **valor fixo** (frete, deslocamento, ferragens diversas). Não têm quantidade nem valor unitário e não sofrem rateio. Entram integralmente no custo direto total e, portanto, **também recebem lucro**.

### RN05 — Modo margem (percentual sobre o preço de venda)

```
preco_bruto = arred2( custo_direto_total / (1 − margem/100) )
```

Interpretação: "quero que o lucro seja 30% do valor que o cliente paga". É a definição contábil de margem e a recomendada pelo Sebrae (2020) para não confundir com markup.

Restrição: `0 ≤ margem < 100`. Margem igual ou maior que 100 é entrada inválida (divisão por zero ou preço negativo) e deve ser bloqueada na interface.

### RN06 — Modo markup (multiplicador sobre o custo)

```
preco_bruto = arred2( custo_direto_total × (1 + markup/100) )
```

Interpretação: "somo 30% sobre o que gastei". Restrição: `markup ≥ 0`.

> **Os dois modos produzem preços diferentes com o mesmo percentual.** Com custo de R$ 1.931,10 e 30%: margem → R$ 2.758,71; markup → R$ 2.510,43. Confundir os dois é justamente uma das falhas de precificação apontadas na justificativa da proposta. Por isso o sistema exige a escolha explícita do modo e exibe o rótulo correspondente na tela e no memorial de cálculo.

### RN07 — Arredondamento comercial do preço final

Configurável por marcenaria (RF21):

| Regra | Operação | Exemplo com R$ 2.758,71 |
|---|---|---|
| `duas_casas` | mantém o valor arredondado a 2 casas | R$ 2.758,71 |
| `real_inteiro` | arredonda **para cima** ao múltiplo de R$ 1,00 | R$ 2.759,00 |
| `dezena` | arredonda **para cima** ao múltiplo de R$ 10,00 | R$ 2.760,00 |

O arredondamento é sempre **para cima** nas regras `real_inteiro` e `dezena`, para que o preço nunca fique abaixo do valor calculado com a margem pretendida. A diferença entre `preco_bruto` e `preco_final` é exibida no memorial como "ajuste de arredondamento".

### RN08 — Congelamento de valores
Ao adicionar um item, o sistema **copia** nome, unidade e valor unitário do catálogo para o item do orçamento. Alterações posteriores no catálogo não afetam orçamentos já criados. Consequência exigida pelo TCC: um orçamento consultado meses depois reproduz exatamente o valor apresentado ao cliente.

### RN09 — Situações do orçamento

```
rascunho ──enviar──▶ enviado ──aprovar──▶ aprovado
                        │
                        ├──recusar──▶ recusado
                        │
                        └──(validade vencida)──▶ vencido
```

- Itens e valores só podem ser alterados em `rascunho`.
- `vencido` é atribuído automaticamente quando a data de validade é anterior à data corrente e a situação é `enviado`.
- Um orçamento `vencido` pode ser reaberto como rascunho apenas por duplicação (RF40, pós-TCC).

### RN10 — Validações de entrada

| Campo | Regra |
|---|---|
| Quantidade | maior que zero |
| Valor unitário | maior ou igual a zero |
| Custo adicional | maior que zero |
| Margem | 0 ≤ m < 100 |
| Markup | ≥ 0 |
| Data de validade | maior ou igual à data de emissão |
| Orçamento | ao menos um item para sair de rascunho (RF32) |

### RN11 — Numeração
Número sequencial por marcenaria, iniciando em 1, atribuído no momento do registro e nunca reutilizado.

## 4. Exemplo completo de conferência manual

Cenário: armário de cozinha sob medida. Modo **margem**, 30%, arredondamento `dezena`.

**Materiais**

| Material | Un | Qtd | Valor unit. (R$) | Valor linha (R$) |
|---|---|---|---|---|
| MDF branco 18 mm | ch | 2,500 | 289,9000 | 724,75 |
| Fita de borda 22 mm | m | 30,000 | 1,2350 | 37,05 |
| Corrediça telescópica 450 mm | un | 6,000 | 34,5000 | 207,00 |
| Dobradiça com amortecedor | un | 12,000 | 8,9000 | 106,80 |
| **Subtotal materiais** | | | | **1.075,60** |

**Serviços**

| Serviço | Cobrança | Qtd | Valor unit. (R$) | Valor linha (R$) |
|---|---|---|---|---|
| Corte e usinagem | hora | 8,000 | 45,0000 | 360,00 |
| Montagem e instalação | hora | 6,000 | 55,0000 | 330,00 |
| **Subtotal serviços** | | | | **690,00** |

**Custos adicionais**

| Descrição | Valor (R$) |
|---|---|
| Frete de entrega | 120,00 |
| Ferragens diversas | 45,50 |
| **Total adicionais** | **165,50** |

**Fechamento**

| Etapa | Operação | Valor (R$) |
|---|---|---|
| Custo direto total | 1.075,60 + 690,00 + 165,50 | 1.931,10 |
| Preço bruto (margem 30%) | 1.931,10 ÷ (1 − 0,30) = 1.931,10 ÷ 0,70 | 2.758,71 |
| Valor do lucro | 2.758,71 − 1.931,10 | 827,61 |
| Ajuste de arredondamento | próximo múltiplo de 10 acima | 1,29 |
| **Preço final** | | **2.760,00** |

Conferência: lucro de R$ 827,61 sobre preço de R$ 2.758,71 equivale a 30,00% — coerente com o modo margem.

Para efeito de comparação, o mesmo custo com **markup** de 30% resultaria em R$ 2.510,43 (preço final R$ 2.520,00 com a mesma regra de arredondamento), e o lucro representaria 23,08% do preço de venda.

## 5. Memorial de cálculo na tela (RF31)

A tela do orçamento deve exibir, sempre nesta ordem e com os rótulos abaixo:

```
Materiais ........................ R$ 1.075,60
Serviços e mão de obra ........... R$   690,00
Custos adicionais ................ R$   165,50
--------------------------------------------
Custo direto total ............... R$ 1.931,10
Lucro (margem 30,00%) ............ R$   827,61
Ajuste de arredondamento ......... R$     1,29
--------------------------------------------
PREÇO FINAL ...................... R$ 2.760,00
```

Esse bloco é a evidência visual de que o sistema não é uma caixa-preta — requisito para a defesa e para os testes de conferência manual.

## 6. Fora destas regras (registrado, não implementado no MVP)

- Aproveitamento de chapa / plano de corte (comprar chapa inteira e usar fração): tratado hoje pela quantidade fracionada informada pelo usuário (2,5 ch), sem otimização automática.
- Rateio de custos indiretos (energia, aluguel, depreciação) por hora produtiva.
- Impostos e regime tributário.
- Desconto comercial no fechamento (RF33).
- Reajuste automático de orçamento vencido pela variação de custo do catálogo.

Cada item acima está registrado como questão em aberto em `decisoes.md` e como trabalho futuro na monografia.
