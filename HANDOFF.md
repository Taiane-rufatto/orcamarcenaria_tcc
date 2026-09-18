# Handoff

**Atualizado em:** 2026-09-18 · Última sessão: encerramento técnico do incremento 000.

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. Incremento 000 concluído e publicado no GitHub: backend Express/TypeScript, frontend React/Vite e PostgreSQL local configurados.
2. A rota `GET /saude` respondeu `api: "ok"` e `banco: "ok"`; o backend executou 2 testes Vitest aprovados. A tela do frontend consulta essa rota exclusivamente pelo serviço `src/servicos/api.ts`.
3. Bibliotecas iniciais registradas em D010; `.env` e `node_modules` foram conferidos como ignorados pelo Git.

Decisões firmes: D001, D004, D005, D007, D009 e D010. Provisórias, aguardando a entrevista: D002, D003 e D006. D008 continua aberta: instalar e confirmar o Spec Kit.

## O que **não** foi feito

- Entrevista de levantamento não realizada — por isso a §4 de `requisitos.md` existe.
- Casos de teste calculados por script de referência, mas ainda não conferidos em planilha pela autora (exigência do método da proposta).
- Spec Kit e constitution ainda não instalados/escritos; isso bloqueia abrir formalmente a Spec 001.

## Contexto que não está óbvio nos arquivos

- O critério que decide a aprovação do TCC é **diferença nula entre cálculo manual e cálculo do sistema**. Tudo que aumente o risco nesse ponto (ponto flutuante, cálculo duplicado no front-end, arredondamento implícito) é prioridade máxima de prevenção.
- A proposta já foi defendida em banca. Mudar tema, pergunta central, escopo declarado ou critérios de validação exige reavaliação com o orientador — não é decisão de sessão.
- O prazo é curto e a equipe é de uma pessoa: a regra prática é sempre entregar a fatia menor que ainda seja demonstrável.
- A autora precisa entender e defender cada parte do que for gerado. Ao produzir código, explique a lógica em português junto com a entrega.

## Perguntas a fazer à autora antes de avançar

1. O Spec Kit já está instalado no repositório e a constitution foi escrita (D008)?
2. A entrevista com o proprietário já ocorreu? Em caso afirmativo, onde estão as notas?
3. Há prazo definido pela coordenação para a apresentação de andamento?
