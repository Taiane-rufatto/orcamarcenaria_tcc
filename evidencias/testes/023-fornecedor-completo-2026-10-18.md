# Evidência — Incremento 023: fornecedor completo

**Data:** 2026-10-18 · **Spec:** `specs/023-fornecedor-completo/spec.md` · **Decisão:** D038 · **Requisitos:** RF58, RF59, US21

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (autora):** percurso de tela; na VPS, a migração `013`. O incremento ainda **não está fechado**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira | **26 arquivos, 262 testes passam**, incluindo CT01–CT10 |
| Suíte do frontend | **7 arquivos, 27 testes passam**; lint e build limpos |
| Migração `013` | aplicada no banco local e no de teste, sem erro |

## Critérios

| Critério | Resultado | Como |
|---|---|---|
| Endereço do fornecedor | passa | `tests/integracao/compras.test.ts` |
| Aviso de preço antigo e de custo mudado dentro do orçamento; "continua o mesmo" e "usar o novo custo" | passa | mesmo arquivo |
| Lista de compras por fornecedor (agrupa, ordena, ignora serviço, fornecedor atual, só quantidades, 404 e login) | passa | mesmo arquivo |
| Texto copiável e exibição da lista | passa | `src/componentes/ListaDeCompras.test.tsx` |

## Pendente: percurso de tela

1. **Fornecedores:** cadastrar com endereço; ver na lista.
2. **Serviços:** abrir um serviço e ver o campo "Quando cobrar".
3. **Orçamento em rascunho** com um material do catálogo: para ver "Preço do material com N dias" sem esperar 30 dias, usar um material antigo da base local; clicar "Continua o mesmo".
4. Mudar o custo do material em Materiais; voltar ao rascunho; ver "O custo do catálogo agora é…"; clicar "Usar o novo custo" e conferir que o subtotal muda.
5. **Lista de compras:** conferir os grupos por fornecedor; clicar "Copiar lista" e colar no WhatsApp ou no bloco de notas.
6. Conferir que o PDF do cliente não mostra a lista de compras nem avisos.
7. 1366×768 e 390 px (RNF05).

## Limites

Os testes não substituem o percurso de tela. A área de transferência ("Copiar lista") depende do navegador e só foi testada em simulação.
