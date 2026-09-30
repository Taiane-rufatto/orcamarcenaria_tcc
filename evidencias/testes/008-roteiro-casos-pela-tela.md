# Roteiro — dez casos de cálculo pela tela (Spec 008)

**Uso:** execução formal pela autora (D025). Os dados vêm de `casos-de-teste-referencia.csv`, conferido em planilha (B08). Cada caso é um orçamento novo, em rascunho; não é preciso registrar.

## Antes de começar

1. Entre na sua conta e cadastre um cliente fictício, por exemplo **"Cliente Teste 008"** (Clientes).
2. Anote a data, o navegador e se está no computador de sempre.

## Para cada caso

1. **Orçamentos → Novo orçamento:** cliente "Cliente Teste 008", descrição do projeto = o código do caso (ex.: `CT01`), data de emissão de hoje, validade em branco. Clique em **Criar orçamento**.
2. **Dados e lucro:** escolha a forma de lucro, o percentual e o arredondamento do caso e clique em **Salvar dados e lucro**.
3. **Itens:** em Origem, escolha **Item avulso (fora do catálogo)**. Para cada item, preencha tipo, descrição, unidade, valor unitário e quantidade exatamente como na tabela (com vírgula) e clique em **Incluir item**.
4. **Custos adicionais:** inclua cada um com descrição e valor.
5. **Memorial de cálculo:** anote custo direto total, lucro, ajuste de arredondamento e preço final na coluna "Obtido".

A unidade não entra na conta; ela está sugerida só para o orçamento ficar coerente.


## CT01 — Um material, sem serviço e sem adicional, lucro zero

**Dados e lucro:** Margem — sobre o preço de venda · percentual **0** · Não arredondar (centavos)

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | MDF 18mm | ch | 289,90 | 1 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 289,90 | |
| Lucro | R$ 0,00 | |
| Ajuste de arredondamento | R$ 0,00 | |
| **Preço final** | **R$ 289,90** | |

## CT02 — Quantidade fracionada de chapa, margem 30%

**Dados e lucro:** Margem — sobre o preço de venda · percentual **30** · Não arredondar (centavos)

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | MDF 18mm | ch | 289,90 | 2,5 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 724,75 | |
| Lucro | R$ 310,61 | |
| Ajuste de arredondamento | R$ 0,00 | |
| **Preço final** | **R$ 1.035,36** | |

## CT03 — Orçamento completo (exemplo de referência), margem 30%, dezena

**Dados e lucro:** Margem — sobre o preço de venda · percentual **30** · Para cima, à dezena

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | MDF 18mm | ch | 289,90 | 2,5 |
| Material | Fita de borda | m | 1,2350 | 30 |
| Material | Corrediça | pç | 34,50 | 6 |
| Material | Dobradiça | pç | 8,90 | 12 |
| Serviço | Corte e usinagem | h | 45,00 | 8 |
| Serviço | Montagem | h | 55,00 | 6 |

**Custos adicionais:** Frete **120,00** · Ferragens diversas **45,50**

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 1.931,10 | |
| Lucro | R$ 827,61 | |
| Ajuste de arredondamento | R$ 1,29 | |
| **Preço final** | **R$ 2.760,00** | |

## CT04 — Mesmo custo do CT03 com markup 30% (comparação de modos)

**Dados e lucro:** Markup — sobre o custo · percentual **30** · Para cima, à dezena

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | MDF 18mm | ch | 289,90 | 2,5 |
| Material | Fita de borda | m | 1,2350 | 30 |
| Material | Corrediça | pç | 34,50 | 6 |
| Material | Dobradiça | pç | 8,90 | 12 |
| Serviço | Corte e usinagem | h | 45,00 | 8 |
| Serviço | Montagem | h | 55,00 | 6 |

**Custos adicionais:** Frete **120,00** · Ferragens diversas **45,50**

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 1.931,10 | |
| Lucro | R$ 579,33 | |
| Ajuste de arredondamento | R$ 9,57 | |
| **Preço final** | **R$ 2.520,00** | |

## CT05 — Arredondamento meio para cima na linha (4,5 x 1,2350 = 5,5575)

**Dados e lucro:** Margem — sobre o preço de venda · percentual **20** · Não arredondar (centavos)

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | Fita de borda | m | 1,2350 | 4,5 |
| Material | Cola PVA | kg | 23,9900 | 1,5 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 41,55 | |
| Lucro | R$ 10,39 | |
| Ajuste de arredondamento | R$ 0,00 | |
| **Preço final** | **R$ 51,94** | |

