# Estado Atual

**Atualizado em:** 2026-10-18

> **Endurecimento de segurança (021, D037) e ajustes de uso (022, D036), na mesma branch `spec/018-equilibrio-no-orcamento`, que **já está no GitHub** (o repositório é **público**).** 021: limite de tentativas no login, no cadastro e na recuperação de senha, `/saude` sem detalhe, `JWT_SECRET` forte e `npm audit fix` (0 vulnerabilidades); cabeçalhos do nginx e restrições do systemd são **modelos a aplicar à mão na VPS** (`documentacao/publicacao.md`). 022: CPF/CNPJ opcional no cliente (fora do PDF), busca de orçamento por número, exemplos no arredondamento, mensagem de quantidade negativa e aviso de acesso de teste no criar conta. **Testes automatizados verdes** (backend 255, frontend 24). O que foi chamado de "equilíbrio" é, na tela e na apresentação, o **alerta de lucro mínimo**, não o ponto de equilíbrio completo do orientador (D033). Cada spec 016 a 022 tem agora um `tasks.md`. **Faltam:** percurso de tela de 018 a 022, conferência dos casos em planilha, aplicar migrações `010`, `011` e `012` e as configurações de segurança na VPS (conferir antes que o `JWT_SECRET` tem 32 caracteres ou mais), validar o diferencial com o orientador e abrir o PR. Evidência: `evidencias/testes/021-022-seguranca-e-ajustes-de-uso-2026-10-18.md`.

> **Painel do mês (019, D035) e Fornecedor com histórico de preço (020, D034, RF16 promovido), na mesma branch `spec/018-equilibrio-no-orcamento`.** Painel: orçamentos enviados, aprovados, recusados, vencidos, taxa de aprovação e valor e lucro dos aprovados. Fornecedor: cadastro simples, fornecedor no material, histórico a cada troca ou confirmação de preço e selo "Preço antigo" (mais de 30 dias) com o botão "Continua o mesmo". O quadro de lucro do orçamento foi reescrito em frases simples. **Testes automatizados verdes** (backend 209, frontend 21); **faltam o percurso de tela pela autora** e aplicar as migrações `010` e `011` na VPS (backup antes). Evidência: `evidencias/testes/019-020-painel-e-fornecedor-2026-10-14.md`. Menu com 7 itens: conferir a 390 px.

> **Orientação de 08/10/2026 (spec 016 e 017), branch `spec/018-equilibrio-no-orcamento`.** A ata e a transcrição ficam só no computador da autora (`evidencias/orientacao/`, ignorada pelo Git). **016:** análise das sugestões do professor e plano 017–022 (`specs/016-analise-orientacao/analise.md`), com o diferencial (ponto de equilíbrio) trazido para o TCC I (D033). **017:** diagnóstico de segurança, só leitura, nada corrigido (`specs/017-diagnostico-seguranca/diagnostico.md`): achado de gravidade alta = sem limite de tentativas de login. **018:** lucro de verdade e aviso de lucro mínimo no orçamento (a primeira ideia, meta mensal e horas, foi trocada por ser complicada; pesquisa de mercado em D033), **implementado e com testes automatizados verdes** (backend 176, frontend 18); **faltam a conferência dos valores em planilha pela autora e o percurso de tela** para fechar (`evidencias/testes/018-equilibrio-no-orcamento-2026-10-13.md`). Migração `010` aplicada no banco local e no de teste, **ainda não na VPS**. Termo de consentimento (B06): a autora decidiu não enviar.

