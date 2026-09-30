# Spec 008 — Validação formal do cálculo

**Branch:** `spec/008-validacao-calculo`
**Data:** 2026-09-30
**Status:** fechada em 2026-09-30 (10 de 10, diff revisado pela autora); aguardando PR e merge

## Clarificações

### Sessão 2026-09-30

- Q: Quem faz a execução formal dos dez casos pela tela? → A: a autora, à mão. Antes, o agente faz um ensaio com o navegador automatizado para achar problemas; o ensaio é evidência complementar, não a execução formal (D025).
- Q: Os itens entram pelo catálogo ou como avulsos? → A: como itens avulsos, com o valor unitário do caso (D025).

## Capacidade entregável

1. **Entrega:** os dez casos de `qualidade-e-testes.md` §3 lançados pela tela, um orçamento por caso, com o preço final comparado ao valor de referência já conferido em planilha (B08). Os casos negativos CN01–CN06 também são verificados pela tela. O resultado fica registrado em `resultado-casos-de-teste.md` como a execução formal.
2. **Fica de fora:** qualquer mudança de fórmula ou de tela (se um caso divergir, a correção segue `AGENTS.md` §4.3 e a tabela inteira é reexecutada); avaliação de uso com o proprietário (009); reexecução completa do isolamento (010).
3. **Demonstração:** a tabela de `resultado-casos-de-teste.md` com 10 de 10 casos com diferença R$ 0,00, executados pela autora na tela, e o roteiro usado.

## Requisitos e critérios verificáveis

| Requisito / história | Critério | Verificação |
|---|---|---|
| RNF06, US15 | Os dez casos lançados pela tela têm preço final igual ao de referência (diferença R$ 0,00) | Execução pela autora, registrada caso a caso |
| RNF06 | Custo direto, lucro e ajuste de arredondamento exibidos no memorial também iguais à referência | Anotado na mesma execução |
| RNF21 | Suíte automatizada cobre os dez casos e passa | `backend/tests/unidade/calculo.test.ts` na versão executada |
| RN10 (CN01–CN06) | Cada entrada inválida é bloqueada pela tela com mensagem | Ensaio automatizado + conferência da autora |

## Regras e restrições

- Regras de cálculo: `regras-de-calculo.md`, sem alteração. Valores de referência: `casos-de-teste-referencia.csv`, conferidos em planilha (B08).
- Divergência não é corrigida no momento: é registrada como defeito, analisada e, após correção, **a tabela inteira** é reexecutada (`qualidade-e-testes.md` §3.3).

## Evidências previstas

- Roteiro dos dez casos em termos de tela: `evidencias/testes/008-roteiro-casos-pela-tela.md`.
- Ensaio automatizado (Edge dirigido por Playwright) e execução formal da autora em `evidencias/testes/008-validacao-calculo-AAAA-MM-DD.md`.
- Execução formal registrada em `resultado-casos-de-teste.md`; matriz de `qualidade-e-testes.md` §6 atualizada (RNF06, RNF21).

## Perguntas em aberto

- Nenhuma.
