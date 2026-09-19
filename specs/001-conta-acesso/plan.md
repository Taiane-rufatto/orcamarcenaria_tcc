# Plano de Implementação: Conta e Acesso

**Branch**: `spec/001-conta-acesso` | **Data**: 2026-09-19 | **Spec**: [spec.md](spec.md)

## Resumo

Implementar cadastro de marcenaria, autenticação, logout, alteração de senha e proteção de rotas.
O backend emitirá um JWT para uma sessão persistida; o frontend guardará somente o token da sessão
atual e concentrará chamadas autenticadas em `src/servicos/`. A consulta de negócio receberá a
marcenaria exclusivamente da sessão autenticada.

## Contexto Técnico

**Linguagem/versão**: Node.js 24 e TypeScript 7 no backend; React 19 e TypeScript 6 no frontend.

**Dependências principais**: Express 5, `pg`, `dotenv`, `cors`, `decimal.js`, Vitest e `tsx` já
existentes; adicionar `bcrypt`, `jsonwebtoken`, Zod, `react-router-dom` e as declarações de tipos
necessárias.

**Armazenamento**: PostgreSQL local, com migração versionada para `marcenaria`, `usuario` e
`sessao`.

**Testes**: Vitest para unidade e integração; teste manual de cadastro, entrada, saída, alteração de
senha e redirecionamento sem sessão.

**Plataforma-alvo**: navegador desktop a partir de 1366×768 e API HTTP local; HTTPS é requisito do
ambiente publicado, não desta execução local.

**Tipo de projeto**: aplicação web de frontend React e API Node.js separada.

**Meta de desempenho**: os fluxos de conta devem responder sem operação longa perceptível em uso
local; não há meta numérica específica para autenticação no baseline.

**Restrições**: senha mínima de 8 caracteres; hash com sal; mensagens em português; nenhuma senha,
token ou valor real em código, evidência ou Git; rotas internas exigem sessão válida.

**Escopo**: uma conta de usuário por marcenaria; sem recuperação de senha, múltiplos usuários,
papéis, catálogo, cliente, orçamento ou cálculo.

## Verificação da Constitution

| Princípio | Evidência no plano | Situação |
|---|---|---|
| Cálculo único e decimal | A funcionalidade não cria nem altera cálculo ou valor monetário. | Conforme |
| Isolamento, integridade e segredo | Sessão fornece `marcenaria_id`; repositórios não recebem esse valor do cliente; hash e segredos ficam fora do Git. | Conforme |
| Especificação antes da implementação | US01, US02, RF01–RF04, RF06 e RNF11–RNF13 estão definidos na Spec. | Conforme |
| Evidência executável | Contratos, testes de integração, TI04 e roteiro manual estão previstos. | Conforme |
| Escopo controlado | Recuperação de senha e funcionalidades de negócio permanecem fora. | Conforme |

**Revisão após o desenho**: aprovada. Não há exceção ou complexidade adicional a justificar.

## Estrutura do Projeto

```text
backend/
├── migracoes/001-conta-acesso.sql
├── src/
│   ├── api/
│   │   ├── middlewares/autenticacao.ts
│   │   └── rotas/autenticacao.ts
│   ├── casos-de-uso/conta/
│   ├── config/ambiente.ts
│   ├── infra/repositorios/
│   └── servidor.ts
└── tests/
    ├── integracao/autenticacao.test.ts
    └── unidade/senha.test.ts

frontend/
└── src/
    ├── paginas/{cadastro,entrar,orcamentos}.tsx
    ├── componentes/rota-protegida.tsx
    ├── servicos/{api,autenticacao}.ts
    └── sessao/{contexto,use-sessao}.ts

specs/001-conta-acesso/
├── contracts/autenticacao.openapi.yaml
├── data-model.md
├── research.md
├── quickstart.md
└── plan.md
```

**Decisão de estrutura**: manter as camadas existentes. Rotas validam entrada e devolvem respostas;
casos de uso coordenam a operação; repositórios executam acesso a dados; middleware traduz uma
sessão válida em contexto autenticado. O frontend não chama `fetch` fora de `servicos/`.

## Sequência de Implementação

1. Adicionar dependências e ampliar a leitura de ambiente com segredo e expiração do token.
2. Criar a migração de conta e sessão; incluir restrições de e-mail único e vínculos por marcenaria.
3. Criar repositórios, serviço de senha e casos de uso de cadastro, entrada, saída e alteração de
   senha.
4. Criar middleware de autenticação, rotas e tratamento uniforme de erros de validação e credencial.
5. Criar serviço de autenticação, estado de sessão, rotas protegidas e telas de cadastro/entrada no
   frontend.
6. Executar testes de unidade, integração, TI04 e roteiro manual; registrar evidências.

## Complexidade

Não há violação dos princípios da constitution a justificar.
