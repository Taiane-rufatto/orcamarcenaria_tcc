# Plano — Catálogo de materiais e serviços

## Resumo

Criar catálogo isolado por marcenaria com PostgreSQL `NUMERIC(12,4)`, API Express protegida pela sessão existente e telas React que usam somente `src/servicos/` para HTTP.

## Contexto técnico

- Node.js/TypeScript, Express, `pg`, Zod e decimal exato; React/TypeScript/Vite.
- PostgreSQL local, migração versionada e testes Vitest no banco `orcamarcenaria_teste`.
- Valores monetários não usam `Number`; `NUMERIC` chega como texto e será validado/manipulado com `decimal.js`.

## Verificação da constitution

- Cálculo: não altera fórmulas; preserva custos com quatro casas para futuro domínio.
- Isolamento: todo repositório recebe `marcenaria_id` somente do middleware autenticado.
- Integridade: inativação substitui exclusão; segredos continuam no ambiente.
- Evidência: unidade, integração/TI01 e roteiro manual são obrigatórios.

## Sequência

1. Migração das entidades `material` e `servico`.
2. Repositórios filtrados por marcenaria, validações Zod e rotas autenticadas.
3. Telas e serviços de API para os dois catálogos.
4. Testes e evidências.

## Estrutura

```text
backend/src/{api,aplicacao,infra}/catalogo/
backend/migracoes/002-catalogo.sql
frontend/src/{paginas,componentes,servicos}/
specs/002-catalogo-materiais/{data-model.md,contracts,quickstart.md}
```
