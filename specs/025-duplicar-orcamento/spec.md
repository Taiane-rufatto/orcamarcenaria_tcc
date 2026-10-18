# Spec 025 — Duplicar orçamento para ajustar

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-18
**Status:** implementada e verificada por testes automatizados em 2026-10-18 (D040). **Falta o percurso de tela pela autora.** A migração `015` ainda não foi aplicada na VPS.
Origem: orientação de 08/10/2026 (ata §5: "alternativas como separar registro de envio ou permitir cópia; o professor mencionou a duplicação") e resumo da autora ("Edição após envio: avaliar duplicar orçamento"). Desenho já escolhido em `roadmap.md` §5.1.

## Contexto

O orçamento registrado fica travado (RF39, D020) para que o número entregue ao cliente nunca corresponda a valores alterados depois. Quando o cliente pede um ajuste (trocar um puxador, tirar um item), a única saída era criar outro do zero. A duplicação resolve isso sem mexer na regra de estados, e dispensa separar "registrar" de "enviar".

## Histórias e requisitos

US23; RF40; decisão D040.

## O que muda

1. **Botão "Duplicar para ajustar"** na seção Situação de qualquer orçamento fora de rascunho. Abre o rascunho novo.
2. **O rascunho novo** nasce sem número, com o mesmo cliente, projeto, itens (valores congelados, inclusive os ajustados à mão, RN08), custos adicionais, lucro, arredondamento, especificações e observações. **Emissão = hoje; validade = emissão + dias da configuração (D024).** O preço é refeito pelo mesmo domínio (D019) e sai igual até a pessoa ajustar.
3. **Referência ao original.** A tela mostra "Ajuste do orçamento nº X" no cabeçalho. Duplicar uma cópia aponta para a cópia, não para o primeiro.
4. **O original não muda.**
5. **Rascunho não se duplica** (409): edita-se direto.

## Capacidade entregável

1. **Entrega:** os itens acima, com migração `015` (coluna `origem_id`).
2. **Fica de fora:** versões (nº 12, 12-A); marcar o original como recusado automaticamente; duplicar vários de uma vez; mostrar a referência no PDF do cliente.
3. **Demonstração:** em um orçamento enviado, clicar em "Duplicar para ajustar"; trocar um item no rascunho novo; registrar e ver o número seguinte; voltar ao original e ver que nada mudou.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Cópia completa: cliente, projeto, itens, custos, lucro, arredondamento, textos; mesmo memorial e mesmo preço; rascunho sem número; referência ao original | `backend/tests/integracao/duplicar.test.ts` |
| O original continua igual (número e situação) | mesmo arquivo |
| Emissão de hoje e validade de 10 dias, ou da configuração (30) | mesmo arquivo |
| Item com valor ajustado continua marcado como ajustado | mesmo arquivo |
| O rascunho novo é ajustável sem afetar o original e pode ser registrado com número próprio | mesmo arquivo |
| Duplicar uma cópia aponta para a cópia | mesmo arquivo |
| Duplica orçamento aprovado, recusado, em produção e entregue | mesmo arquivo |
| Rascunho 409; inexistente e de outra marcenaria 404; exige login | mesmo arquivo |
| Cálculo, PDF e demais telas inalterados | Suíte do backend inteira (CT01–CT10) |
| Botão, navegação e cabeçalho "Ajuste do orçamento nº X" | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/025-duplicar-orcamento-2026-10-18.md`.
