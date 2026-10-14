# Evidência — Incrementos 019 (Painel do mês) e 020 (Fornecedor e histórico de preço)

**Data:** 2026-10-14 · **Specs:** `specs/019-painel-do-mes/spec.md` e `specs/020-fornecedor-e-historico-de-preco/spec.md` · **Decisões:** D035 e D034 · **Requisitos:** RF47–RF52, RF16, US18, US19, RN14, RN15

> **Situação:** implementados e verificados por testes automatizados. **Pendente (depende da autora):** percurso de tela no navegador. Por isso os incrementos ainda **não estão fechados**. A migração `011` **não foi aplicada na VPS**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira | **20 arquivos, 209 testes passam**, incluindo os dez casos de cálculo (CT01–CT10) |
| `calculo.ts` (regra do preço) | sem alteração (`git diff` vazio) |
| Suíte do frontend | **5 arquivos, 21 testes passam**; lint e build limpos |
| Migrações `010` e `011` | aplicadas no banco local e no de teste, repetidas sem erro (idempotentes) |

## Painel do mês (019)

| Critério | Resultado | Como |
|---|---|---|
| Contagens, soma, lucro e taxa, incluindo arredondamento, mês vazio e rascunho fora da conta | passa | `tests/unidade/painel.test.ts` (5) |
| Só o mês pedido entra; aprovado de setembro não conta em outubro | passa | `tests/integracao/painel.test.ts` |
| Aguardando e vencido; mês inválido (400); mês atual por padrão; login obrigatório; isolamento entre marcenarias | passa | mesmo arquivo (11 testes) |
| Tela: frases e valores da API, mês sem envios, erro | passa | `src/paginas/Painel.test.tsx` (3) |

**Valores usados (fictícios, conferíveis à mão):** aprovados 4.200,00 (custo 2.100,00) e 2.760,00 (custo 1.931,10); mais um recusado (1.000,00), um vencido (500,00), um enviado (3.000,00) e um rascunho. Resultado: 5 enviados; aprovados 2; valor **R$ 6.960,00**; lucro **R$ 2.928,90** (= 2.100,00 + 828,90), que é **42,08%** do preço; taxa de aprovação **40,00%**.

## Fornecedor e histórico de preço (020)

| Critério | Resultado | Como |
|---|---|---|
| Fornecedor: maiúsculas, editar, buscar, inativar, reativar; nome repetido (409); nome vazio (400) | passa | `tests/integracao/fornecedores.test.ts` |
| Isolamento: fornecedor, confirmação e histórico de outra marcenaria (404 ou 400) | passa | mesmo arquivo |
| Histórico: 1 linha ao criar; custo e fornecedor gravam; só o nome não grava; ordem decrescente | passa | mesmo arquivo |
| Fornecedor inativo ou inexistente não pode ser escolhido (400) | passa | mesmo arquivo |
| Preço antigo: 30 dias não é antigo, 31 é; "Continua o mesmo" renova a data, grava no histórico e mantém o custo | passa | `tests/unidade/preco-antigo.test.ts` + integração |

## Pendente: percurso de tela (a autora executa, local ou na VPS depois da publicação)

1. **Menu:** conferir o menu com seis itens (Painel do mês, Orçamentos, Materiais, Serviços, Clientes, Fornecedores, Minha marcenaria) a 1366×768 e a 390 px (RNF05). O `HANDOFF.md` já alertava que um quinto item pede conferir a largura no celular.
2. **Fornecedores:** cadastrar "Madeireira Central"; Enter cadastra e abre em branco; editar; inativar; reativar.
3. **Materiais:** escolher o fornecedor no MDF; trocar o custo e abrir o painel de edição: o **Histórico de preço** mostra as linhas; mudar só o nome e ver que não aparece linha nova.
4. **Preço antigo:** para ver o selo sem esperar 30 dias, usar um material antigo da base local ou pedir para o assistente envelhecer um material de teste; clicar "Continua o mesmo" e ver "hoje".
5. **Painel do mês:** com orçamentos registrados e aprovados, abrir o painel; trocar o mês; abrir um mês vazio.
6. Conferir que o preço final dos orçamentos não muda em nenhum passo.

## Limites desta evidência

Os testes automatizados não substituem o percurso de tela. O prazo de 30 dias do alerta e a necessidade de mais de um fornecedor por material ainda devem ser confirmados com o seu pai.
