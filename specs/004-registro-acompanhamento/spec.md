# Spec 004 — Registro e acompanhamento do orçamento

**Branch:** `spec/004-registro-acompanhamento`  
**Data:** 2026-09-28  
**Status:** fechada em 2026-09-28 (PR #5)

## Clarificações

### Sessão 2026-09-28

- Q: Registrar e enviar são passos diferentes? → A: não. "Registrar e marcar como enviado" confere RF32, dá o número e trava a edição; rascunhos aparecem na lista sem número (D020).
- Q: É preciso um prazo de validade padrão (Q6, sem resposta do proprietário)? → A: não neste incremento. A data de validade já é informada ao criar o orçamento; o prazo padrão em dias (RF22) é do incremento 007.

## Capacidade entregável

1. **Entrega:** o marceneiro vê a lista dos seus orçamentos (rascunhos e registrados), busca pelo cliente e filtra por situação e período; reabre um rascunho para continuar editando; registra o orçamento, que recebe número sequencial e fica travado; e marca depois se foi aprovado ou recusado. Orçamento enviado com validade vencida aparece como vencido.
2. **Fica de fora:** cadastro e vínculo de cliente (005); PDF (006); prazo de validade padrão e configurações (007); duplicar ou reabrir orçamento vencido (RF40) e desconto (RF33), pós-TCC.
3. **Demonstração:** criar dois rascunhos, registrar um (recebe nº 1 e os campos de edição somem), marcá-lo como aprovado, encontrar os dois na lista pela busca e pelo filtro de situação; reabrir o rascunho e editá-lo.

## Histórias e critérios verificáveis

### US12 — Registrar e localizar orçamentos

Cobertura: RF32, RF34, RF37, RF38.

- Rascunho com cliente, descrição e ao menos um item, ao ser registrado, recebe o próximo número da marcenaria (1, 2, 3…) e passa a `enviado` (RN11, D020). *Verificação:* integração.
- Números são sequenciais por marcenaria, nunca reutilizados, e duas marcenarias têm cada uma o seu nº 1. *Verificação:* integração.
- Registrar sem itens é recusado com indicação do que falta (CN05); sem cliente ou descrição também (CN06). *Verificação:* integração.
- A lista mostra número (ou "rascunho"), cliente, data de emissão, preço final e situação, dos mais recentes aos mais antigos; busca por nome do cliente e filtro por situação e por período de emissão mostram apenas os correspondentes. *Verificação:* integração + validação manual.
- Orçamento registrado é consultado com todos os itens e valores originais (RF38, RN08). *Verificação:* integração (valores iguais antes e depois do registro).

### US13 — Acompanhar a situação do orçamento

Cobertura: RF35, RF36, RF39, RN09.

- Situações e transições exatamente como na RN09: `rascunho → enviado`; `enviado → aprovado`, `enviado → recusado`; `enviado → vencido` automático. Qualquer outra transição é recusada. *Verificação:* integração.
- Orçamento `enviado` com data de validade anterior à data corrente aparece como `vencido` na lista e na consulta (RF36). *Verificação:* integração com validade no passado.
- Fora de `rascunho`, alterar cabeçalho, lucro, itens ou custos adicionais é recusado (409); só a situação muda (RF39). *Verificação:* integração (inclui o teste da RN09 pendente do 003).
- Na tela, orçamento fora de rascunho é exibido só para leitura, com as ações de situação permitidas. *Verificação:* validação manual.

## Regras e restrições

- RN09, RN10 (orçamento com ao menos um item para sair de rascunho) e RN11: `documentacao/regras-de-calculo.md`, sem variação local.
- Nenhuma regra de cálculo muda: registrar não recalcula nem altera valores; o preço registrado é o último gravado pelo domínio (D019).
- `marcenaria_id` vem apenas da sessão; listagem e transições filtram por ele (TI01, TI02).
- Não há exclusão de orçamento.

## Evidências previstas

- Integração no `orcamarcenaria_teste`: registro e numeração, CN05/CN06, transições permitidas e recusadas, vencimento, listagem com filtros, bloqueio de edição fora de rascunho, isolamento.
- Rotina `verificar-calculo`: como nenhum valor muda, reexecução dos dez casos e confirmação de que o registro preserva os totais.
- Validação manual da autora e percurso de tela registrados em `evidencias/testes/004-registro-AAAA-MM-DD.md`.

## Perguntas em aberto

- Nenhuma que bloqueie o plano. A data corrente usada no vencimento é a do servidor de banco; o fuso é tratado no plano.
