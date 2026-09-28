# Plano — Clientes

## Resumo

Cadastro de clientes no mesmo padrão do catálogo (002): tabela isolada por marcenaria, rotas autenticadas, inativação e reativação. O orçamento troca `cliente_nome` por `cliente_id` (D021), com migração que preserva os orçamentos existentes. Nenhuma regra de cálculo muda.

## Verificação da constitution

- **Cálculo:** intocado; regressão dos dez casos porque a tabela `orcamento` muda.
- **Isolamento:** todo SQL de cliente filtra por `marcenaria_id`; o orçamento só aceita cliente da mesma marcenaria (TI03).
- **Integridade:** sem exclusão; migração não perde orçamento.
- **Dados:** testes e evidências com nomes fictícios.

## Desenho

### Dados (`backend/migracoes/005-clientes.sql`, idempotente)

1. `cliente` (`id`, `marcenaria_id`, `nome`, `telefone?` até 30, `email?` até 200, `endereco?` até 300, `ativo`, `criado_em`, `atualizado_em`), com índice `(marcenaria_id, nome)`. Nome não é único (D021).
2. `orcamento.cliente_id` referenciando `cliente`.
3. Só enquanto a coluna `cliente_nome` existir (bloco `DO`): cria um cliente por `(marcenaria_id, trim(cliente_nome))`, liga os orçamentos e remove `cliente_nome`. Assim o passo roda uma única vez, mesmo com o migrador reaplicando os arquivos.
4. `cliente_id` passa a `NOT NULL`.

### Backend

| Camada | Arquivo | Conteúdo |
|---|---|---|
| Repositório | `infra/repositorios/cliente-repositorio.ts` | listar (busca sem curinga, situação), criar, atualizar, inativar/reativar, buscar cliente ativo |
| Rotas | `api/rotas/clientes.ts`, `api/validacoes/clientes.ts` | `GET/POST /clientes`, `PUT /clientes/:id`, `DELETE /clientes/:id` (inativa), `POST /clientes/:id/reativar` |
| Orçamento | caso de uso, repositório e validação existentes | `clienteId` no lugar de `clienteNome`; cliente ativo da marcenaria exigido ao criar e ao **trocar** o cliente de um rascunho (manter o mesmo cliente, mesmo que inativado depois, é permitido); nome vindo de `JOIN cliente` na consulta e na lista |

Rotas e repositório de cliente seguem o formato de `catalogo.ts`, sem camada de caso de uso: não há regra além de validar e gravar.

### Frontend

- `servicos/clientes.ts` e `paginas/Clientes.tsx` no formato de `Materiais.tsx`; item "Clientes" no menu.
- Novo orçamento e dados do rascunho: seleção entre os clientes ativos, com atalho para o cadastro quando não houver nenhum. O cliente atual aparece na lista mesmo se estiver inativo.

## Riscos

| Risco | Mitigação |
|---|---|
| Migração perder ou misturar orçamentos | Conferência antes e depois no banco principal; nomes agrupados por marcenaria |
| Testes do 003/004 dependerem de `clienteNome` | Atualizar os testes para criar um cliente antes; mesmas asserções de valor |
| Cliente de outra marcenaria no orçamento | Verificação no caso de uso + teste de integração |
