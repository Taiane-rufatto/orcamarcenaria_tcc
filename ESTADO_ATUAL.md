# Estado Atual

**Atualizado em:** 2026-09-18

## Onde o projeto está

Incremento 000 (Preparação) está concluído. O incremento 001 (Conta e acesso) foi aberto na branch `spec/001-conta-acesso`; sua especificação aguarda apenas a decisão de método registrada em B10 antes do planejamento.

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

## Em andamento — incremento 001 (Conta e acesso)

- [x] Branch `spec/001-conta-acesso` criada
- [x] Spec e checklist de qualidade criados em `specs/001-conta-acesso/`
- [ ] Resolver B10 e concluir a clarificação antes do planejamento

## Próximo passo (nesta ordem)

1. Decidir B10 e atualizar a Spec 001 com o critério de isolamento aplicável.
2. Executar o planejamento da Spec 001.
3. Realizar a entrevista com o proprietário (`documentacao/roteiro-entrevista.md`) e responder Q1–Q10 em `decisoes.md`.
4. Implementar, verificar e fechar cada incremento com as rotinas do projeto.

## Não fazer agora

- Abrir ou implementar o incremento 001 sem instalar o Spec Kit e criar sua Spec.
- Começar pelo cálculo sem antes ter conta e catálogo — a ordem do roadmap existe para que cada incremento seja demonstrável.
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
