# Handoff

> **Próxima sessão:** a autora executa a validação manual do `specs/002-catalogo-materiais/quickstart.md` (T014); depois, `fechar-spec` (T015). O código da Spec 002 está pronto: 21 testes de backend, builds e TI01 aprovados. O visual do frontend foi redefinido em D014 (variáveis em `frontend/src/index.css`; componentes `Layout`, `Marca`, `PainelAcesso`); telas novas devem reutilizar essas classes. RF14 segue no incremento 003 (D013).
> Atualização de 2026-09-19: cadastro, entrada, saída, troca de senha, JWT/sessão e TI04 foram implementados e validados; consultar `evidencias/testes/001-conta-acesso-2026-09-19.md`. Falta apenas a evidência automatizada contra `DATABASE_URL_TESTE` para fechar a Spec 001.

**Atualizado em:** 2026-09-19 · Última sessão: planejamento da Spec 001 (conta e acesso).

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
2. A Spec 001 foi criada na branch `spec/001-conta-acesso`, em `specs/001-conta-acesso/spec.md`, cobrindo US01, US02, RF01–RF04, RF06 e RNF11–RNF13.
3. Clarificação e planejamento da Spec 001 concluídos: TI04 será verificado neste incremento; TI01–TI03 serão executados com material, orçamento e cliente nos incrementos correspondentes e consolidados no 010 (D011). O plano, contratos, modelo de dados, pesquisa e roteiro ficam em `specs/001-conta-acesso/`.

Decisões firmes: D001, D004, D005, D007, D008, D009, D010, D011 e D012. Provisórias, aguardando a entrevista: D002, D003 e D006.

## O que **não** foi feito

- Entrevista de levantamento não realizada — por isso a §4 de `requisitos.md` existe.
- Casos de teste calculados por script de referência, mas ainda não conferidos em planilha pela autora (exigência do método da proposta).

## Contexto que não está óbvio nos arquivos

- O `specify-cli` 1.0.8 foi instalado em `C:\Users\thayr\AppData\Roaming\Python\Python313\Scripts\specify.exe`. Essa pasta ainda não está no `PATH`; para usar o comando manualmente, adicione-a ao `PATH` ou invoque o executável por esse caminho.
- O critério que decide a aprovação do TCC é **diferença nula entre cálculo manual e cálculo do sistema**. Tudo que aumente o risco nesse ponto (ponto flutuante, cálculo duplicado no front-end, arredondamento implícito) é prioridade máxima de prevenção.
- A proposta já foi defendida em banca. Mudar tema, pergunta central, escopo declarado ou critérios de validação exige reavaliação com o orientador — não é decisão de sessão.
- O prazo é curto e a equipe é de uma pessoa: a regra prática é sempre entregar a fatia menor que ainda seja demonstrável.
- A autora precisa entender e defender cada parte do que for gerado. Ao produzir código, explique a lógica em português junto com a entrega.

## Perguntas a fazer à autora antes de avançar

1. A entrevista com o proprietário já ocorreu? Em caso afirmativo, onde estão as notas?
2. Há prazo definido pela coordenação para a apresentação de andamento?
