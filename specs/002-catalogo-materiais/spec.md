# Spec 002 — Catálogo de materiais e serviços

**Branch:** `spec/002-catalogo-materiais`  
**Data:** 2026-09-19  
**Status:** aberta — aguarda clarificação antes do planejamento

## Capacidade entregável

O marceneiro poderá cadastrar, buscar, editar e inativar materiais e serviços próprios, para preparar o catálogo usado nos próximos orçamentos.

Ficam fora deste incremento a composição de orçamento, o congelamento de valores de itens já registrados (RF14), histórico de custo (RF16), clientes, PDF e cálculo de preço.

A demonstração será feita nas telas de catálogo: cadastrar um material com custo decimal e um serviço; buscá-los; editar; inativar; e confirmar que nenhum registro de outra marcenaria aparece.

## Histórias e critérios verificáveis

### US03 — Cadastrar material com unidade e custo

Cobertura: RF11 e RF12.

- Material válido com nome, unidade da lista canônica e custo unitário positivo é salvo como ativo e aparece na listagem.
- Custo vazio, zero ou negativo é recusado sem gravar.
- Um custo como `1,2350` permanece exato ao salvar e reabrir; a interface não usa ponto flutuante binário.

### US04 — Manter o catálogo atualizado

Cobertura neste incremento: RF13 e RF15. RF14 permanece no incremento 003 conforme D013.

- A listagem busca por nome e filtra materiais ativos ou inativos, sempre da marcenaria da sessão.
- Editar material altera os dados do catálogo próprio.
- Inativar material o remove da listagem padrão de ativos, sem exclusão física.

### US05 — Cadastrar e manter serviços

Cobertura: RF17 e RF18.

- Serviço válido aceita nome, descrição opcional, cobrança por hora ou unidade, valor unitário positivo e situação ativa.
- Serviços podem ser buscados, editados e inativados com as mesmas regras de isolamento e preservação aplicadas aos materiais.

## Regras e fontes canônicas

- RF11–RF13, RF15, RF17 e RF18: `documentacao/requisitos.md`.
- Unidades de material: `un`, `m`, `m²`, `ml`, `ch`, `kg`, `L` e `pç` (RF12).
- `marcenaria_id` vem exclusivamente da sessão (RNF12 e D001).
- Inativação substitui exclusão física (RNF10).
- Custos unitários são decimais exatos no servidor; a interface apenas recebe e exibe valores.

## Evidências previstas

- Testes unitários para validação de custo decimal e unidades.
- Integração no banco `orcamarcenaria_teste` para cadastro, busca, edição, inativação e isolamento TI01.
- Validação manual das telas de materiais e serviços, registrada em `evidencias/testes/`.

## Perguntas a esclarecer antes do plano

1. A descrição opcional do material e do serviço tem limite de caracteres definido?
2. A edição de material deve permitir mudar a unidade de medida antes de existir orçamento? A Spec assume que sim.
3. O custo e o valor de serviço aceitam até quatro casas decimais, como indica US03? A Spec assume que sim para preservar precisão.
