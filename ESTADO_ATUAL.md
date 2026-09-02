# Estado Atual

**Atualizado em:** 2026-09-02

## Onde o projeto está

Baseline documental concluída e estrutura de desenvolvimento criada. **Nenhuma linha de código de aplicação escrita ainda.** O projeto está no incremento 000 (Preparação), marco M0.

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

## Em andamento — incremento 000

- [ ] Criar o repositório no GitHub e commitar a linha de base
- [ ] Inicializar o projeto `backend/` (dependências, TypeScript, scripts `dev`, `test`, `migrar`)
- [ ] Inicializar o projeto `frontend/` (Vite + React + TypeScript)
- [ ] Subir o PostgreSQL local e validar a conexão
- [ ] Instalar o Spec Kit e escrever a constitution do projeto (D008)
- [ ] Atualizar `backend/README.md` e `frontend/README.md` com os comandos reais

## Próximo passo (nesta ordem)

1. Commitar esta linha de base **antes de qualquer código** — é ela que será comparada com a documentação final.
2. Realizar a entrevista com o proprietário (`documentacao/roteiro-entrevista.md`) e responder Q1–Q10 em `decisoes.md`.
3. Concluir os itens do incremento 000 acima.
4. Abrir a Spec 001 (conta e acesso) com a rotina `abrir-incremento`.
5. Implementar, verificar e fechar com a rotina `fechar-spec`.

## Não fazer agora

- Escrever código de funcionalidade antes de fechar o incremento 000.
- Começar pelo cálculo sem antes ter conta e catálogo — a ordem do roadmap existe para que cada incremento seja demonstrável.
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
