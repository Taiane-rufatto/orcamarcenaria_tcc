# Evidência — Incremento 018: lucro de verdade e aviso de lucro mínimo

**Data:** 2026-10-13 · **Spec:** `specs/018-equilibrio-no-orcamento/spec.md` · **Decisão:** D033 · **Requisitos:** RF44–RF46, US17, RN12–RN13

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (dependem da autora):** conferência dos valores em planilha e percurso de tela. Por isso o incremento ainda **não está fechado**.

## O que foi verificado automaticamente

| Critério da spec | Resultado | Como |
|---|---|---|
| Fórmula (RN12, RN13): acima, abaixo, igual ao mínimo, arredondamento, CT03, sem mínimo, mínimo inválido, lucro negativo, preço zero | testes de unidade passam | `backend/tests/unidade/equilibrio.test.ts` |
| `calcularOrcamento` e CT01–CT10 inalterados | Suíte do backend inteira: **16 arquivos, 176 testes passam**; `calculo.ts` sem alteração (`git diff` vazio) | `npx vitest run` em `backend/` |
| Sem mínimo ou sem itens: nenhum aviso e nenhum erro | passa | unidade + integração |
| Validação da API: vírgula decimal; recusa 0, 100, 150, negativo, letras e 3 casas com 400 | passa | integração |
| Isolamento: o mínimo de uma marcenaria não aparece em outra | passa | integração |
| O lucro e o aviso não aparecem no PDF do cliente | passa | `conteudo-pdf.test.ts` (termos proibidos ampliados) |
| Baixar o markup de 100% para 20% muda o preço para 2.520,00 e dá o aviso (16,67% < 30%) | passa | integração |
| Orçamento registrado acompanha o mínimo atual | passa | integração |
| Migração `010` idempotente, aplicada no banco local e no de teste | executada sem erro | `npm run migrar` |
| Tela: aviso, dentro do mínimo, sem mínimo e sem itens | frontend **18 testes**, lint e build limpos | `AvisoEquilibrio.test.tsx` |

## Valores usados (fictícios, conferíveis à mão)

Material R$ 1.200,00 + serviço R$ 800,00 + adicional R$ 100,00 = custo direto **R$ 2.100,00**. Markup 100%, sem arredondamento: preço final **R$ 4.200,00**; lucro = 4.200,00 − 2.100,00 = **R$ 2.100,00 = 50,00%** do preço.

## Pendente: conferência da autora (planilha)

Conferir em planilha e anotar "confere" ou a diferença:

| Caso | Preço final; custo direto; mínimo | Esperado | Autora |
|---|---|---|---|
| Acima do mínimo | 4.200,00; 2.100,00; 40% | lucro 2.100,00 = 50,00%; sem aviso | |
| Abaixo do mínimo | 4.200,00; 2.100,00; 60% | lucro 2.100,00 = 50,00%; **aviso** | |
| Igual ao mínimo | 1.000,00; 700,00; 30% | lucro 300,00 = 30,00%; sem aviso | |
| Markup baixado | 2.520,00; 2.100,00; 30% | lucro 420,00 = 16,67%; **aviso** | |
| CT03 | 2.760,00; 1.931,10; 30% | lucro 828,90 = 30,03%; sem aviso | |
| Sem mínimo | 4.200,00; 2.100,00; (vazio) | lucro 2.100,00 = 50,00%; sem aviso | |

## Pendente: percurso de tela

Passos para a demonstração (a autora executa no navegador, local ou na VPS depois da publicação):

1. Em **Minha marcenaria → Lucro mínimo**, informar `30` e salvar.
2. Abrir um orçamento em rascunho com material R$ 1.200,00, serviço R$ 800,00 e custo adicional R$ 100,00, markup 100%. No quadro **Lucro de verdade**: R$ 2.100,00, 50,00% do preço, "dentro do mínimo".
3. Mudar o **percentual de lucro** para `20` e salvar: preço R$ 2.520,00, lucro R$ 420,00, 16,67% e o aviso "abaixo do mínimo".
4. Limpar o lucro mínimo em Minha marcenaria: o orçamento mostra o lucro e o convite para definir o mínimo, sem aviso.
5. Registrar o orçamento, baixar o PDF e conferir que ele não mostra lucro nem aviso.
6. Conferir a 1366×768 e a 390 px (RNF05).

## Limites desta evidência

Os testes automatizados não substituem o percurso de tela nem a conferência da autora. A leitura simplificada (D033) ainda precisa ser validada com o orientador.
