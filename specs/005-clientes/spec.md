# Spec 005 — Clientes

**Branch:** `spec/005-clientes`  
**Data:** 2026-09-28  
**Status:** fechada em 2026-09-28 (PR #6)

## Clarificações

### Sessão 2026-09-28

- Q: Cliente inativado pode ser reativado? → A: sim, como materiais e serviços (D015, D021).
- Q: O orçamento guarda uma cópia do nome do cliente? → A: não; guarda o vínculo e mostra os dados atuais do cadastro (D021).
- Q: O que acontece com os orçamentos que já têm cliente em texto livre? → A: a migração cria um cliente por nome distinto da marcenaria e liga os orçamentos a ele (D021).

## Capacidade entregável

1. **Entrega:** o marceneiro cadastra clientes (só o nome é obrigatório; telefone, e-mail e endereço opcionais), busca pelo nome, edita, inativa e reativa. Ao criar um orçamento ou editar um rascunho, escolhe o cliente na lista dos ativos. Os orçamentos antigos passam a apontar para clientes cadastrados automaticamente.
2. **Fica de fora:** histórico de orçamentos na tela do cliente; importação de contatos; validação de CPF/CNPJ; PDF (006).
3. **Demonstração:** cadastrar um cliente só com o nome, buscar, editar o telefone, criar um orçamento para ele, inativá-lo (some das escolhas, o orçamento continua mostrando o nome) e reativá-lo. Os 3 orçamentos já existentes no banco principal aparecem com cliente cadastrado.

## Histórias e critérios verificáveis

### US06 — Cadastrar e localizar clientes

Cobertura: RF08, RF09, RF10.

- Cliente com só o nome é criado ativo; telefone, e-mail e endereço são opcionais; nome vazio é recusado; e-mail, se informado, precisa ter formato válido. *Verificação:* integração.
- Busca por nome (sem curingas), filtro de situação (ativos, inativos, todos), edição de qualquer campo. *Verificação:* integração + validação manual.
- Não existe exclusão: a tela oferece "Inativar", e o cliente inativo continua ligado aos seus orçamentos, que seguem mostrando o nome (RF10, AGENTS §5.2). *Verificação:* integração + validação manual.
- Cliente inativo pode ser reativado (D021). *Verificação:* integração.
- **TI03:** outra marcenaria recebe "não encontrado" ao editar, inativar ou reativar cliente alheio, e não o vê na lista. *Verificação:* integração.

### Vínculo com o orçamento (RF23, D021)

- Criar orçamento e alterar o cabeçalho de um rascunho exigem um cliente **ativo da mesma marcenaria**; cliente inativo ou alheio é recusado. *Verificação:* integração.
- A resposta do orçamento e a lista de orçamentos trazem o nome do cliente vindo do cadastro; editar o cliente reflete nos seus orçamentos. *Verificação:* integração.
- A busca da lista de orçamentos procura no nome do cadastro. *Verificação:* integração (regressão do 004).
- A migração liga todos os orçamentos existentes a clientes criados a partir do nome em texto livre, um por nome distinto em cada marcenaria. *Verificação:* conferência no banco principal antes e depois (3 orçamentos, 1 nome distinto).

## Regras e restrições

- `marcenaria_id` vem apenas da sessão; todo SQL de cliente filtra por ele (AGENTS §5.1).
- Sem exclusão física (AGENTS §5.2). Dados fictícios em testes e evidências (RNF15).
- Nenhuma regra de cálculo muda. O cliente não entra no cálculo.

## Evidências previstas

- Integração no `orcamarcenaria_teste`: cadastro, busca, edição, inativação, reativação, TI03, vínculo com o orçamento e regressão da lista.
- Regressão dos dez casos (`verificar-calculo`), já que a migração altera a tabela de orçamento.
- Percurso de tela e validação manual em `evidencias/testes/005-clientes-AAAA-MM-DD.md`.

## Perguntas em aberto

- Nenhuma que bloqueie o plano.