> **Incremento 011 — Refinamento visual: fechado e integrado em `main` (PRs #11 e #12), em 2026-10-08.** Menu lateral, paleta neutra, listas com painel lateral, orçamento em duas colunas e campo com busca (D026, D027). Ensaio dos dez casos pela tela (Edge + Playwright): 10 de 10 com diferença R$ 0,00; RNF05 a 1366×768 e 390 px verificado (`evidencias/testes/011-refinamento-visual-2026-10-08.md`).
>
> **Incremento 012 — Publicação e recuperação de senha: fechado e integrado em `main` (PR #13), em 2026-10-08.** Sistema publicado em `https://54-232-52-91.sslip.io` (AWS, nginx + HTTPS, D029), rodando `main`; recuperação de senha por e-mail (RF07, D028) verificada com o Gmail real da conta do sistema (`evidencias/testes/012-publicacao-2026-10-08.md`).
>
> **Incremento 013 — Cadastro em sequência: fechado e integrado em `main` (PR #14), publicado na VPS, em 2026-10-08.** Foi revisto pelo 014.
>
> **Incrementos 014 e 015: fechados, integrados em `main` (PRs #15 e #16) e publicados na VPS em 2026-10-08.** 014 — Cadastro pelo teclado (D031): nos painéis de novo material, serviço e cliente, o Enter cadastra e abre o formulário em branco; o painel só fecha com Esc ou ✕; na edição, Enter salva e fecha. 015 — Nomes em maiúsculas (D032): a API grava em maiúsculas o nome de material, serviço e cliente; a migração `009` converteu os existentes (local e VPS, com backup). Evidências: `evidencias/testes/014-...` e `015-...`. A VPS roda `main` (`186396d`).
>
> **Incremento 008 — Validação formal do cálculo: entregue e integrado em `main` (PR #9).** Execução formal pela autora: 10 de 10 casos com diferença R$ 0,00 (RNF06). **O 009 (avaliação de uso) aguarda o termo de consentimento (B06)**, que a autora vai validar com o orientador; o material da sessão já está preparado em `evidencias/avaliacao-de-uso/`.

## Onde o projeto está

Incrementos 000 a 008 entregues e integrados em `main` (008 no PR #9); o 011 também está integrado (PRs #11 e #12). O critério de aprovação do TCC (diferença nula nos dez casos) está verificado. O cálculo do orçamento existe em `backend/src/dominio/orcamento/calculo.ts` e é o único ponto do sistema que calcula preço.

## Pronto

- [x] Proposta de TCC aprovada e usada como fonte canônica
- [x] Contexto, escopo, premissas e restrições
- [x] Requisitos funcionais (RF01–RF43) e não funcionais (RNF01–RNF26) rastreados aos objetivos específicos
- [x] Histórias de usuário com critérios de aceitação (US01–US16)
- [x] Regras de cálculo com exemplo conferível manualmente (RN01–RN11)
- [x] Arquitetura, modelo de dados e riscos
- [x] Estratégia de testes e os 10 casos com valores de referência calculados
- [x] Roadmap com 11 incrementos e calendário até a defesa
- [x] Governança do repositório (AGENTS, ESTADO_ATUAL, HANDOFF, BLOQUEIOS)
- [x] Roteiro da entrevista de levantamento
- [x] **Stack confirmada (D007):** Node.js + TypeScript, React + TypeScript (Vite), PostgreSQL
- [x] **Estrutura de pastas criada:** `backend/`, `frontend/`, `specs/`, `evidencias/`, com README por área
- [x] **Configuração do VS Code:** settings, extensões recomendadas e configurações de depuração
- [x] **Skills do projeto:** `abrir-incremento`, `verificar-calculo`, `fechar-spec`
- [x] `.editorconfig`, `.gitignore` e `.env.example` de backend e frontend
- [x] Repositório criado e publicado no GitHub, com a linha de base preservada
- [x] Backend Node.js + TypeScript inicializado, com Express, PostgreSQL, decimal.js, testes Vitest e rota `GET /saude`
- [x] PostgreSQL local configurado e validado pela rota `/saude` (`banco: "ok"`)
- [x] Frontend React + TypeScript (Vite) inicializado, com tela de saúde que consulta a API por `src/servicos/api.ts`
- [x] Teste inicial do backend aprovado: 2 testes Vitest
- [x] READMEs de backend e frontend atualizados com os comandos executáveis
- [x] Spec Kit instalado com integração Codex e constitution do projeto criada em `.specify/memory/constitution.md`
- [x] **Incremento 001 — Conta e acesso** (RF01–RF04, RF06): cadastro, entrada, saída, troca de senha, JWT com sessão persistida, isolamento por marcenaria; TI04 verificado (`evidencias/testes/001-conta-acesso-2026-09-19.md`)
- [x] **Incremento 002 — Catálogo de materiais e serviços** (RF11–RF13, RF15, RF17, RF18): cadastro, busca, filtro de situação, edição, inativação e reativação (D015); custo/valor decimal exato com até 4 casas (D016); TI01 verificado (`evidencias/testes/002-catalogo-2026-09-19.md`)
- [x] **Identidade visual do frontend** (D014): verde musgo, laranja de cedro, layout responsivo
- [x] **Respostas do proprietário a Q1–Q5** (D017): markup sobre o custo (2,5× a 2,8×), sem arredondamento, custos adicionais com lucro, chapa inteira
- [x] **Incremento 003 — Composição e cálculo** (RF14, RF23–RF31): orçamento em rascunho com itens do catálogo e avulsos, custos adicionais, margem/markup com multiplicador (D018), arredondamento, memorial de cálculo; recálculo a cada alteração (D019); CT01–CT10 e TI01/TI02 verificados (`evidencias/testes/003-calculo-2026-09-28.md`); integrado em `main` (PR #4)
- [x] **Incremento 004 — Registro e acompanhamento** (RF32, RF34–RF39): lista com busca e filtros, rascunho reaberto para edição, registrar = enviar com número sequencial (D020), aprovado/recusado, vencimento automático, somente leitura fora de rascunho; CN05/CN06, TI01/TI02 verificados (`evidencias/testes/004-registro-2026-09-28.md`); integrado em `main` (PR #5)
- [x] **Incremento 005 — Clientes** (RF08–RF10): cadastro, busca, edição, inativação e reativação; orçamento ligado ao cliente por `cliente_id` (D021), com migração dos nomes em texto livre; TI03 verificado (`evidencias/testes/005-clientes-2026-09-28.md`); integrado em `main` (PR #6)
- [x] **Incremento 006 — Orçamento em PDF** (RF41–RF43, RNF19): PDF de orçamento registrado no formato do modelo do proprietário (especificações, preço em número e por extenso, observações), sem custo nem lucro, lista de materiais opcional (D022); PDFKit (D023); integrado em `main` (PR #7)
- [x] **Incremento 007 — Configurações** (RF05, RF19–RF22): página "Minha marcenaria" com dados da empresa (saem no PDF), padrões de lucro, arredondamento e validade de 10 dias para orçamentos novos (D024); integrado em `main` (PR #8)
- [x] **Incremento 008 — Validação formal do cálculo** (RNF06, RNF21, US15): valores de referência conferidos em planilha pela autora (B08); dez casos lançados pela tela pela autora com diferença R$ 0,00 (execução nº 6); ensaio automatizado com CN01–CN06; D025 (`evidencias/testes/008-validacao-calculo-2026-09-30.md`); integrado em `main` (PR #9)
- [x] **Incremento 011 — Refinamento visual** (RNF02, RNF05, RNF26; D026, D027): menu lateral, painel lateral para criar e editar, campo com busca para material, serviço e cliente, resumo fixo no orçamento; dez casos pela tela 10 de 10 (`evidencias/testes/011-refinamento-visual-2026-10-08.md`); integrado em `main` (PRs #11 e #12)
- [x] **Incremento 012 — Publicação e recuperação de senha** (RF07, RNF14, RNF15, RNF25; D028, D029): site no ar em HTTPS, e-mail de recuperação funcionando pelo Gmail do sistema; integrado em `main` (PR #13)
- [x] **Incremento 013 — Cadastro em sequência** (US03, US05, US06; D030): "Salvar e cadastrar outro" em materiais, serviços e clientes; integrado em `main` (PR #14), revisto pelo 014
- [x] **Incremento 014 — Cadastro pelo teclado** (US03, US05, US06; D031): Enter cadastra e continua, Esc ou ✕ fecham; integrado em `main` (PR #15) e publicado
- [x] **Incremento 015 — Nomes em maiúsculas** (US03, US05, US06; D032): nome gravado em maiúsculas pela API, migração dos existentes; integrado em `main` (PR #16) e publicado na VPS
- [x] **Preparação do 009:** rascunho do termo de consentimento e roteiro com ficha da sessão de avaliação (`evidencias/avaliacao-de-uso/`)

## Próximo passo (nesta ordem)

0. **Fechar o 018, o 019 e o 020:** conferir os quatro casos da evidência em planilha, fazer o percurso de tela (passos na evidência), revisar o diff e abrir o PR. Depois, **019 (painel do mês)**, **020 (ajustes de uso e CPF/CNPJ)**; 021 (fornecedor e histórico de preço) e 022 (duplicar) só se houver prazo. Um incremento de **endurecimento de segurança** (limite de tentativas, `npm audit fix`, cabeçalhos no nginx, backup agendado) fica antes de divulgar mais o link. Validar com o professor a leitura simplificada do ponto de equilíbrio e confirmar com ele o formato do TCC I.

1. **Antes de enviar o link ao orientador:** conferir no site publicado o orçamento CT03 (R$ 2.760,00) e revisar a base publicada, que deve ter só dados fictícios (RNF15); comentar com o orientador a entrada do RF07 (D028) e que os nomes do catálogo ficam em maiúsculas (D032).
2. **Avaliação de uso (009):** a autora decidiu não enviar o termo de consentimento (B06 resolvido em 2026-10-13). Decidir quando aplicar `roteiro-e-ficha-da-sessao.md` com o proprietário.
3. Opcional: relançar o CT01 com **margem** 0% (foi lançado com markup 0%, mesmo resultado) e informar o navegador usado na execução formal.
4. Transcrever as notas da conversa com o proprietário em `evidencias/entrevista/` e responder Q6–Q10 (B01).

## Para ver no futuro

- **Separar "salvar" de "enviar" no fluxo do orçamento.** Hoje registrar e enviar são o mesmo passo (D020): o orçamento sai de rascunho direto para `enviado`. Verificar se o certo é primeiro salvar/registrar, depois mudar a situação para `enviado` e, em seguida, para `aprovado` ou `recusado`. Se mudar, é preciso rever a D020, a RN09 (`regras-de-calculo.md` §3) e o incremento 004.
- **Mensagem de quantidade negativa.** Quantidade −1 é bloqueada, mas a tela diz "Informe a quantidade com até 3 casas decimais". Trocar por uma mensagem sobre o sinal (achado no ensaio do 008; não afeta o cálculo).

## Não fazer agora

- Duplicar qualquer conta de preço fora de `backend/src/dominio/orcamento/` (inclusive no frontend).
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5), inclusive histórico de custo (RF16).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
