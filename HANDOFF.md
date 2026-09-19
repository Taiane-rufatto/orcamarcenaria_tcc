# Handoff

**Atualizado em:** 2026-09-19 · Última sessão: implementação, reativação (D015), visual (D014) e fechamento da Spec 002 (catálogo).

> **Próxima sessão:** a autora revisa o diff da Spec 002 (B12); depois integra a branch e abre o incremento 003. Estado detalhado em `ESTADO_ATUAL.md`.

Para qualquer nova sessão, agente ou ferramenta assumir o trabalho sem reconstruir contexto pelo histórico de conversa.

## Leia nesta ordem

1. `AGENTS.md` — como trabalhar neste repositório
2. `ESTADO_ATUAL.md` — onde o projeto parou e qual é o próximo passo
3. `BLOQUEIOS.md` — o que está travado e depende de decisão humana
4. `documentacao/roadmap.md` — qual incremento está aberto
5. A Spec corrente em `specs/`, quando existir
6. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md` — antes de qualquer tarefa que toque em cálculo

## O que foi feito na última sessão

1. **Spec 002 implementada:** API de materiais e serviços (cadastro, busca, filtro de situação, edição, inativação e reativação), telas correspondentes, 25 testes de backend, TI01 e validação manual da autora. Evidência: `evidencias/testes/002-catalogo-2026-09-19.md`.
2. **Decisões novas:** D014 (identidade visual), D015 (reativação, incluída na Spec após uso real) e D016 (custo do catálogo > 0, divergência com a RN10 resolvida pela autora).
3. **Documentação canônica ajustada:** RN10, US03–US05, modelo de dados, roadmap, matriz de verificação (RF01–RF04 e RF06 e RF11–RF13, RF15, RF17, RF18 verificados) e README.

Decisões firmes: D001, D004, D005, D007–D016. Provisórias, aguardando a entrevista: D002, D003 e D006.

## O que **não** foi feito

- Entrevista de levantamento não realizada (B01).
- Nenhuma regra de cálculo implementada. A rotina `verificar-calculo` **não pôde ser executada**: não há módulo de domínio nem os dez casos rodando. A Spec 002 só armazena e exibe valores como texto decimal; a verificação real acontece no incremento 003 e a validação formal no 008.
- Casos de teste do cálculo ainda não conferidos em planilha pela autora (B08).
- Revisão humana do diff da Spec 002 (B12).
- RF14 (custo editado não altera orçamento registrado) segue no incremento 003 (D013); RF16 é pós-TCC.

## Contexto que não está óbvio nos arquivos

- O `specify-cli` 1.0.8 foi instalado em `C:\Users\thayr\AppData\Roaming\Python\Python313\Scripts\specify.exe`. Essa pasta ainda não está no `PATH`; para usar o comando manualmente, adicione-a ao `PATH` ou invoque o executável por esse caminho.
- O critério que decide a aprovação do TCC é **diferença nula entre cálculo manual e cálculo do sistema**. Tudo que aumente o risco nesse ponto (ponto flutuante, cálculo duplicado no front-end, arredondamento implícito) é prioridade máxima de prevenção.
- A proposta já foi defendida em banca. Mudar tema, pergunta central, escopo declarado ou critérios de validação exige reavaliação com o orientador — não é decisão de sessão.
- O prazo é curto e a equipe é de uma pessoa: a regra prática é sempre entregar a fatia menor que ainda seja demonstrável.
- A autora precisa entender e defender cada parte do que for gerado. Ao produzir código, explique a lógica em português junto com a entrega.
- **Banco de testes:** o `.env` não tem `DATABASE_URL_TESTE`; o teste de integração deriva `<nome do banco>_teste` de `DATABASE_URL` com as mesmas credenciais. `npm run migrar` usa `DATABASE_URL` (banco principal): para migrar o de teste, aponte `DATABASE_URL` para ele só naquele comando.
- **Toda Spec com migração exige `npm run migrar` também no banco principal** antes de usar o app. Foi exatamente isso que causou o "Ocorreu um erro interno" ao cadastrar o primeiro material (tabelas inexistentes no banco principal).
- **`NUMERIC` do PostgreSQL chega como texto** (`types.setTypeParser(1700, …)` em `backend/src/infra/banco/pool.ts`), e a vírgula decimal é convertida por texto na validação do servidor. Nada passa por `Number`; o 003 deve manter isso.
- **Testes de navegador (Playwright + Edge):** o react-router troca de tela numa *transition*, então `waitForURL` resolve antes de a tela nova existir e o `fill` cai na tela antiga. Esperar o título (`h1`) da página de destino.
- **Frontend:** cores e espaçamentos estão só em variáveis de `frontend/src/index.css` (D014). Telas novas reutilizam `pagina`, `folha`, `campos`, `alerta`, `selo`, sem estilo próprio.
- **Regra RN10 esclarecida (D016):** zero é válido no valor unitário de *item de orçamento*, mas não no catálogo.


## Perguntas a fazer à autora antes de avançar

1. A entrevista com o proprietário já ocorreu? Em caso afirmativo, onde estão as notas?
2. Há prazo definido pela coordenação para a apresentação de andamento?
