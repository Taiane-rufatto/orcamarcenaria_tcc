# Estado Atual

**Atualizado em:** 2026-09-19

> **Incremento corrente:** 002 — Catálogo de materiais e serviços, na branch `spec/002-catalogo-materiais`. Implementado, testado (25 testes de backend, TI01, builds e lint) e validado manualmente pela autora. **Falta somente a revisão humana do diff (Definição de Pronto §7.3, bloqueio B12)** para declarar a Spec fechada e integrar a branch.

## Onde o projeto está

Incrementos 000 (preparação), 001 (conta e acesso) e 002 (catálogo) entregues. O próximo é o 003 — composição e cálculo do orçamento, o núcleo do TCC. Ainda não existe nenhuma regra de cálculo implementada (`backend/src/dominio/orcamento/` está vazio).

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

## Próximo passo (nesta ordem)

1. A autora revisa o diff da Spec 002 (`git diff main...spec/002-catalogo-materiais`) e confirma o fechamento (B12).
2. Abrir o Pull Request e integrar a branch em `main`.
3. Recomendado antes do 003: realizar a entrevista com o proprietário (`documentacao/roteiro-entrevista.md`, B01) e responder Q1–Q10 em `decisoes.md`. D002, D003 e D006 (margem/markup, arredondamento, lucro sobre custos adicionais) são provisórias e o 003 as implementa; se a entrevista não puder vir antes, seguir com elas e registrar o risco.
4. Abrir o incremento 003 com a rotina `abrir-incremento`.

## Não fazer agora

- Começar o cálculo sem abrir a Spec 003 pela rotina.
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5), inclusive histórico de custo (RF16).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
