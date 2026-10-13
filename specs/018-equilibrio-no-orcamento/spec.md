# Spec 018 — Meta mensal e aviso de equilíbrio no orçamento

**Branch:** `spec/018-equilibrio-no-orcamento`
**Data:** 2026-10-13
**Status:** implementada e verificada por testes automatizados em 2026-10-13 (D033, fórmula confirmada pela autora). **Faltam a conferência dos valores em planilha pela autora e o percurso de tela** (`evidencias/testes/018-equilibrio-no-orcamento-2026-10-13.md`); só então o incremento fecha. Origem: orientação de 08/10/2026 (ata §6), S7 da análise da spec 016. Diferencial do TCC, parte 1.

## Contexto

O professor Muriel sugeriu, como contribuição do trabalho, uma visão simplificada de ponto de equilíbrio: relacionar o que a marcenaria precisa ganhar por mês, o tempo que tem na agenda, os materiais e o valor cobrado, para o marceneiro perceber **no momento de orçar** se o orçamento corre o risco de não sustentar a operação. O valor de R$ 20 mil mensais da conversa era só um exemplo.

A autora decidiu (2026-10-13) que o diferencial entra no TCC I, com as horas vindo de um **campo no orçamento**. Este incremento é a parte 1: configuração, campo e aviso. O painel do mês é o 019.

**Regra de ouro:** o aviso **não altera o preço**. O indicador só compara e informa. O cálculo do orçamento (`calcularOrcamento`) e os dez casos CT01–CT10 ficam intactos.

## Histórias e requisitos

Nenhuma história existente cobre isto. Propõe-se (a registrar em `requisitos.md` e `historias-de-usuario.md` depois da validação):

- **US17 (nova):** como marceneiro, quero informar quanto preciso ganhar por mês e quantas horas produtivas tenho, e ver ao montar um orçamento se o valor por hora está abaixo do que preciso, para não fechar trabalho que não paga a operação.
- **RF44 (novo):** configurar meta mensal e horas produtivas por mês.
- **RF45 (novo):** informar as horas estimadas de produção no orçamento (opcional).
- **RF46 (novo):** exibir, no orçamento em edição e no consultado, o valor por hora e um aviso quando ficar abaixo do necessário. Sem horas ou sem meta, nenhum aviso.

Regras novas: **RN12** (valor necessário por hora) e **RN13** (valor do orçamento por hora). Entram em `regras-de-calculo.md` como seção própria, separada dos passos 1–9, para deixar claro que não fazem parte do preço.

## Fórmula proposta (a confirmar)

```
contribuicao   = preco_final − subtotal_materiais − total_adicionais
necessario_h   = meta_mensal ÷ horas_produtivas_mes
orcamento_h    = contribuicao ÷ horas_estimadas
aviso          = orcamento_h < necessario_h
```

- **Meta mensal** = quanto precisa **sobrar por mês depois de pagar os materiais**: aluguel, ajudante, energia e a retirada do próprio marceneiro. É a leitura do professor: "o valor cobrado tem que pagar o material e ainda garantir o mínimo".
- **Contribuição** = o que sobra do preço depois do material e dos custos adicionais (frete). Os serviços **não** são descontados, porque na prática o trabalho do marceneiro é justamente o que a meta precisa remunerar; descontá-los contaria a mão de obra duas vezes.
- Arredondamento: `contribuicao` já vem do preço final (duas casas); as divisões por hora usam decimal.js, meio para cima, duas casas, só para exibição e comparação. Tudo em texto decimal, nada passa por `Number` (RN-C01).
- Sem horas estimadas (ou zero), sem meta ou sem horas produtivas: **não calcula e não avisa**. Nada é inventado.

### Exemplo conferível à mão (valores fictícios)

Meta R$ 8.000,00 por mês; 160 horas produtivas por mês → necessário por hora = **R$ 50,00**.
Orçamento com preço final R$ 2.760,00, materiais R$ 1.200,00, adicionais R$ 100,00 → contribuição = 2.760,00 − 1.200,00 − 100,00 = **R$ 1.460,00**.
Com 40 horas estimadas: 1.460,00 ÷ 40 = **R$ 36,50 por hora** → abaixo de 50,00 → **aviso**. Com 25 horas: 58,40 → sem aviso.
(Esses números viram casos de teste de unidade, conferidos pela autora em planilha, como no 008.)

