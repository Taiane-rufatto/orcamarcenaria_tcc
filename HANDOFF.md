# Handoff

**Atualizado em:** 2026-10-08 · Última sessão: 014 (cadastro pelo teclado) e 015 (nomes em maiúsculas) fechados.

> **Próxima sessão:** 014 e 015 estão fechados e enviados, aguardando a revisão do diff e os PRs (B21, B22), na ordem 014 → 015. Antes de publicar o 015 na VPS, **backup do banco**: a migração `009` converte os nomes e é irreversível. O 009 (avaliação de uso) volta quando o termo estiver assinado (material em `evidencias/avaliacao-de-uso/`).

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. **014 — Cadastro pelo teclado (D031):** nos painéis de novo cadastro, o Enter grava e abre o formulário em branco; só Esc ou ✕ fecham; na edição, Enter salva e fecha. Trava contra Enter repetido.
2. **015 — Nomes em maiúsculas (D032):** a API grava em maiúsculas (`nomeEmMaiusculas`, `pt-BR`) o nome de material, serviço e cliente; o campo Nome mostra maiúsculas ao digitar (`text-transform`). Migração `009` converte os existentes; aplicada no banco local (60 materiais, 23 serviços, 27 clientes), com backup em `~/backups-orca/`; na VPS são 6, 3 e 4, sem colisões, **ainda não aplicada**. Nove testes antigos tiveram a expectativa trocada para maiúsculas.

Decisões firmes: D001–D032. Nenhuma provisória no momento.

## O que **não** foi feito

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
- **A autora lança casos de teste com descrições próprias** ("Armário de cozinha", "cama"), não com o código do caso. Para ler os valores, associar pelo banco (modo, percentual, arredondamento, custo direto e número de itens) e excluir a conta "Marcenaria Ensaio 008". O nome da conta dela não vai para as evidências.
- **Ensaio do 008:** script Playwright fora do repositório; a conta "Marcenaria Ensaio 008" (dados fictícios) ficou no banco principal, isolada das demais.
- **Mensagens de erro chegam num `[role=alert]`** da página do orçamento; CN06 (sem cliente) é barrado pela validação nativa do navegador (`select required`), não pela API.

- **Ensaio do 011:** Playwright (`playwright-core` + Edge) não está no repositório; o script ficou fora dele, como no 008. Para repetir: instalar `playwright-core` numa pasta temporária, subir `npm run dev` (API, porta 3333) e `npx vite --port 5173`, e ler os casos de `008-roteiro-casos-pela-tela.md`. O `CampoBusca` é um `role=combobox` (rótulo "Cliente", "Material", "Serviço") e as opções são `role=option`; o painel lateral é um `dialog[open]`. A conta "Marcenaria Ensaio 011 …" (dados fictícios) ficou no banco principal, isolada das demais.
- **VPS (AWS):** acesso por `ssh -i ~/.ssh/orcamarcenaria-key.pem ubuntu@54.232.52.91`; aplicação em `/opt/orcamarcenaria` (dono `orcamarcenaria`, por isso o `git` como `ubuntu` reclama de "dubious ownership": usar `sudo -u orcamarcenaria git …`); `.env` em `/opt/orcamarcenaria/backend/.env`; log com `journalctl -u orcamarcenaria-api`. O site roda `main` (`atualizar.sh main`); para publicar uma mudança nova, integrar em `main` e rodar o script na VPS.
- **A tela de recuperação responde igual para e-mail sem conta** (de propósito, RF07). Quando "não chega e-mail", primeiro ver o log: `SMTP não configurado`, `535` ou `ETIMEDOUT` dizem o motivo; nenhuma linha quer dizer que o e-mail digitado não tem conta. Um segundo pedido em menos de 1 minuto é ignorado.
- **Nunca pedir senhas e chaves pelo chat:** a senha de app do Gmail foi colocada no `.env` pela própria autora, e só os nomes das variáveis foram conferidos.
- **Painel de novo cadastro (014):** `cadastrarOutro = !editando`; depois de gravar, `formulario.reset()` e o foco volta ao Nome, e a unidade (material) ou o tipo de cobrança (serviço) é reposta à mão porque o `reset()` a devolveria ao padrão. Uma `useRef` (`salvando`) barra o segundo Enter enquanto o envio anterior não terminou; sem ela, Enter repetido grava duas vezes.
- **Ensaio de tela e o painel:** depois do 014, "Cadastrar ..." deixa o painel aberto; scripts que esperavam o painel fechar precisam apertar Esc.
- **Nomes em maiúsculas (015):** a regra mora só em `nomeEmMaiusculas` (`backend/src/api/validacoes/catalogo.ts`); material, serviço e cliente a usam. O banco não força: quem inserir direto no SQL pode gravar caixa mista. A migração `009` é reaplicada a cada `npm run migrar` (idempotente) e **para** se dois nomes de uma marcenaria colidirem em maiúsculas. O `UNIQUE (marcenaria_id, nome)` de material e serviço passou a valer sem diferenciar caixa. `upper()` do PostgreSQL trata acentos tanto no banco local quanto no da VPS (`C.UTF-8`); `psql` no Windows precisa de `PGCLIENTENCODING=UTF8` para aceitar acentos digitados.
- **Testes que dependem do nome do cadastro:** o nome volta em maiúsculas (`JOÃO FICTÍCIO`, `CORTE E USINAGEM`); as descrições de itens avulsos e do projeto continuam como digitadas.

## Perguntas a fazer à autora antes de avançar

1. O orientador validou o termo de consentimento? O proprietário assinou (B06)? Sem isso o 009 não abre.
2. Há data para a apresentação de andamento (B07)?
