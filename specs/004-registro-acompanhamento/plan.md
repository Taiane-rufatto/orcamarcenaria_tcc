# Plano — Registro e acompanhamento do orçamento

## Resumo

Acrescentar ao orçamento do 003 o ciclo de vida da RN09: registrar (número + `enviado`, D020), aprovar, recusar e vencer automaticamente, com bloqueio de edição fora de rascunho; e uma listagem com busca e filtros. Nenhuma regra de cálculo muda.

## Verificação da constitution

- **Cálculo:** registrar não recalcula; preserva os totais gravados pelo domínio (D019). Os dez casos são reexecutados só como regressão.
- **Isolamento:** listagem, registro e transições filtram por `marcenaria_id` da sessão; numeração é por marcenaria.
- **Integridade:** sem exclusão; número nunca reutilizado.
- **Evidência:** integração, percurso de tela e validação manual.

## Desenho

### Dados (`backend/migracoes/004-situacoes.sql`)

- Troca o `CHECK` de `situacao` para as cinco situações da RN09.
- `CHECK ((situacao = 'rascunho') = (numero IS NULL))`: rascunho nunca tem número e orçamento registrado sempre tem.
- Índice para a listagem: `(marcenaria_id, data_emissao DESC)`.
- A migração é nova e idempotente; `003-orcamento.sql` não é editado (já está em `main`).

### Regras no caso de uso (`aplicacao/orcamento/`)

| Ação | Regra |
|---|---|
| Registrar | Só de `rascunho`. Confere RF32 (cliente e descrição já são obrigatórios; exige ao menos um item). Trava a linha da marcenaria (`SELECT … FOR UPDATE`) e usa `MAX(numero) + 1` da marcenaria; a restrição `UNIQUE (marcenaria_id, numero)` é a rede de segurança |
| Aprovar / recusar | Só de `enviado`, depois de aplicar o vencimento |
| Vencimento (RF36) | Antes de listar ou consultar: `enviado` com `data_validade < data de hoje em São Paulo` passa a `vencido` (`(now() AT TIME ZONE 'America/Sao_Paulo')::date`), independentemente do fuso do servidor |
| Editar (RF39) | Já recusado fora de `rascunho` pelo `alterar` do 003 (409); agora testável |

As transições ficam numa tabela única (`TRANSICOES`) no caso de uso, lida como a RN09.

### API

| Rota | Efeito |
|---|---|
| `GET /orcamentos?busca=&situacao=&de=&ate=` | Lista resumida (id, número, cliente, descrição, emissão, validade, preço final, situação), mais recentes primeiro |
| `POST /orcamentos/:id/registrar` | Registra (D020) e devolve o orçamento completo |
| `POST /orcamentos/:id/situacao` `{ situacao: 'aprovado' \| 'recusado' }` | Muda a situação de um enviado |

A resposta completa do orçamento passa a incluir `numero`.

### Frontend

- `Orcamentos.tsx`: lista com busca, filtro de situação e período, acima do formulário de novo orçamento; cada linha abre o orçamento.
- `Orcamento.tsx`: título com o número; botão "Registrar e marcar como enviado" em rascunho; "Aprovado" e "Recusado" em enviado; fora de rascunho, somente leitura (sem formulários), mantendo itens, custos e memorial.

## Riscos

| Risco | Mitigação |
|---|---|
| Dois registros simultâneos gerarem o mesmo número | Trava da linha da marcenaria + `UNIQUE` |
| Vencimento depender do fuso do servidor | Data de São Paulo explícita no SQL |
| Listagem sem filtro de marcenaria | Teste de isolamento na listagem (TI01) |
