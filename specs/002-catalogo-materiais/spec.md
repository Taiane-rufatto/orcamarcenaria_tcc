# Spec 002 — Catálogo de materiais e serviços

**Branch:** `spec/002-catalogo-materiais`  
**Data:** 2026-09-19  
**Status:** implementada e validada — aguarda revisão humana do diff para fechamento (B12)

## Clarificações

### Sessão 2026-09-19

- Q: Qual é o limite da descrição opcional? → A: até 300 caracteres.
- Q: A unidade de medida pode ser editada antes de haver orçamento? → A: sim.
- Q: Custo e valor unitário aceitam qual precisão? → A: até 4 casas decimais.

### Sessão 2026-09-19 (revisão após uso)

- Q: Um material ou serviço inativado pode voltar a ser ativo? → A: sim (D015). Sem isso, uma inativação por engano só se desfaz no banco, e o nome único por marcenaria impede recadastrar o item.

## Capacidade entregável

O marceneiro poderá cadastrar, buscar, editar, inativar e reativar materiais e serviços próprios para formar seu catálogo. Ficam fora orçamento, cálculo, clientes, PDF, histórico de custo (RF16) e congelamento de valores de itens registrados (RF14, incremento 003).

Será demonstrado por telas de catálogo com cadastro, busca, edição, inativação e reativação, comprovando isolamento entre marcenarias.

## Histórias e critérios verificáveis

### US03 — Material

Cobertura: RF11 e RF12.

- Material com nome, descrição opcional de até 300 caracteres, unidade canônica e custo positivo de até quatro casas é salvo ativo.
- Custo vazio, zero ou negativo não grava (D016); `1,2350` é preservado sem ponto flutuante binário.
- Unidades permitidas: `un`, `m`, `m²`, `ml`, `ch`, `kg`, `L` e `pç`.

### US04 — Manutenção de materiais

Cobertura: RF13 e RF15; RF14 permanece no incremento 003 (D013).

- Busca por nome e filtro por situação exibem apenas registros da marcenaria autenticada.
- Material pode ser editado, inclusive unidade, enquanto não há orçamento.
- Inativação não exclui fisicamente e retira o material da listagem padrão de ativos.
- Material inativo pode ser reativado e volta à listagem padrão com os mesmos dados (D015).

### US05 — Serviços

Cobertura: RF17 e RF18.

- Serviço tem nome, descrição opcional de até 300 caracteres, cobrança por hora ou unidade, valor positivo de até quatro casas e situação.
- Serviço pode ser buscado, editado e inativado com as mesmas regras de isolamento e preservação.
- Serviço inativo pode ser reativado, com as mesmas regras (D015).

## Regras e evidências

- RF11–RF13, RF15, RF17 e RF18: `documentacao/requisitos.md`.
- `marcenaria_id` é obtido apenas da sessão (RNF12/D001); não há exclusão física.
- Custos e valores são decimais exatos no servidor; o frontend apenas os exibe.
- Testes previstos: unidade de validações, integração no `orcamarcenaria_teste` para CRUD e TI01, e validação manual registrada em `evidencias/testes/`.
