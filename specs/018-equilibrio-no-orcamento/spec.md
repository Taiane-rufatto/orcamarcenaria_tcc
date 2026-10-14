# Spec 018 — Lucro de verdade e aviso de lucro mínimo no orçamento

**Branch:** `spec/018-equilibrio-no-orcamento`
**Data:** 2026-10-13
**Status:** implementada e verificada por testes automatizados em 2026-10-13 (D033). **Faltam a conferência dos valores em planilha pela autora e o percurso de tela** (`evidencias/testes/018-equilibrio-no-orcamento-2026-10-13.md`); só então o incremento fecha.
Origem: orientação de 08/10/2026 (ata §6, item S7 da análise da spec 016) e pesquisa de mercado. Diferencial do TCC, parte 1.

## Contexto

O professor Muriel sugeriu uma visão simplificada de ponto de equilíbrio como contribuição do trabalho. A primeira versão (meta mensal e horas de trabalho) foi considerada complicada pela autora, que pediu algo que o marceneiro use de verdade. A pesquisa de mercado mostrou onde está a dor real:

- o erro mais comum é fechar o preço "no olho", e a margem vai sumindo sem a pessoa perceber (Omie);
- o Sebrae manda o preço cobrir os custos **e ainda deixar um lucro desejado**, refazendo a conta quando o mercado paga menos;
- na oficina, o costume é um multiplicador sobre o custo que já embute despesas fixas e lucro.

A situação concreta: o cliente pede desconto, o marceneiro baixa o percentual de lucro e **não sabe mais quanto sobra**. Este incremento mostra isso na hora e avisa.

**Regra de ouro:** o aviso **não altera o preço**. O cálculo do orçamento (`calcularOrcamento`) e os casos CT01–CT10 ficam intactos.

## Histórias e requisitos

- **US17:** como marceneiro, quero ver quanto de lucro sobra em cada orçamento e ser avisado quando ficar abaixo do mínimo que aceito.
- **RF44:** definir o lucro mínimo (% do preço de venda, opcional) em "Minha marcenaria".
- **RF45:** exibir o lucro real e quanto representa do preço de venda.
- **RF46:** avisar quando ficar abaixo do mínimo, sem alterar o preço, sem bloquear e sem constar no PDF.
- Regras **RN12** e **RN13** em `regras-de-calculo.md` §6, fora dos passos do preço.

## Fórmula

```
lucro       = preco_final − custo_direto_total
percentual  = arred2(lucro ÷ preco_final × 100)
aviso       = percentual < lucro_minimo   (só se o mínimo foi definido)
```

O percentual é a margem de verdade e vale para markup e para margem. Preço final zero (orçamento sem itens): não calcula. Lucro mínimo fora de 0 a 100 vale como "não informado". A comparação usa o percentual já arredondado, o mesmo que a tela mostra. Tudo em texto decimal (RN-C01).

### Exemplo conferível à mão (valores fictícios)

Material R$ 1.200,00 + serviço R$ 800,00 + adicional R$ 100,00 = custo direto R$ 2.100,00. Markup de 100%, sem arredondamento: preço final R$ 4.200,00.
Lucro = 4.200,00 − 2.100,00 = **R$ 2.100,00 = 50,00% do preço**. Mínimo de 40%: sem aviso. Mínimo de 60%: **aviso**.
Baixando o markup para 20%: preço R$ 2.520,00, lucro R$ 420,00 = **16,67%**; com mínimo de 30%, **aviso**.
CT03 (preço R$ 2.760,00, custo R$ 1.931,10): lucro R$ 828,90 = 30,03%.

## Capacidade entregável

1. **Entrega:** em "Minha marcenaria", o campo **Lucro mínimo** (opcional); em cada orçamento, o quadro **Lucro de verdade** com o lucro em reais, o percentual do preço, o mínimo e o aviso. A conta fica num único ponto do domínio (`backend/src/dominio/equilibrio/`).
2. **Fica de fora:** mudar o preço ou sugerir preço; bloquear o registro; meta mensal, horas de trabalho, custos operacionais; painel do mês (019); mostrar qualquer coisa disso no PDF do cliente.
3. **Demonstração:** definir lucro mínimo de 30%; abrir um orçamento com markup 100% (lucro 50,00%, "dentro do mínimo"); baixar o percentual de lucro para 20% e ver 16,67% com o aviso; o preço muda só porque o markup mudou, nunca por causa do aviso.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Fórmula conferida pela autora em planilha, com ao menos 4 casos (acima, abaixo, igual ao mínimo, sem mínimo) | Evidência em `evidencias/testes/` + testes de unidade do domínio |
| `calcularOrcamento` e CT01–CT10 inalterados | Suíte do backend inteira e `calculo.ts` sem diff |
| Sem mínimo ou sem itens: nenhum aviso e nenhum erro | Testes de unidade e de integração |
| Validação: vírgula decimal; recusa 0, 100 ou mais, negativo, letras, 3 casas | Testes de integração (400) |
| Isolamento: o mínimo de uma marcenaria não aparece em outra | Teste de integração |
| O lucro e o aviso não aparecem no PDF do cliente | `conteudo-pdf.test.ts` |
| Orçamento registrado acompanha o mínimo atual | Teste de integração |
| Tela: aviso, sem aviso, sem mínimo e sem itens; RNF05 a 1366×768 e 390 px | Testes de componente + percurso de tela |
| Migração idempotente | `npm run migrar` repetido no banco local e no de teste |

## Regras e restrições

- A conta mora só no domínio (AGENTS §4.1); o frontend **exibe** o que a API devolve e não recalcula nada.
- Migração `010-equilibrio.sql`, idempotente: coluna `lucro_minimo` em `configuracao`; remove as colunas da primeira ideia (meta e horas), que nunca foram publicadas.
- Textos de tela em português simples; o aviso informa, não acusa.

## Evidências

`evidencias/testes/018-equilibrio-no-orcamento-2026-10-13.md`, com a conferência da autora e capturas em `018-capturas/`.

## Perguntas em aberto

1. Confirmar com o professor que essa leitura simplificada atende ao que ele chamou de "visão de saúde do negócio".
2. Sinal de entrada de 50% e saldo (prática do setor) pode virar incremento próprio, se a autora quiser.
