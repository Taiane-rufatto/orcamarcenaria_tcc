# Estado Atual

**Atualizado em:** 2026-10-01

> **Em andamento: incremento 011 — Refinamento visual** (branch `spec/011-refinamento-visual`), executado **antes do 009** porque o 009 aguarda o termo de consentimento (B06). **Ponto de parada (2026-10-01):** visual implementado com a autora (D026, D027): menu lateral, paleta neutra com verde e laranja só em detalhes, listas com painel lateral, orçamento em duas colunas e campo com busca para material, serviço e cliente. Falta o ensaio dos dez casos pela tela (os percursos mudaram: painel lateral e campo com busca) para fechar o 011. Próximo pedido da autora: publicar o sistema para o orientador ver e incluir "Esqueceu sua senha?".
>
> **Incremento 008 — Validação formal do cálculo: entregue e integrado em `main` (PR #9).** Execução formal pela autora: 10 de 10 casos com diferença R$ 0,00 (RNF06). **O 009 (avaliação de uso) aguarda o termo de consentimento (B06)**, que a autora vai validar com o orientador; o material da sessão já está preparado em `evidencias/avaliacao-de-uso/`.

## Onde o projeto está

Incrementos 000 a 008 entregues e integrados em `main` (008 no PR #9). O critério de aprovação do TCC (diferença nula nos dez casos) está verificado. O cálculo do orçamento existe em `backend/src/dominio/orcamento/calculo.ts` e é o único ponto do sistema que calcula preço.

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
- [x] **Preparação do 009:** rascunho do termo de consentimento e roteiro com ficha da sessão de avaliação (`evidencias/avaliacao-de-uso/`)

## Próximo passo (nesta ordem)

1. **Incremento 011 (refinamento visual):** rodar o ensaio dos dez casos pela tela e fechar a spec. Detalhes no topo deste arquivo.
1a. **Publicação para o orientador e "Esqueceu sua senha?"**: pedidos da autora em 2026-10-01, a enquadrar no roadmap antes de implementar.
2. **Autora validar o termo de consentimento com o orientador** (pontos listados no topo do rascunho) e colher a assinatura do proprietário (B06). Com o termo assinado, abrir o 009 e aplicar `roteiro-e-ficha-da-sessao.md`.
3. Opcional: relançar o CT01 com **margem** 0% (foi lançado com markup 0%, mesmo resultado) e informar o navegador usado na execução formal.
4. Transcrever as notas da conversa com o proprietário em `evidencias/entrevista/` e responder Q6–Q10 (B01); confirmar o termo de consentimento (B06).

## Para ver no futuro

- **Separar "salvar" de "enviar" no fluxo do orçamento.** Hoje registrar e enviar são o mesmo passo (D020): o orçamento sai de rascunho direto para `enviado`. Verificar se o certo é primeiro salvar/registrar, depois mudar a situação para `enviado` e, em seguida, para `aprovado` ou `recusado`. Se mudar, é preciso rever a D020, a RN09 (`regras-de-calculo.md` §3) e o incremento 004.
- **Mensagem de quantidade negativa.** Quantidade −1 é bloqueada, mas a tela diz "Informe a quantidade com até 3 casas decimais". Trocar por uma mensagem sobre o sinal (achado no ensaio do 008; não afeta o cálculo).

## Não fazer agora

- Duplicar qualquer conta de preço fora de `backend/src/dominio/orcamento/` (inclusive no frontend).
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5), inclusive histórico de custo (RF16).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
