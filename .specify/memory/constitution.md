# OrçaMarcenaria Constitution

## Core Principles

### I. Cálculo Único, Decimal e Reproduzível
Todo cálculo de valor monetário, quantidade, percentual, subtotal, margem, markup ou arredondamento
MUST existir somente em `backend/src/dominio/orcamento/`, usando decimal exato. Frontend, PDF,
rotas e repositórios MUST apenas consumir ou exibir o resultado do domínio; `Number`, `float`,
`double` e `parseFloat` são proibidos nesses valores. Mudanças de fórmula MUST atualizar
`documentacao/regras-de-calculo.md`, `documentacao/decisoes.md` e reexecutar os dez casos de
`documentacao/qualidade-e-testes.md`. Isso preserva a conferência manual exigida pelo TCC.

### II. Isolamento, Integridade e Segredo dos Dados
Toda consulta de negócio MUST filtrar por `marcenaria_id` obtido da sessão autenticada, nunca de
parâmetro recebido do cliente. Exclusão física é proibida: cadastros MUST ser inativados. Segredos
MUST permanecer em variáveis de ambiente, arquivos `.env` MUST permanecer ignorados pelo Git, e
o repositório MUST conter apenas dados fictícios e anonimizados. Esses controles evitam vazamento
entre marcenarias e preservam a ética da pesquisa.

### III. Especificação Antes da Implementação
Cada incremento MUST seguir Specify → Clarify → Plan → Tasks → Analyze → Implement → Testes →
Fechamento. Nenhuma funcionalidade pode ser implementada sem Spec correspondente em `specs/`;
ambiguidade de requisito MUST virar pergunta à autora ou item em `BLOQUEIOS.md`, nunca decisão
silenciosa. A Spec MUST citar histórias, requisitos, regras aplicáveis, critérios verificáveis,
evidências e escopo excluído. Isso mantém a rastreabilidade defendível em banca.

### IV. Evidência Executável e Documentação Verdadeira
Cada comportamento entregue MUST ter evidência proporcional ao risco: teste unitário para domínio,
teste de integração para banco e isolamento, e verificação manual para fluxos de tela. Testes verdes
não encerram um incremento isoladamente; o fechamento MUST registrar evidências em `evidencias/`
e atualizar documentos canônicos, `ESTADO_ATUAL.md`, `BLOQUEIOS.md` e `HANDOFF.md`. Documento de
estado MUST descrever a realidade observada, inclusive limitações e pendências.

### V. Escopo Controlado e Compreensível
O incremento MUST entregar a menor fatia demonstrável pelo marceneiro. Ideias fora do escopo
aprovado MUST ser registradas em `documentacao/roadmap.md` sem entrar no código. Interface,
mensagens de erro, documentação e commits MUST usar português do Brasil; cada decisão técnica
MUST ser explicável pela autora. Abstrações, arquivos e testes sem necessidade verificável são
proibidos, porque entendimento humano e rastreabilidade têm precedência sobre velocidade.

## Restrições Técnicas e de Dados

O sistema usa Node.js com TypeScript no backend, React com TypeScript e Vite no frontend e
PostgreSQL, conforme D007. O backend usa Express para HTTP, `pg` para acesso ao banco,
`decimal.js` para decimal exato e Vitest para testes, conforme D010. Chamadas HTTP do frontend
MUST passar por `frontend/src/servicos/`; componentes de tela MUST NOT chamar `fetch` diretamente.
Valores monetários exibidos MUST seguir `R$ 1.234,56`, e entradas aceitam vírgula decimal.

## Fluxo de Desenvolvimento e Qualidade

Antes de iniciar trabalho, MUST ler `ESTADO_ATUAL.md`, `BLOQUEIOS.md`, a Spec corrente e confirmar
o incremento no roadmap. Uma branch por incremento MUST usar o padrão `spec/NNN-nome-curto`.
Antes de abrir o próximo incremento, a rotina `fechar-spec` MUST auditar cada tarefa, revalidar
requisitos e isolamento quando aplicável, registrar evidência e concluir a Definição de Pronto.
O incremento 001 ou posterior MUST ser aberto com `abrir-incremento` somente após as dependências
e os bloqueios pertinentes estarem resolvidos.

## Governance

Esta constitution orienta o processo de engenharia e MUST ser lida junto a `AGENTS.md`. Em caso de
conflito, as fontes seguem a precedência definida em `AGENTS.md`: documentos originais em
`documentacao/fontes/`, requisitos e regras de cálculo, arquitetura e qualidade, decisões, e por
fim código. Uma emenda MUST documentar contexto, decisão e consequência em
`documentacao/decisoes.md`, atualizar artefatos afetados e receber revisão da autora antes de
alterar princípios que impactem escopo, cálculo ou dados.

Versões seguem semver: MAJOR para remoção ou redefinição incompatível de princípio, MINOR para novo
princípio ou expansão material, PATCH para esclarecimentos sem mudança normativa. Toda Spec, plano,
revisão e fechamento MUST verificar conformidade com esta constitution; desvios MUST ser registrados
em `BLOQUEIOS.md` ou em decisão datada antes da implementação.

**Version**: 1.0.0 | **Ratified**: 2026-09-18 | **Last Amended**: 2026-09-18
