# Tarefas: Conta e acesso

**Entrada**: artefatos de `specs/001-conta-acesso/`  
**Pré-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/autenticacao.openapi.yaml`, `quickstart.md`

**Testes**: solicitados para este incremento; incluir testes unitários, de integração condicionada a banco de testes e validação manual do roteiro.

## Fase 1 — Preparação

**Propósito**: preparar dependências e variáveis necessárias ao incremento.

- [ ] T001 Instalar `bcrypt`, `jsonwebtoken` e `zod` (e tipagens de desenvolvimento) em `backend/package.json` e `backend/package-lock.json`.
- [ ] T002 [P] Instalar `react-router-dom`, Vitest e suporte DOM de testes em `frontend/package.json` e `frontend/package-lock.json`.
- [ ] T003 [P] Documentar `JWT_SECRET`, `JWT_EXPIRACAO` e `DATABASE_URL_TESTE` em `backend/.env.example`.

---

## Fase 2 — Fundamentos bloqueantes

**Propósito**: entregar persistência de conta/sessão, configuração e infraestrutura HTTP que sustentam as duas histórias.

- [ ] T004 Criar as tabelas `marcenaria`, `usuario` e `sessao`, suas chaves, restrições e índices em `backend/migracoes/001-conta-acesso.sql`.
- [ ] T005 Criar o comando seguro de execução da migração em `backend/src/infra/banco/migrar.ts` e registrá-lo em `backend/package.json`.
- [ ] T006 Criar repositórios de conta e sessão com consultas parametrizadas em `backend/src/infra/repositorios/conta-repositorio.ts` e `backend/src/infra/repositorios/sessao-repositorio.ts`.
- [ ] T007 [P] Configurar validações Zod e respostas de erro em português em `backend/src/api/validacoes/autenticacao.ts` e `backend/src/api/middlewares/tratamento-de-erros.ts`.
- [ ] T008 Implementar criação/verificação assíncrona de hash de senha e emissão/verificação JWT HS256 em `backend/src/seguranca/senhas.ts` e `backend/src/seguranca/tokens.ts`.
- [ ] T009 Implementar middleware que valida Bearer JWT e sessão ativa, expondo apenas `usuario_id`, `marcenaria_id` e `sessao_id` no contexto em `backend/src/api/middlewares/autenticacao.ts`.
- [ ] T010 Integrar middlewares, CORS e roteamento base no servidor em `backend/src/servidor.ts`.

**Marco**: as fundações estão prontas; as histórias podem ser implementadas sem criar acesso a dados fora da sessão.

---

## Fase 3 — História de usuário 1: Criar conta (Prioridade P1) 🎯 MVP

**Objetivo**: permitir que uma responsável cadastre sua marcenaria e entre automaticamente, sem guardar senha em texto puro.

**Teste independente**: enviar um cadastro válido, receber token e usuário; repetir o e-mail e receber exatamente “Este e-mail já está em uso”.

### Testes da história 1

- [ ] T011 [P] [US1] Criar testes unitários de senha, token e validação de cadastro em `backend/tests/unidade/autenticacao.test.ts`.
- [ ] T012 [P] [US1] Criar teste de integração obrigatório, isolado por `DATABASE_URL_TESTE`, para cadastro e e-mail duplicado em `backend/tests/integracao/autenticacao.test.ts`.

### Implementação da história 1

- [ ] T013 [US1] Implementar caso de uso de cadastro atômico: criar marcenaria, usuário, sessão e token em `backend/src/aplicacao/autenticacao/cadastrar-conta.ts`.
- [ ] T014 [US1] Expor `POST /auth/cadastro` conforme contrato em `backend/src/api/rotas/autenticacao.ts`.
- [ ] T015 [P] [US1] Criar cliente de autenticação e armazenamento de sessão no navegador em `frontend/src/servicos/autenticacao.ts`.
- [ ] T016 [US1] Criar tela e fluxo de cadastro com mensagens em português em `frontend/src/paginas/Cadastro.tsx` e estilos correspondentes.
- [ ] T017 [US1] Configurar rotas públicas e redirecionamentos do aplicativo em `frontend/src/App.tsx`.

**Marco**: uma marcenaria fictícia consegue criar conta e recebe acesso autenticado.

---

## Fase 4 — História de usuário 2: Entrar e encerrar acesso (Prioridade P1)

**Objetivo**: permitir entrar, ver a área autenticada ainda vazia, sair e bloquear qualquer rota interna sem sessão válida.

**Teste independente**: entrar com credenciais válidas; receber “E-mail ou senha inválidos” tanto para e-mail como para senha incorretos; acessar rota interna sem token e ser direcionada ao login.

### Testes da história 2

- [ ] T018 [P] [US2] Estender testes unitários para falha uniforme de entrada e encerramento de sessão em `backend/tests/unidade/autenticacao.test.ts`.
- [ ] T019 [P] [US2] Estender o teste de integração obrigatório para entrada, saída e rota protegida em `backend/tests/integracao/autenticacao.test.ts`.
- [ ] T020 [P] [US2] Criar teste automatizado TI04 para redirecionar rota interna sem sessão em `frontend/src/componentes/RotaProtegida.test.tsx`.

### Implementação da história 2

- [ ] T021 [US2] Implementar casos de uso de entrar e sair, sempre verificando a sessão persistida, em `backend/src/aplicacao/autenticacao/entrar.ts` e `backend/src/aplicacao/autenticacao/sair.ts`.
- [ ] T022 [US2] Expor `POST /auth/entrar` e `POST /auth/sair` conforme contrato em `backend/src/api/rotas/autenticacao.ts`.
- [ ] T023 [US2] Criar guarda de rota e tela de entrada em `frontend/src/componentes/RotaProtegida.tsx` e `frontend/src/paginas/Entrar.tsx`.
- [ ] T024 [US2] Criar área autenticada com aviso de lista de orçamentos vazia e ação de sair em `frontend/src/paginas/Orcamentos.tsx`.
- [ ] T025 [US2] Integrar entrada, saída, armazenamento de token e redirecionamentos em `frontend/src/App.tsx` e `frontend/src/servicos/autenticacao.ts`.

**Marco**: somente uma sessão válida acessa a área interna e a saída invalida o token no servidor.

---

## Fase 5 — Alterar senha (RF06)

**Objetivo**: permitir troca de senha mediante confirmação da senha atual, encerrando as sessões anteriores.

- [ ] T026 [P] [US3] Cobrir validação de senha atual e invalidação de sessões em `backend/tests/unidade/autenticacao.test.ts`.
- [ ] T027 [US3] Implementar caso de uso de troca de senha, encerrando sessões anteriores e criando a sessão atual, em `backend/src/aplicacao/autenticacao/alterar-senha.ts`.
- [ ] T028 [US3] Expor `PUT /auth/senha` protegido e conforme contrato em `backend/src/api/rotas/autenticacao.ts`.
- [ ] T029 [US3] Criar formulário de alteração de senha na área autenticada em `frontend/src/paginas/Orcamentos.tsx` e integrá-lo em `frontend/src/servicos/autenticacao.ts`.

---

## Fase 6 — Acabamento e evidências

- [ ] T030 Atualizar os comandos reais e o escopo de autenticação em `backend/README.md` e `frontend/README.md`.
- [ ] T031 [P] Registrar as decisões de implementação e as evidências de teste em `documentacao/decisoes.md` e `evidencias/testes/001-conta-acesso-2026-09-19.md`.
- [ ] T032 Executar `npm test` e `npm run build` em `backend/`, e `npm run test` e `npm run build` em `frontend/`; registrar o resultado em `evidencias/testes/001-conta-acesso-2026-09-19.md`.
- [ ] T033 Executar o roteiro de `specs/001-conta-acesso/quickstart.md` com dados fictícios e registrar os itens que dependem da validação manual da autora.
- [ ] T034 Atualizar `ESTADO_ATUAL.md`, `HANDOFF.md`, `BLOQUEIOS.md` e a matriz de `documentacao/qualidade-e-testes.md` para refletir a implementação e a pendência de validação manual.

---

## Dependências e ordem de execução

- Fase 1 não tem dependências.
- Fase 2 depende da Fase 1 e bloqueia todas as histórias.
- US1 depende da Fase 2.
- US2 depende da Fase 2 e consome a sessão criada em US1.
- RF06 depende das fundações e de US2.
- Acabamento depende de todas as implementações.

## Oportunidades de paralelismo

- T002 e T003 podem ocorrer em paralelo com T001.
- T007 e T008 podem ocorrer em paralelo após T001.
- T011 e T012 podem ser escritos em paralelo; igualmente T018 e T019.
- T015 pode avançar em paralelo ao endpoint T014 após a definição de contrato.

## Estratégia de entrega

1. Preparar dependências e persistência, depois executar a migração.
2. Entregar cadastro, testá-lo isoladamente e validar criação automática da sessão.
3. Entregar entrada, saída, proteção de rotas e área autenticada vazia.
4. Adicionar troca de senha e invalidação de sessões.
5. Executar testes/build, registrar evidências e solicitar a validação manual antes de fechar a Spec.
