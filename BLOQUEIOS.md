# Bloqueios

Itens que dependem de decisão humana, acesso ou ação externa. Um agente **não** deve resolver nada desta lista por conta própria.

**Atualizado em:** 2026-10-08

| # | Bloqueio | Bloqueia | Responsável | Situação |
|---|---|---|---|---|
| B01 | Entrevista de levantamento com o proprietário não realizada (OE1) | Confirmação de D002, D003, D006 e a revisão de `requisitos.md` §4 | Taiane | Parcial — Q1–Q5 confirmadas pelo proprietário em 2026-09-28 (D017). Falta transcrever as notas em `evidencias/entrevista/` e responder Q6–Q10 |
| B05 | Três orçamentos reais da marcenaria ainda não coletados e anonimizados | Validação das regras de cálculo contra a prática e refinamento dos casos de teste | Taiane | Aberto — pedir na entrevista |
| B06 | Termo de consentimento do participante (RNF16) não assinado | Entrevista (OE1) e avaliação exploratória de uso (OE7) — **impede abrir o 009** | Taiane | Aberto — o proprietário (pai da autora) concordou verbalmente em 2026-09-30; falta o termo assinado. Rascunho em `evidencias/avaliacao-de-uso/termo-de-consentimento-rascunho.md`; a autora vai validá-lo com o orientador (modelo institucional, CEP, conversa de 2026-09-28 já feita, nome da marcenaria) |
| B07 | Data da apresentação de andamento não confirmada com a coordenação | Ajuste fino do calendário do `roadmap.md` §3 | Taiane | Aberto |
| B21 | Revisão humana do diff da Spec 014 (DoD §7.3) | Integração do 014 em `main` e publicação na VPS | Taiane | Aberto — `git diff main...spec/014-cadastro-pelo-teclado`; depois abrir o PR |
| B22 | Revisão humana do diff da Spec 015 e publicação na VPS com backup (DoD §7.3, D032) | Integração do 015 em `main` e migração dos nomes na VPS | Taiane | Aberto — integrar o 014 antes; `git diff main...spec/015-nomes-em-maiusculas`; depois PR, backup e `atualizar.sh main` |

## Como usar este arquivo

- Ao resolver um bloqueio, mova a linha para o histórico abaixo com a data e o que foi decidido.
- Ao encontrar um novo impedimento durante o desenvolvimento, registre aqui **antes** de improvisar uma solução.
- Bloqueio que muda requisito ou arquitetura também vira entrada em `decisoes.md`.

## Histórico de bloqueios resolvidos

| # | Bloqueio | Resolvido em | Como |
|---|---|---|---|
| B02 | Stack não confirmada (D007) | 2026-09-02 | Confirmada a direção da proposta: Node.js + TypeScript, React + TypeScript (Vite) e PostgreSQL, em `backend/` e `frontend/` separados. Registrado em `documentacao/decisoes.md` D007 |
| B04 | Repositório GitHub não criado | 2026-09-18 | Repositório confirmado em `origin` e ramo `main` publicado no GitHub. |
| B09 | PostgreSQL local ainda não instalado/configurado | 2026-09-18 | Rota `GET /saude` validada com `api: "ok"` e `banco: "ok"`. |
| B03 | Spec Kit ainda não instalado no repositório (D008) | 2026-09-18 | CLI oficial `specify` 1.0.8 instalado com integração Codex; infraestrutura `.specify/` e constitution 1.0.0 criadas. |
| B10 | TI01–TI03 exigem material, orçamento e cliente, entregues apenas nos incrementos 002–005 | 2026-09-18 | Confirmado pela autora: TI04 será executado na Spec 001; TI01–TI03 serão executados com as entidades correspondentes e consolidados no incremento 010. Registrado em D011. |
| B11 | Faltava banco exclusivo de testes de integração (`DATABASE_URL_TESTE`) | 2026-09-19 | `orcamarcenaria_teste` criado e liberado ao usuário da aplicação. Migrações e integração executadas nele, sem usar o banco principal. |
| B12 | Revisão humana do diff da Spec 002 (DoD §7.3) | 2026-09-19 | A autora informou que revisou o diff (`git diff main...spec/002-catalogo-materiais`) e autorizou o fechamento, o PR e o merge. |
| B13 | Revisão humana do diff da Spec 003 (DoD §7.3) | 2026-09-28 | A autora autorizou o PR, abriu-o manualmente e fez o merge em `main` (PR #4). |
| B14 | Revisão humana do diff da Spec 004 (DoD §7.3) | 2026-09-28 | A autora revisou, abriu o PR e fez o merge em `main` (PR #5). |
| B15 | Revisão humana do diff da Spec 005 (DoD §7.3) | 2026-09-28 | A autora revisou, abriu o PR e fez o merge em `main` (PR #6). |
| B16 | Revisão humana do diff da Spec 006 (DoD §7.3) | 2026-09-28 | A autora abriu o PR e fez o merge em `main` (PR #7). Não declarou novo teste manual da versão corrigida dos textos; a correção foi verificada no navegador pelo agente. |
| B08 | Valores de referência dos 10 casos de teste não conferidos em planilha pela autora | 2026-09-30 | A autora conferiu os dez casos em `evidencias/testes/conferencia-casos-de-teste.xlsx`: 10 de 10 "Confere", diferença nula em todas as etapas. O 008 pode ser aberto. |
| B17 | Revisão humana do diff da Spec 007 (DoD §7.3) | 2026-09-30 | A autora abriu o PR e fez o merge em `main` (PR #8); confirmou em 2026-09-30 que a pendência pode ser encerrada. |
| B18 | Revisão humana do diff da Spec 011 (DoD §7.3) | 2026-10-08 | A autora aprovou e o 011 foi integrado em `main` (PRs #11 e #12). |
| B19 | Revisão humana do diff da Spec 012 (DoD §7.3) | 2026-10-08 | A autora revisou, abriu o PR e fez o merge em `main` (PR #13). |
| B20 | Revisão humana do diff da Spec 013 (DoD §7.3) | 2026-10-08 | A autora revisou e fez o merge em `main` (PR #14); o comportamento foi revisto no 014. |
