# Handoff

**Atualizado em:** 2026-09-02 · Última sessão: montagem do baseline de engenharia a partir da proposta de TCC.

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. Extração das três fontes (proposta de TCC, ata da segunda orientação coletiva e guia de metodologia incremental) e produção da linha de base documental completa: contexto e escopo, requisitos, histórias, regras de cálculo, arquitetura, qualidade e testes, roadmap, decisões, roteiro de entrevista e governança.
2. Confirmação da stack (D007) e criação da estrutura de desenvolvimento: `backend/` e `frontend/` com suas subpastas e READMEs, `.vscode/`, `.editorconfig`, `.gitignore` e `.env.example`.
3. Criação das três skills do projeto em `.claude/skills/` (D009), escritas do zero para este repositório.

Decisões firmes: D001 (multi-tenant simples), D004 (congelamento de valores), D005 (cálculo único no servidor em decimal exato), D007 (stack), D009 (skills). Provisórias, aguardando a entrevista: D002, D003, D006. Aberta: D008 (instalar e confirmar o Spec Kit).

## O que **não** foi feito

- Repositório Git ainda não criado.
- Projetos `backend/` e `frontend/` ainda não inicializados: sem `package.json`, sem dependências, sem scripts. As pastas existem com `.gitkeep`; os READMEs descrevem o que vai em cada uma.
- PostgreSQL local não instalado.
- Entrevista de levantamento não realizada — por isso a §4 de `requisitos.md` existe.
- Casos de teste calculados por script de referência, mas ainda não conferidos em planilha pela autora (exigência do método da proposta).

## Contexto que não está óbvio nos arquivos

- O critério que decide a aprovação do TCC é **diferença nula entre cálculo manual e cálculo do sistema**. Tudo que aumente o risco nesse ponto (ponto flutuante, cálculo duplicado no front-end, arredondamento implícito) é prioridade máxima de prevenção.
- A proposta já foi defendida em banca. Mudar tema, pergunta central, escopo declarado ou critérios de validação exige reavaliação com o orientador — não é decisão de sessão.
- O prazo é curto e a equipe é de uma pessoa: a regra prática é sempre entregar a fatia menor que ainda seja demonstrável.
- A autora precisa entender e defender cada parte do que for gerado. Ao produzir código, explique a lógica em português junto com a entrega.

## Perguntas a fazer à autora antes de avançar

1. A entrevista com o proprietário já ocorreu? Em caso afirmativo, onde estão as notas?
2. Os projetos `backend/` e `frontend/` já foram inicializados? O PostgreSQL local está rodando?
3. O Spec Kit já está instalado no repositório (D008)?
4. Há prazo definido pela coordenação para a apresentação de andamento?
