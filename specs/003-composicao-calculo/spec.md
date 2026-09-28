# Spec 003 — Composição e cálculo do orçamento

**Branch:** `spec/003-composicao-calculo`  
**Data:** 2026-09-28  
**Status:** fechada em 2026-09-28 (PR #4)

## Clarificações

### Sessão 2026-09-28

- Q: O lucro é calculado sobre o custo ou sobre o preço? → A: sobre o custo (markup). O proprietário cobra de 250% a 280% do custo, ou seja, markup de 150% a 180% (D017).
- Q: Como informar "2,5× o custo" sem digitar 250 por engano? → A: a RN06 não muda; no modo markup, a tela e o memorial exibem o multiplicador equivalente calculado pelo servidor (D018).
- Q: Custos adicionais recebem lucro? → A: sim, conforme RN04 e D006, confirmadas pelo proprietário (D017).
- Q: Qual arredondamento usar? → A: padrão `duas_casas`, pois o proprietário não arredonda (D003, D017).
- Q: Como tratar o cliente antes do incremento 005? → A: nome em texto livre (D018).

## Capacidade entregável

1. **Entrega:** o marceneiro cria um orçamento em rascunho, com nome do cliente, descrição do projeto e datas. Nele, adiciona materiais e serviços do catálogo, itens avulsos e custos adicionais, escolhe modo e percentual de lucro e arredondamento, e vê o preço final com o memorial de cálculo, recalculado pelo servidor a cada alteração.
2. **Fica de fora:** número sequencial, situações além de `rascunho`, listagem e consulta de orçamentos (004); cadastro e vínculo de cliente (005); PDF (006); tela de configurações e padrões por marcenaria (007); desconto (RF33) e duplicação (RF40), pós-TCC.
3. **Demonstração:** montar na tela o orçamento do exemplo de `regras-de-calculo.md` §4 e obter o memorial com preço final de R$ 2.760,00 (margem 30%, dezena), e o mesmo custo em markup 150% mostrando "2,50×". A suíte do domínio executa os dez casos CT01–CT10 com diferença nula.

## Histórias e critérios verificáveis

### US07 — Compor um orçamento a partir do catálogo

Cobertura: RF23, RF24, RF25, RF27.

- Orçamento é criado em `rascunho` com cliente (texto, obrigatório), descrição do projeto, data de emissão (padrão: hoje) e data de validade ≥ emissão (RN10). *Verificação:* teste de integração da API.
- Ao adicionar material ou serviço ativo do catálogo com quantidade > 0, o item copia descrição, unidade e valor unitário (RN08), e `valor_linha` segue RN01/RN02. *Verificação:* teste de integração + unidade do domínio.
- Material ou serviço inativo não pode ser adicionado. *Verificação:* teste de integração.
- Alterar quantidade ou remover item devolve todos os totais recalculados na mesma resposta (RF29, RNF02). *Verificação:* teste de integração + validação manual.

### US08 — Ajustar valor apenas naquele orçamento

Cobertura: RF24, RF26, RN03, RN08; RF14.

- Alterar o valor unitário de um item não muda o catálogo e marca `valor_ajustado_manualmente`. *Verificação:* teste de integração consultando o catálogo depois.
- Alterar o custo de um material no catálogo não muda itens já incluídos em orçamentos (RF14). *Verificação:* teste de integração.
- Item avulso (descrição, tipo, unidade, quantidade, valor unitário ≥ 0) compõe o subtotal do seu tipo (RN03). *Verificação:* unidade do domínio + integração.

### US09 — Incluir custos adicionais

Cobertura: RF28, RN04.

- Custos adicionais (descrição e valor > 0) somam em `total_adicionais`, integram o custo direto e recebem lucro. *Verificação:* CT07.

### US10 — Aplicar lucro e ver o preço final

Cobertura: RF29, RF30, RN05, RN06, RN07. RF19–RF21 (configuração por marcenaria) ficam no 007.

- O orçamento guarda seu próprio modo, percentual e regra de arredondamento. No 003, os valores iniciais são fixos: markup, 150,00% e `duas_casas` (D017). *Verificação:* teste de integração.
- Margem 30% sobre R$ 1.931,10 → preço bruto R$ 2.758,71 e lucro R$ 827,61; markup 30% → R$ 2.510,43; dezena sobre R$ 2.758,71 → R$ 2.760,00 com ajuste de R$ 1,29. *Verificação:* CT03 e CT04.
- Margem ≥ 100 ou markup < 0 é recusada pelo servidor com mensagem em português. *Verificação:* unidade do domínio + integração.
- No modo markup, a resposta inclui o multiplicador equivalente `1 + markup/100` (150% → 2,50×) (D018). *Verificação:* teste de unidade do domínio.

### US11 — Conferir o cálculo passo a passo

Cobertura: RF31, RNF06.

- A tela exibe o memorial na ordem e com os rótulos de `regras-de-calculo.md` §5, com o modo e o percentual (e o multiplicador, no markup). *Verificação:* validação manual registrada.
- Repetir as operações do memorial à mão dá exatamente o preço final. *Verificação:* CT01–CT10 automatizados.

## Regras e restrições

- Fonte única do cálculo: `documentacao/regras-de-calculo.md` (RN-C01, RN-C02, RN01–RN08, RN10). Nenhuma regra é reescrita aqui.
- O cálculo vive só em `backend/src/dominio/orcamento/`, em decimal exato (D005). O frontend não recalcula nem deriva valores.
- `marcenaria_id` vem apenas da sessão; itens do catálogo de outra marcenaria são recusados (RNF12).
- Não há exclusão física do orçamento; remover item ou custo adicional de um rascunho é edição da composição, não exclusão de cadastro.
- RN09 (situações) e RN11 (numeração) são do incremento 004. Aqui todo orçamento permanece em `rascunho`.

## Evidências previstas

- Testes de unidade do domínio: CT01–CT10 de `qualidade-e-testes.md` §3, validações da RN10 e o multiplicador da D018.
- Testes de integração no `orcamarcenaria_teste`: composição, congelamento (RF14) e isolamento entre marcenarias.
- Rotina `verificar-calculo` executada e registrada em `evidencias/testes/003-calculo-AAAA-MM-DD.md`.
- Validação manual da autora com o exemplo do §4.

## Perguntas em aberto

- Nenhuma que bloqueie o plano. As questões Q6–Q10 (validade, visão do cliente, uso da tela) não afetam este incremento.
