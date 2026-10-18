# Spec 023 — Fornecedor completo: endereço, aviso no orçamento e lista de compras

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-18
**Status:** implementada e verificada por testes automatizados em 2026-10-18 (D038). **Falta o percurso de tela pela autora.** A migração `013` ainda não foi aplicada na VPS.
Origem: resumo da orientação de 08/10/2026 feito pela autora (seção 1, Fornecedores), itens 1, 4 e 5. Completa a spec 020.

## Contexto

A spec 020 entregou o fornecedor, o histórico de preço e o alerta de preço antigo **na lista de materiais**. O resumo da autora pede três coisas que faltavam: o endereço do fornecedor, o alerta **dentro do orçamento** (quais materiais estão com preço "ok" e quais precisam ser verificados, com botão para confirmar "continua o mesmo" ou registrar o novo) e a **segunda saída** do orçamento, uma lista interna de compras. Também corrige uma falha minha: o texto de apoio do serviço (S2) tinha sido marcado como feito na análise sem ter sido implementado.

## Histórias e requisitos

US21; RF58 (aviso e lista de compras) e RF59 (endereço do fornecedor); decisão D038.

## O que muda

1. **Endereço do fornecedor (RF59).** Campo opcional (até 300 caracteres), na lista e no cadastro. Migração `013`.
2. **Aviso de preço dentro do orçamento em rascunho (RF58).** Para cada item de material do catálogo, a API devolve o custo atual do catálogo e há quantos dias o preço foi atualizado. A tela mostra, só no rascunho:
   - **"Preço do material com N dias"** (mais de 30 dias, RN15) com o botão **"Continua o mesmo"**, que confirma o preço no catálogo sem mexer no item;
   - **"O custo do catálogo agora é R$ X"** (o custo mudou depois de o item entrar) com o botão **"Usar o novo custo"**, que atualiza o item e o servidor recalcula o orçamento.
   O valor do item **nunca muda sozinho** (RN08); o aviso só informa.
3. **Lista de compras (RF58).** Seção no orçamento com os **materiais agrupados por fornecedor** (nome, telefone, endereço; quantidades e unidades), os sem fornecedor num grupo no fim, e o botão **"Copiar lista"**, com um texto pronto para colar no WhatsApp. É **interna**: só quantidades, nenhum valor, e **não vai no PDF do cliente**. Usa o fornecedor **atual** do material. Serviços não entram.
4. **Texto de apoio do serviço (corrige a S2).** O campo de descrição do serviço virou "Quando cobrar (opcional)", com exemplo.

## Capacidade entregável

1. **Entrega:** os itens acima, com migração `013`.
2. **Fica de fora:** vários fornecedores por material e comparação entre eles (o proprietário usa um só); sugestão automática do fornecedor mais barato; envio automático por WhatsApp; imprimir a lista; custo estimado por fornecedor na lista.
3. **Demonstração:** em um rascunho com MDF de preço antigo, ver "Preço do material com 45 dias" e clicar "Continua o mesmo"; mudar o custo do MDF em Materiais, voltar ao rascunho, ver "O custo do catálogo agora é…" e clicar "Usar o novo custo"; rolar até "Lista de compras" e clicar "Copiar lista".

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Endereço do fornecedor: opcional, editável e limpável | `backend/tests/integracao/compras.test.ts` |
| Item do catálogo traz custo atual e dias; item avulso vem sem aviso | mesmo arquivo |
| Mais de 30 dias é sinalizado; "continua o mesmo" tira o aviso e não muda o item nem o preço | mesmo arquivo |
| Custo do catálogo que mudou é sinalizado; "usar o novo custo" atualiza o item e o subtotal | mesmo arquivo |
| Lista: agrupa por fornecedor, sem fornecedor no fim, ignora serviço, usa o fornecedor atual, só `descricao`, `quantidade` e `unidade` | mesmo arquivo |
| Lista: vazia sem materiais; 404 para outra marcenaria ou id inválido; exige login | mesmo arquivo |
| Texto copiável e exibição da lista | `frontend/src/componentes/ListaDeCompras.test.tsx` |
| Cálculo e PDF inalterados | Suíte do backend inteira (CT01–CT10) e `conteudo-pdf.test.ts` |
| Telas e RNF05 | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/023-fornecedor-completo-2026-10-18.md`.

## Perguntas em aberto

Imprimir a lista (hoje só copiar) e incluir custos estimados por fornecedor ficam para depois, se a autora quiser.
