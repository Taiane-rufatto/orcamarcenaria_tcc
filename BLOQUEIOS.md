# Bloqueios

Itens que dependem de decisão humana, acesso ou ação externa. Um agente **não** deve resolver nada desta lista por conta própria.

**Atualizado em:** 2026-09-18

| # | Bloqueio | Bloqueia | Responsável | Situação |
|---|---|---|---|---|
| B01 | Entrevista de levantamento com o proprietário não realizada (OE1) | Confirmação de D002, D003, D006 e a revisão de `requisitos.md` §4 | Taiane | Aberto — agendar |
| B05 | Três orçamentos reais da marcenaria ainda não coletados e anonimizados | Validação das regras de cálculo contra a prática e refinamento dos casos de teste | Taiane | Aberto — pedir na entrevista |
| B06 | Termo de consentimento do participante (RNF16) não elaborado | Entrevista (OE1) e avaliação exploratória de uso (OE7) | Taiane | Aberto — verificar exigência com o orientador |
| B07 | Data da apresentação de andamento não confirmada com a coordenação | Ajuste fino do calendário do `roadmap.md` §3 | Taiane | Aberto |
| B08 | Valores de referência dos 10 casos de teste ainda não conferidos em planilha pela autora | Uso dos casos como evidência formal (o método da proposta exige cálculo prévio em planilha) | Taiane | Aberto — conferir antes do incremento 008 |

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