## CT06 — Somente serviços, markup 50%, arredondamento em real inteiro

**Dados e lucro:** Markup — sobre o custo · percentual **50** · Para cima, ao real inteiro

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Serviço | Projeto 3D | h | 80,00 | 4 |
| Serviço | Instalação | h | 55,00 | 5,5 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 622,50 | |
| Lucro | R$ 311,25 | |
| Ajuste de arredondamento | R$ 0,25 | |
| **Preço final** | **R$ 934,00** | |

## CT07 — Um item e dois custos adicionais, margem 45%, dezena

**Dados e lucro:** Margem — sobre o preço de venda · percentual **45** · Para cima, à dezena

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | Chapa MDP 15mm | ch | 198,75 | 3 |

**Custos adicionais:** Frete **90,00** · Deslocamento **60,00**

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 746,25 | |
| Lucro | R$ 610,57 | |
| Ajuste de arredondamento | R$ 3,18 | |
| **Preço final** | **R$ 1.360,00** | |

## CT08 — Doze itens, margem 25%, duas casas

**Dados e lucro:** Margem — sobre o preço de venda · percentual **25** · Não arredondar (centavos)

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | MDF 18mm | ch | 289,90 | 4 |
| Material | MDF 6mm | ch | 169,90 | 2 |
| Material | Fita de borda | m | 1,2350 | 85 |
| Material | Corrediça | pç | 34,50 | 10 |
| Material | Dobradiça | pç | 8,90 | 24 |
| Material | Puxador | pç | 12,75 | 12 |
| Material | Parafuso 4x40 (cento) | un | 18,90 | 2 |
| Material | Cola PVA | kg | 23,99 | 1 |
| Material | Pé regulável | pç | 4,35 | 8 |
| Serviço | Corte e usinagem | h | 45,00 | 14 |
| Serviço | Montagem | h | 55,00 | 10 |
| Serviço | Projeto 3D | h | 80,00 | 3 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 3.832,57 | |
| Lucro | R$ 1.277,52 | |
| Ajuste de arredondamento | R$ 0,00 | |
| **Preço final** | **R$ 5.110,09** | |

## CT09 — Margem alta (60%) com arredondamento em real inteiro

**Dados e lucro:** Margem — sobre o preço de venda · percentual **60** · Para cima, ao real inteiro

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Material | Lâmina de madeira nobre | m² | 412,3300 | 2,25 |
| Serviço | Acabamento manual | h | 65,00 | 6 |

**Custos adicionais:** Frete **75,00**

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 1.392,74 | |
| Lucro | R$ 2.089,11 | |
| Ajuste de arredondamento | R$ 0,15 | |
| **Preço final** | **R$ 3.482,00** | |

## CT10 — Valores mínimos: um serviço de 0,5 hora, markup 0%

**Dados e lucro:** Markup — sobre o custo · percentual **0** · Não arredondar (centavos)

| Tipo | Descrição | Unidade | Valor unitário | Quantidade |
|---|---|---|---|---|
| Serviço | Ajuste de porta | h | 45,00 | 0,5 |

**Custos adicionais:** nenhum

| Memorial | Esperado | Obtido |
|---|---|---|
| Custo direto total | R$ 22,50 | |
| Lucro | R$ 0,00 | |
| Ajuste de arredondamento | R$ 0,00 | |
| **Preço final** | **R$ 22,50** | |

## Resumo para passar ao registro

| Caso | Preço final esperado | Preço final obtido | Diferença | Observação |
|---|---|---|---|---|
| CT01 | R$ 289,90 | | | |
| CT02 | R$ 1.035,36 | | | |
| CT03 | R$ 2.760,00 | | | |
| CT04 | R$ 2.520,00 | | | |
| CT05 | R$ 51,94 | | | |
| CT06 | R$ 934,00 | | | |
| CT07 | R$ 1.360,00 | | | |
| CT08 | R$ 5.110,09 | | | |
| CT09 | R$ 3.482,00 | | | |
| CT10 | R$ 22,50 | | | |

**Data da execução:** ____ · **Navegador:** ____ · **Executado por:** ____

Se algum valor não bater, **não corrija nada**: confira primeiro se digitou igual à tabela. Se estiver igual, anote o caso e os valores obtidos e avise.
