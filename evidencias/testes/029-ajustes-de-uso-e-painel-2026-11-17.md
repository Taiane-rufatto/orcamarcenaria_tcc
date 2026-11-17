# Evidência — Incremento 029: ajustes de uso e painel

**Data:** 2026-11-17 · **Spec:** `specs/029-ajustes-de-uso-e-painel/spec.md` · **Decisão:** D045 · **Requisitos:** RF37, RF51, RF58, RF61, RN20, RN21

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (autora):** percurso de tela e publicação na VPS (sem migração de banco). O incremento ainda **não está fechado**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira (`npm test`, PowerShell) | **30 arquivos, 327 testes passam**, incluindo CT01–CT10 e `valores-limite.test.ts` (o VL07 tinha um erro de digitação no teste, `'2751.00'` em vez de `'2750.00'`; a autora corrigiu, o cálculo estava certo). |
| Suíte do frontend | **8 arquivos, 34 testes passam**; lint e build limpos |
| `tsc` do backend | sem erros |

Casos de `verificar-calculo`: **nenhum valor, fórmula, arredondamento ou totalizador foi tocado.** O que mudou na exibição (selo "Valor ajustado") é decidido na leitura e não altera valor de item, preço ou memorial. A execução formal dos dez casos pela tela continua sendo a da spec 008 (10 de 10); os CT01–CT10 automatizados passaram na suíte acima.

## Critérios

| Critério | Resultado | Como |
|---|---|---|
| Texto copiado só com materiais, "quantidade unidade nome", cabeçalho do projeto; vazio sem material | passa | `frontend/src/servicos/orcamentos.test.ts` |
| Item no custo atual do catálogo não é "ajustado" (nem depois de "Usar o novo custo"); valor digitado à mão continua | passa | `backend/tests/integracao/compras.test.ts` |
| `soAprovados` conta só "aprovado"; grupos somam os enviados | passa | `tests/unidade/painel.test.ts`, `tests/integracao/painel.test.ts`, `Painel.test.tsx` |
| Frase da meta de vendas e dois grupos de cards | passa | `frontend/src/paginas/Painel.test.tsx` |
| Filtro: duas situações, repetida, inválida (400), formato antigo, campos vazios | passa | `backend/tests/integracao/registro.test.ts` |
| Requisição envia a lista por vírgula; nenhuma marcada vai vazia | passa | `frontend/src/servicos/orcamentos.test.ts` |
| Isolamento entre marcenarias | passa | suíte inteira; a consulta do filtro continua usando o `marcenaria_id` da sessão |

## Observação sobre o ambiente de testes

Iniciado de dentro do Git Bash (o shell das ferramentas do agente), o `vitest run` falha com "failed to find the runner", mesmo em testes antigos. Pelo PowerShell, `npm test` passa com a configuração padrão (backend 327, frontend 34). Descartados como causa: variáveis de ambiente (`VSCODE_*`, `ELECTRON_RUN_AS_NODE`, `PWD`, `HOME`, `TERM`), `PATH`, entrada padrão, cache do Vitest e opções do Node. No Git Bash, `--pool=vmThreads` contorna. Não é problema do projeto; anotado no `HANDOFF.md`.

## Pendente: percurso de tela

1. **Orçamentos:** os botões de situação ligam e desligam; marcar Aprovado e Em produção mostra os dois; nenhum marcado mostra todos; quebra de linha a 390 px.
2. **Orçamento:** no card Itens, "Copiar lista de materiais" copia o texto e ele cola bem no WhatsApp. A seção "Lista de compras" não aparece mais.
3. **Valor ajustado:** com um item de material cujo custo do catálogo mudou, "Usar o novo custo" faz o selo "Valor ajustado" sumir; digitar outro valor faz o selo aparecer.
4. **Materiais:** a linha de ajuda sobre os 30 dias aparece; o selo "Preço antigo" mostra a dica ao passar o mouse.
5. **Painel:** os dois grupos ("Entram" e "Não entram na meta de vendas") e a frase da meta de vendas.
6. **Minha marcenaria:** "Meta de vendas do mês" e a mensagem ao salvar.