## Capacidade entregável

1. **Entrega:**
   - Em "Minha marcenaria": campos **meta mensal** e **horas produtivas por mês**, opcionais.
   - No orçamento (rascunho e registrado): campo opcional **horas estimadas de produção**; o painel de resumo mostra "valor por hora" e "necessário por hora" e, quando abaixo, um aviso claro, em português simples, sem bloquear nada.
   - A conta num único ponto do domínio (`backend/src/dominio/`), com testes de unidade.
2. **Fica de fora:** painel do mês (019); mudar o preço ou sugerir preço; várias metas, sazonalidade, custos operacionais detalhados, previsão; bloquear o registro por causa do aviso; exportar o indicador para o PDF do cliente (nunca: o cliente não vê custo nem meta, RF42).
3. **Demonstração:** configurar meta R$ 8.000,00 e 160 h; abrir um orçamento de R$ 2.760,00 com materiais R$ 1.200,00 e adicionais R$ 100,00; informar 40 h e ver "R$ 36,50 por hora, abaixo dos R$ 50,00 necessários"; trocar para 25 h e o aviso some; limpar as horas e o aviso some. O preço final continua R$ 2.760,00 em todos os casos.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Fórmula conferida pela autora em planilha, com ao menos 4 casos (abaixo, acima, igual à meta, sem horas) | Evidência em `evidencias/testes/` + testes de unidade do domínio |
| `calcularOrcamento` e CT01–CT10 inalterados | Suíte do backend inteira e comparação do arquivo `calculo.ts` (sem diff) |
| Sem horas, sem meta ou horas produtivas zero: nenhum aviso e nenhum erro | Testes de unidade |
| Valores com vírgula decimal e limites validados (horas > 0, até 2 casas; meta ≥ 0) | Testes de validação da API |
| Isolamento: a meta de uma marcenaria não aparece em outra | Teste de integração |
| O aviso não aparece no PDF do cliente | Teste do conteúdo do PDF (`conteudo-pdf.test.ts`) |
| Tela: aviso aparece e some conforme as horas; RNF05 a 1366×768 e 390 px | Percurso de tela (Edge + Playwright) |
| Migração idempotente, sem perda de dados, aplicável com `npm run migrar` repetido | Execução dupla no banco local e no de teste |

## Regras e restrições

- A conta mora só no domínio (AGENTS §4.1); o frontend **exibe** o que a API devolve e não recalcula nada.
- Migração nova `010-equilibrio.sql`, idempotente: colunas `meta_mensal` e `horas_produtivas_mes` em `configuracao` (NUMERIC, opcionais) e `horas_estimadas` em `orcamento` (NUMERIC, opcional). **Não** editar migrações antigas.
- Orçamento registrado continua somente leitura (RF39): as horas estimadas são editáveis só enquanto for rascunho. O aviso do registrado usa a meta **atual**; a evidência deve explicitar isso.
- Textos de tela em português simples; o aviso informa, não acusa ("o valor por hora ficou abaixo do que você precisa para fechar o mês").

## Evidências

`evidencias/testes/018-equilibrio-no-orcamento-AAAA-MM-DD.md`, com a conferência da autora e capturas em `018-capturas/`.

## Fora do escopo

Painel do mês e taxa de conversão (019); estados de produção; custos operacionais detalhados.

## Perguntas em aberto

1. ~~Confirmar a fórmula~~ — **confirmada pela autora em 2026-10-13 (D033).** Era: a contribuição é `preço final − materiais − custos adicionais`, e a meta é "quanto precisa sobrar por mês depois de pagar os materiais". Alternativa: usar só o lucro (`valor_lucro`), o que dá uma meta menor e mais difícil de explicar. Registrar a escolha em `decisoes.md` (D033).
2. **Rótulo da meta** na tela: "Quanto preciso que sobre por mês, depois de pagar os materiais" serve?
3. Validar com o professor, no próximo contato, que essa leitura atende ao que ele chamou de "visão de saúde do negócio".
