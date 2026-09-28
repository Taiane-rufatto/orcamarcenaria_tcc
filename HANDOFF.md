# Handoff

**Atualizado em:** 2026-09-28 · Última sessão: Specs 003 a 006 integradas (PR #4 a #7); Spec 007 (configurações) aberta, implementada e verificada; RF40 detalhado como evolução pós-TCC.

> **Próxima sessão:** a autora revisa o diff da Spec 007 e faz PR e merge (B17). O 008 depende de a autora conferir os dez casos em planilha (B08). Estado detalhado em `ESTADO_ATUAL.md`.

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. **Specs 003 a 006 fechadas e integradas** em `main` (PR #4 a #7, abertos e mesclados pela autora).
2. **Spec 007 implementada:** migração `007-configuracoes.sql`; `GET /configuracoes`, `PUT /configuracoes/marcenaria` e `/padroes`; orçamento novo com os padrões e validade calculada; página "Minha marcenaria" (com "Alterar senha"); contatos da marcenaria no PDF.
3. **Q6 respondida pela autora: 10 dias** (D024). Q7 respondida pelo modelo do proprietário (D022).
4. **RF40 (duplicar para ajustar orçamento enviado) detalhado em `roadmap.md` §5.1** a pedido da autora, para implementar depois do TCC.
5. **Verificação:** 139 testes de backend em três execuções seguidas, CT03/CT04/CT06 pela configuração, percurso no Edge e validação manual. Evidência: `evidencias/testes/007-configuracoes-2026-09-28.md`.

Decisões firmes: D001–D024. Nenhuma provisória no momento.

## O que **não** foi feito

- Revisão do diff da Spec 007 (B17), PR e merge.
- **Conferência dos dez casos em planilha pela autora (B08)**: bloqueia o 008.
- Duplicar orçamento (RF40), desconto (RF33) e demais itens do `roadmap.md` §5: pós-TCC.
- Entrevista: notas não transcritas; Q8–Q10 sem resposta; consentimento (B06) não confirmado — necessário também para a avaliação de uso (009).
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
- **Testes de integração criam um cliente padrão por conta** (`clientePadrao` em `orcamento.test.ts` e `registro.test.ts`): todo orçamento exige cliente cadastrado desde o 005.
- **A migração 005 só converte enquanto a coluna `cliente_nome` existir** (bloco `DO`); em banco novo, o 003 ainda cria a coluna e o 005 a remove em seguida.
- **Menu no celular:** com quatro itens ele quebra linha; um quinto item pede conferir de novo a largura em 390 px.
- **PDF:** a função de conteúdo (`montarConteudoPdf`) nem recebe custos; o teste de RF42 procura 28 textos internos do CT03 em todo o conteúdo. Mudar o PDF é mudar primeiro o conteúdo e o teste, depois o desenho.
- **Fontes padrão do PDFKit** (Helvetica) cobrem acentos do português, "º" e "•"; caracteres fora do WinAnsi (emoji, alguns símbolos) não aparecem. Não houve necessidade de embutir fonte.
- **Textos do orçamento na tela são estado controlado** (`textos` em `Orcamento.tsx`); outras ações não os apagam, e o registrar grava o que estiver pendente.
- **Testes de integração com limite de 20 s** (`backend/vitest.config.ts`): com 5 s, o cadastro com bcrypt falhava ao acaso quando a suíte inteira rodava em paralelo.
- **Padrões iniciais moram só no banco** (`DEFAULT` da tabela `configuracao`); a linha é criada na primeira leitura (`lerPadroes`). Não repetir valores padrão no código.
- **Edição de rascunho mantém campos omitidos** (`alterarCabecalho`); a criação preenche os omitidos pela configuração (`criarOrcamento`).
- **Commits vão para o GitHub só com `git push`**; a autora estranhou não ver os commits. A branch do 003 já está publicada.


## Perguntas a fazer à autora antes de avançar

1. Revisou o diff da Spec 007? Fez PR e merge?
2. Conferiu em planilha os valores de referência dos dez casos (B08)? Sem isso, o 008 não abre.
3. Houve consentimento do proprietário (B06)? É necessário para a avaliação de uso (009).
4. Há data para a apresentação de andamento (B07)?
