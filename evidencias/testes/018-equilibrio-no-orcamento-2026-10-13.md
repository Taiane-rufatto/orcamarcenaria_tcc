# Evidência — Incremento 018: meta mensal e aviso de equilíbrio

**Data:** 2026-10-13 · **Spec:** `specs/018-equilibrio-no-orcamento/spec.md` · **Decisão:** D033 · **Requisitos:** RF44–RF46, US17, RN12–RN13

> **Situação:** implementado e verificado por testes automatizados. **Pendentes (dependem da autora):** conferência dos valores em planilha e percurso de tela pelo navegador. Por isso o incremento ainda **não está fechado**.

## O que foi verificado automaticamente

| Critério da spec | Resultado | Como |
|---|---|---|
| Fórmula (RN12, RN13) com casos abaixo, acima, igual, sem horas, sem meta, arredondamento e contribuição negativa | 19 testes passam | `backend/tests/unidade/equilibrio.test.ts` |
| `calcularOrcamento` e CT01–CT10 inalterados | Suíte do backend inteira: **16 arquivos, 183 testes passam** (inclui os 21 novos de integração) | `npx vitest run` em `backend/`; `calculo.ts` sem alteração (`git diff` vazio nele) |
| Sem horas, sem meta ou horas produtivas zero: nenhum aviso e nenhum erro | passa | unidade + integração (`aviso no orçamento`) |
| Validação da API: vírgula decimal, zero, negativo, 3 casas, letras, mais de 744 h/mês, horas estimadas acima de 99.999,99 | 400 com mensagem em português | integração (`recusa com 400`) |
| Isolamento: a meta de uma marcenaria não aparece em outra | passa | integração |
| O aviso e as horas não aparecem no PDF do cliente | passa | `conteudo-pdf.test.ts` (termos internos proibidos ampliados) |
| Orçamento registrado: horas travadas (409) e aviso com a meta atual | passa | integração |
| Migração `010` idempotente, aplicada no banco local e no de teste | executada duas vezes sem erro | `npm run migrar` |
| Tela: aviso abaixo, acima, sem horas e sem meta | 4 testes passam; frontend **18 testes**, lint e build limpos | `AvisoEquilibrio.test.tsx` |

## Valores usados (fictícios, conferíveis à mão)

Meta R$ 8.000,00 ÷ 160 h = **R$ 50,00** por hora. Orçamento (markup 100%, sem arredondamento): material R$ 1.200,00 + serviço R$ 800,00 + adicional R$ 100,00 → custo direto R$ 2.100,00, **preço final R$ 4.200,00**. Contribuição = 4.200,00 − 1.200,00 − 100,00 = **R$ 2.900,00**.

| Horas | Valor por hora | Aviso |
|---|---|---|
| 40 | R$ 72,50 | não |
| 80 | R$ 36,25 | sim |

Outro exemplo da spec: preço R$ 2.760,00, materiais R$ 1.200,00, adicionais R$ 100,00 → contribuição R$ 1.460,00; 40 h → R$ 36,50 (aviso); 25 h → R$ 58,40; 29,2 h → R$ 50,00 (sem aviso). O preço final não muda em nenhum caso.

## Pendente: conferência da autora (planilha)

Conferir em planilha, com ao menos os quatro casos abaixo, e anotar aqui "confere" ou a diferença:

| Caso | Meta, horas | Preço, materiais, adicionais, horas estimadas | Esperado | Autora |
|---|---|---|---|---|
| Abaixo | 8.000,00 e 160 h | 4.200,00; 1.200,00; 100,00; 80 h | 36,25 por hora; **aviso** | |
| Acima | 8.000,00 e 160 h | 4.200,00; 1.200,00; 100,00; 40 h | 72,50 por hora; sem aviso | |
| Igual | 8.000,00 e 160 h | 2.760,00; 1.200,00; 100,00; 29,2 h | 50,00 por hora; sem aviso | |
| Sem horas | 8.000,00 e 160 h | qualquer; horas em branco | nenhum aviso | |

## Pendente: percurso de tela

Passos para a demonstração (a autora executa no navegador, local ou na VPS depois da publicação):

1. Em **Minha marcenaria → Meta do mês**, informar `8000,00` e `160`; ver "Você precisa de R$ 50,00 por hora de trabalho".
2. Abrir um orçamento em rascunho com material R$ 1.200,00, serviço R$ 800,00 e custo adicional R$ 100,00 (markup 100%).
3. Em **Horas estimadas de trabalho**, informar `80` e salvar; no quadro **Equilíbrio do mês**, ver R$ 36,25 por hora e o aviso.
4. Trocar para `40`: o aviso some e aparece a confirmação. Apagar o campo: aparece "Informe as horas estimadas…".
5. Conferir que o **Preço final** continua R$ 4.200,00 em todos os passos e que o PDF do cliente não mostra nada disso.
6. Conferir a 1366×768 e a 390 px (RNF05).

## Limites desta evidência

Os testes automatizados não substituem o percurso de tela nem a conferência da autora. A leitura simplificada do ponto de equilíbrio (D033) ainda precisa ser validada com o orientador.
