# Handoff

**Atualizado em:** 2026-09-28 · Última sessão: Spec 003 integrada (PR #4); Spec 004 (registro e acompanhamento) aberta, implementada e verificada.

> **Próxima sessão:** a autora revisa o diff da Spec 004 e faz PR e merge (B14); depois, abrir o incremento 005 (clientes) a partir de `main`. Estado detalhado em `ESTADO_ATUAL.md`.

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. **Spec 003 fechada e integrada** em `main` (PR #4, aberto e mesclado pela autora).
2. **Spec 004 implementada:** migração `004-situacoes.sql`; registrar = enviar com número sequencial por marcenaria (D020); transições da RN09 numa tabela única (`TRANSICOES` em `aplicacao/orcamento/orcamento.ts`); vencimento automático; `GET /orcamentos` com busca e filtros; lista na página de orçamentos e tela somente leitura fora de rascunho.
3. **Verificação:** 85 testes de backend (8 novos em `registro.test.ts`, incluindo o teste da RN09 pendente do 003 e CN05/CN06), regressão dos dez casos (domínio não mudou), percurso no Edge e validação manual da autora. Evidência: `evidencias/testes/004-registro-2026-09-28.md`.

Decisões firmes: D001–D020. Nenhuma provisória no momento.

## O que **não** foi feito

- Revisão do diff da Spec 004 pela autora (B14), PR e merge.
- Cliente continua em texto livre (D018): cadastro e vínculo no 005.
- Duplicar ou reabrir orçamento vencido ou enviado (RF40) e desconto (RF33): pós-TCC. Um orçamento registrado com erro não pode ser corrigido; só criando um novo rascunho.
- Entrevista: notas não transcritas; Q6–Q10 sem resposta; consentimento (B06) não confirmado.
- Conferência dos 10 casos em planilha (B08) e execução formal pela tela (008).
- Edição de custo adicional pela tela (a API tem `PUT`; a tela só inclui e remove).

## Contexto que não está óbvio nos arquivos

- O `specify-cli` 1.0.8 foi instalado em `C:\Users\thayr\AppData\Roaming\Python\Python313\Scripts\specify.exe`. Essa pasta ainda não está no `PATH`; para usar o comando manualmente, adicione-a ao `PATH` ou invoque o executável por esse caminho.
- O critério que decide a aprovação do TCC é **diferença nula entre cálculo manual e cálculo do sistema**. Tudo que aumente o risco nesse ponto (ponto flutuante, cálculo duplicado no front-end, arredondamento implícito) é prioridade máxima de prevenção.
- A proposta já foi defendida em banca. Mudar tema, pergunta central, escopo declarado ou critérios de validação exige reavaliação com o orientador — não é decisão de sessão.
- O prazo é curto e a equipe é de uma pessoa: a regra prática é sempre entregar a fatia menor que ainda seja demonstrável.
- A autora precisa entender e defender cada parte do que for gerado. Ao produzir código, explique a lógica em português junto com a entrega.
- **Banco de testes:** o `.env` não tem `DATABASE_URL_TESTE`; o teste de integração deriva `<nome do banco>_teste` de `DATABASE_URL` com as mesmas credenciais. `npm run migrar` usa `DATABASE_URL` (banco principal): para migrar o de teste, aponte `DATABASE_URL` para ele só naquele comando.
- **Toda Spec com migração exige `npm run migrar` também no banco principal** antes de usar o app. Foi exatamente isso que causou o "Ocorreu um erro interno" ao cadastrar o primeiro material (tabelas inexistentes no banco principal).
- **`NUMERIC` do PostgreSQL chega como texto** (`types.setTypeParser(1700, …)` em `backend/src/infra/banco/pool.ts`), e a vírgula decimal é convertida por texto na validação do servidor. Nada passa por `Number`; o 003 deve manter isso.
- **Testes de navegador (Playwright + Edge):** o react-router troca de tela numa *transition*, então `waitForURL` resolve antes de a tela nova existir e o `fill` cai na tela antiga. Esperar o título (`h1`) da página de destino.
- **Frontend:** cores e espaçamentos estão só em variáveis de `frontend/src/index.css` (D014). Telas novas reutilizam `pagina`, `folha`, `campos`, `alerta`, `selo`, sem estilo próprio.
- **Regra RN10 esclarecida (D016):** zero é válido no valor unitário de *item de orçamento*, mas não no catálogo.
- **`DATE` também chega como texto** (`types.setTypeParser(1082, …)` em `pool.ts`). Sem isso, o `pg` cria `Date` com fuso e a data de emissão aparece um dia antes.
- **O domínio só aceita decimal com ponto** (`"12.50"`); a vírgula é convertida na validação Zod da API. Chamar `calcularOrcamento` com `"2,5"` dá `ErroCalculo` de propósito.
- **Markup ≠ "percentual do custo":** o proprietário diz "cobro 250%" querendo dizer 2,5× o custo, que é markup de **150%**. A tela mostra o multiplicador para evitar o engano (D018). Cuidado ao conversar com ele sobre percentuais.
- **`valor_ajustado_manualmente` é coluna gerada** (compara com `valor_unitario_catalogo`); não se grava nela.
- **Migração do 003 foi recriada** (DROP das três tabelas vazias) antes do merge. Depois de integrada em `main`, qualquer mudança de esquema deve ser migração nova (`004-...sql`), nunca edição do `003-orcamento.sql`.
- **Percurso de tela com Playwright:** o rótulo que envolve um `select` inclui o texto da opção no nome acessível; `getByLabel(..., { exact: true })` falha. Localizar por `select[name=...]`.
- **Vencimento é aplicado na leitura** (`vencerOrcamentos` antes de listar, consultar e mudar situação), com a data de São Paulo explícita no SQL. Não há tarefa agendada: um orçamento só aparece vencido quando alguém abre a lista ou o orçamento.
- **Migrações são reaplicadas por inteiro** a cada `npm run migrar`: toda migração nova precisa ser idempotente (`DROP CONSTRAINT IF EXISTS` antes de `ADD CONSTRAINT`, `IF NOT EXISTS` em índices).
- **O classificador de segurança dos comandos falhou por um período** e bloqueou commits; a autora fez o commit manualmente. Se acontecer de novo, pedir a ela o `git commit` e seguir.
- **Commits vão para o GitHub só com `git push`**; a autora estranhou não ver os commits. A branch do 003 já está publicada.


## Perguntas a fazer à autora antes de avançar

1. Revisou o diff da Spec 004? Fez PR e merge?
2. Onde estão as anotações da conversa com o proprietário, e em que data ocorreu? Q6–Q10 foram perguntadas? Houve consentimento?
3. Há prazo definido pela coordenação para a apresentação de andamento (B07)? O roadmap pede os incrementos 001–005 fechados para ela.
