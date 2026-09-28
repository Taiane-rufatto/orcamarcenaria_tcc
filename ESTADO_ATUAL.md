# Estado Atual

**Atualizado em:** 2026-09-28

> **Incremento 003 — Composição e cálculo do orçamento: aberto em 2026-09-28** na branch `spec/003-composicao-calculo`. Spec, plano e tarefas escritos em `specs/003-composicao-calculo/`. Fase 1 (domínio do cálculo, T001–T003) concluída: CT01–CT10 passam com diferença nula. Próximo: persistência (T004). Respostas do proprietário a Q1–Q5 registradas em D017 e D018.

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

1. Autora revisar `backend/src/dominio/orcamento/calculo.ts`; seguir para a Fase 2 (migração e repositório).
2. Transcrever as notas da conversa com o proprietário em `evidencias/entrevista/` e responder Q6–Q10 (B01); confirmar o termo de consentimento (B06).
3. Conferir em planilha os valores de referência dos 10 casos (B08), no mais tardar antes do incremento 008.

## Não fazer agora

- Começar o cálculo sem abrir a Spec 003 pela rotina.
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5), inclusive histórico de custo (RF16).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
