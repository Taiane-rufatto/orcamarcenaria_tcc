# Backend — OrçaMarcenaria

API HTTP/JSON em Node.js com TypeScript e PostgreSQL. É aqui que vive **toda** a regra de cálculo do orçamento (RNF08): a interface nunca calcula preço.

## Estrutura

| Pasta | O que vai aqui | O que **não** vai |
|---|---|---|
| `src/dominio/orcamento/` | Regras RN01–RN11 em funções puras: valor de linha, subtotais, margem, markup, arredondamento. Recebe dados prontos e devolve números | Acesso a banco, HTTP, data do sistema, leitura de configuração |
| `src/casos-de-uso/` | Orquestração: carrega dados, chama o domínio, persiste, devolve. Um arquivo por operação (criar orçamento, registrar orçamento, cadastrar material) | Regra de cálculo duplicada |
| `src/infra/banco/` | Conexão, pool, tipos decimais, execução de migrações | Regra de negócio |
| `src/infra/repositorios/` | Acesso a dados. **Todo repositório filtra por `marcenaria_id` da sessão** (RNF12) | Decidir preço |
| `src/infra/pdf/` | Geração do PDF do orçamento (RF41–RF43) | Recalcular totais — recebe o orçamento já calculado |
| `src/api/rotas/` | Rotas HTTP: validação de formato, chamada do caso de uso, resposta | Regra de negócio |
| `src/api/middlewares/` | Autenticação, sessão, tratamento de erro, log | — |
| `src/config/` | Leitura de variáveis de ambiente e configuração da aplicação | Segredos escritos no código |
| `migracoes/` | Migrações de esquema, numeradas e versionadas | Alterações manuais no banco |
| `seeds/` | Dados fictícios de demonstração e fixtures de teste (RNF15: nunca dados reais de cliente) | — |
| `tests/unidade/` | Testes do domínio de cálculo, incluindo os 10 casos de referência | Testes que exigem banco |
| `tests/integracao/` | Casos de uso com banco, incluindo os testes de isolamento TI01–TI04 | — |

## Por que o domínio é isolado

O critério de aprovação do TCC é diferença nula entre o cálculo manual e o do sistema. Um domínio puro pode ser testado com os dez casos de `documentacao/qualidade-e-testes.md` sem subir banco nem navegador, e é o único lugar onde a fórmula existe — então tela, PDF e teste devolvem obrigatoriamente o mesmo número.

## Regras não negociáveis

1. Nada de `Number`, `float` ou `parseFloat` em valor, quantidade ou percentual: apenas decimal exato (RNF07).
2. `marcenaria_id` vem sempre da sessão autenticada, nunca do corpo da requisição (RNF12).
3. Sem exclusão física de registros: cadastros são inativados (RNF10).
4. Segredos só em variáveis de ambiente; `.env` nunca é versionado.

## Executar localmente

```bash
cd backend
npm install
copy .env.example .env    # no Windows; preencher DATABASE_URL e JWT_SECRET
npm run dev
```

Com a API em execução, acesse `http://localhost:3333/saude`. A resposta esperada contém `api: "ok"` e `banco: "ok"`.

```bash
npm test
npm run build
```

Os scripts de migração serão adicionados no incremento que introduzir o esquema de dados.
