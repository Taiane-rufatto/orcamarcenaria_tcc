# Spec 020 — Fornecedor, histórico de preço e alerta de preço antigo

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-14
**Status:** implementada e verificada por testes automatizados em 2026-10-14 (D034). **Falta o percurso de tela pela autora** (`evidencias/testes/019-020-painel-e-fornecedor-2026-10-14.md`). A migração `011` ainda não foi aplicada na VPS.
Origem: orientação de 08/10/2026 (ata §7), itens S3, S4 e S5 da análise da spec 016. Promove o RF16.

## Contexto

O professor sugeriu cadastrar fornecedores ligados aos materiais e guardar o histórico de atualização do preço, com alerta quando o preço estiver velho. A necessidade mínima, nas palavras dele, é **saber de quem vem o preço**. O mercado confirma a dor: custo desatualizado é uma das formas de perder margem sem perceber.

## Histórias e requisitos

US18; RF16 (histórico de custo, promovido), RF49 a RF52; regra RN15; decisão D034.

## Regras

- **Fornecedor (RF49):** nome (maiúsculas, D032) e telefone opcional; nome único por marcenaria; sem exclusão, só inativar e reativar.
- **Material (RF50):** fornecedor opcional, da mesma marcenaria e ativo ao escolher.
- **Histórico (RF52):** uma linha (data, custo, fornecedor) ao cadastrar o material, ao trocar o custo ou o fornecedor, e ao confirmar o preço. Mudar só nome, descrição ou unidade **não** grava. Só acréscimo; as últimas 20 aparecem no cadastro do material.
- **Preço antigo (RN15, RF51):** mais de 30 dias sem atualizar ou confirmar (30 dias ainda não é antigo). Selo "Preço antigo" e botão "Continua o mesmo", que renova a data sem mudar o custo. O prazo é fixo.
- Orçamentos já criados mantêm o custo da época (RN08); o alerta nunca muda custo nem orçamento.

## Capacidade entregável

1. **Entrega:** tela **Fornecedores**; em **Materiais**, campo Fornecedor, colunas "Fornecedor" e "Preço atualizado" (há quantos dias, com o selo e o botão) e o histórico de preço no painel de edição. Migração `011`: os materiais que já existem ganham a primeira linha do histórico.
2. **Fica de fora:** vários fornecedores por material; comparar preços; lista de compras por fornecedor; WhatsApp; prazo configurável; relatório de variação de preço (TCC II).
3. **Demonstração:** cadastrar o fornecedor "Madeireira Central"; escolher no MDF; trocar o custo e ver duas linhas no histórico; deixar um material com preço de 31 dias e ver "Preço antigo"; clicar "Continua o mesmo" e ver "hoje".

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Fornecedor: cadastrar em maiúsculas, editar, buscar, inativar, reativar; nome repetido dá 409 | Integração (`fornecedores.test.ts`) |
| Isolamento: outra marcenaria não vê, edita nem usa o fornecedor; material de outra não tem histórico nem confirmação (404) | Integração |
| Histórico: criar grava 1 linha; trocar custo e fornecedor grava; só o nome não grava; ordem da mais recente para a antiga | Integração |
| Fornecedor inativo ou inexistente não pode ser escolhido (400) | Integração |
| Preço antigo: 30 dias não é antigo, 31 é; confirmar renova a data e grava no histórico sem mudar o custo | Unidade (`preco-antigo.test.ts`) + integração |
| Migração `011` idempotente e sem perda de dados | `npm run migrar` repetido no banco local e no de teste |
| Cálculo, orçamento e catálogo de serviços inalterados | Suíte do backend inteira (CT01–CT10) |
| Tela de fornecedores e de materiais | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/019-020-painel-e-fornecedor-2026-10-14.md`.

## Perguntas em aberto

1. Conversar com o seu pai: ele compraria de mais de um fornecedor? O prazo de 30 dias serve para os materiais dele?
2. Antes de publicar na VPS: backup do banco e `atualizar.sh main` (migração `011`).
