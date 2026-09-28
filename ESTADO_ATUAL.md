# Estado Atual

**Atualizado em:** 2026-09-28

> **Incremento 004 — Registro e acompanhamento: implementado e verificado em 2026-09-28** na branch `spec/004-registro-acompanhamento` (85 testes de backend, 13 de frontend, regressão dos dez casos, percurso no Edge e validação manual da autora). **Falta a revisão do diff pela autora (B14)** para o PR e o merge.

## Onde o projeto está

Incrementos 000 a 003 entregues e integrados; 004 pronto para integração. O próximo é o 005 (clientes). O cálculo do orçamento existe em `backend/src/dominio/orcamento/calculo.ts` e é o único ponto do sistema que calcula preço.

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
- [x] **Incremento 004 — Registro e acompanhamento** (RF32, RF34–RF39): lista com busca e filtros, rascunho reaberto para edição, registrar = enviar com número sequencial (D020), aprovado/recusado, vencimento automático, somente leitura fora de rascunho; CN05/CN06, TI01/TI02 verificados (`evidencias/testes/004-registro-2026-09-28.md`) — pendente a revisão do diff (B14)

## Próximo passo (nesta ordem)

1. Autora revisar o diff (`main...spec/004-registro-acompanhamento`), abrir o PR e fazer o merge (B14).
2. Abrir o incremento 005 (clientes: cadastro, busca, inativação e vínculo com o orçamento, RF08–RF10) a partir de `main` atualizada. Ele substitui o `cliente_nome` em texto livre (D018) por vínculo ao cadastro.
3. Transcrever as notas da conversa com o proprietário em `evidencias/entrevista/` e responder Q6–Q10 (B01); confirmar o termo de consentimento (B06).
4. Conferir em planilha os valores de referência dos 10 casos (B08), no mais tardar antes do incremento 008.

## Não fazer agora

- Duplicar qualquer conta de preço fora de `backend/src/dominio/orcamento/` (inclusive no frontend).
- Implementar qualquer item da lista de evolução pós-TCC (`documentacao/roadmap.md` §5), inclusive histórico de custo (RF16).
- Criar pastas de spec antecipadamente: cada uma nasce quando o incremento entra no ciclo.
