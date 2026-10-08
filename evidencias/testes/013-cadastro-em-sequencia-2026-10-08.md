# Evidências — Spec 013: cadastro em sequência

**Data:** 2026-10-08
**Branch:** `spec/013-cadastro-em-sequencia` · **Base:** `main` em `b4b9fbb` (011 e 012 integrados)
**Ambiente:** local (Windows 11, PostgreSQL local, banco principal) · **Navegador:** Microsoft Edge dirigido por Playwright, a 1366×768 e 390×844

Nenhum arquivo de `backend/` nem de `frontend/src/servicos/` mudou (`git diff main -- backend frontend/src/servicos` vazio). Mudaram só `Materiais.tsx`, `Servicos.tsx`, `Clientes.tsx` e uma regra de `index.css`.

## Suítes automatizadas

| Verificação | Resultado |
|---|---|
| `backend/npx vitest run` | 14 arquivos, 142 testes aprovados |
| `frontend/npm test` | 3 arquivos, 14 testes aprovados |
| `frontend/npm run lint` e `npm run build` | sem avisos; compilou |

## Ensaio pela tela

Script Playwright fora do repositório, conta de ensaio própria ("Marcenaria Ensaio 013", dados fictícios). **65 de 65 verificações aprovadas.**

| Critério da spec | Resultado |
|---|---|
| "Salvar e cadastrar outro" grava, mantém o painel aberto, limpa o formulário e leva o foco ao Nome | Atendido em Materiais, Serviços e Clientes |
| Unidade (material) e tipo de cobrança (serviço) continuam escolhidos | Atendido: unidade `kg` e cobrança "Por unidade" mantidas para o item seguinte |
| Confirmação "✓ <nome> cadastrado" e item na lista atrás do painel | Atendido nas três telas |
| Cadastrar três materiais seguidos só com o botão novo e o teclado | Atendido: o segundo e o terceiro foram digitados a partir do foco no Nome (nome, Tab, Tab, custo) |
| Botão principal ("Cadastrar ...") fecha o painel e a tecla Enter salva e fecha, como antes | Atendido |
| Na edição o botão novo não existe (só "Salvar alterações") | Atendido nas três telas |
| Erro de validação: nada é gravado, o painel mantém os dados e mostra a mensagem | Atendido: custo 0 → API recusa, painel aberto com "Seq E" preservado, sem confirmação, item não gravado |
| RNF05: sem rolagem horizontal com o painel aberto | Atendido a 1366×768 e a 390 px |
| Dez casos de cálculo pela tela (Regressão) | **10 de 10 com diferença R$ 0,00** (mesmo roteiro do 011; CT03 = R$ 2.760,00) |
| Nenhum erro de página ou de console | Atendido, exceto o aviso do navegador sobre o `400` do caso de erro proposital (esperado, contado e filtrado) |

| Caso | Preço final (tela) | Referência | Diferença |
|---|---|---|---|
| CT01 | R$ 289,90 | R$ 289,90 | R$ 0,00 |
| CT02 | R$ 1.035,36 | R$ 1.035,36 | R$ 0,00 |
| CT03 | R$ 2.760,00 | R$ 2.760,00 | R$ 0,00 |
| CT04 | R$ 2.520,00 | R$ 2.520,00 | R$ 0,00 |
| CT05 | R$ 51,94 | R$ 51,94 | R$ 0,00 |
| CT06 | R$ 934,00 | R$ 934,00 | R$ 0,00 |
| CT07 | R$ 1.360,00 | R$ 1.360,00 | R$ 0,00 |
| CT08 | R$ 5.110,09 | R$ 5.110,09 | R$ 0,00 |
| CT09 | R$ 3.482,00 | R$ 3.482,00 | R$ 0,00 |
| CT10 | R$ 22,50 | R$ 22,50 | R$ 0,00 |

## Isolamento (TI01–TI04)

Não reexecutados: nenhuma consulta a dados foi criada ou alterada (`backend/` inalterado; a suíte de integração, que contém TI01–TI04, segue aprovada).

## O que esta execução prova e o que não prova

- **Prova:** o botão novo faz o que a spec promete nas três telas, sem mudar o comportamento anterior (botão principal, Enter, edição), e o cálculo continua igual.
- **Não prova:** o ensaio foi automatizado e só no Edge; a **percepção de uso** (se o fluxo ficou mesmo menos cansativo) depende da autora usar na carga real do catálogo. Os ensaios do 011 e do 013 reaproveitam o mesmo roteiro dos dez casos, com itens avulsos.
- A confirmação "✓ ... cadastrado" some ao abrir o painel de novo ou ao ocorrer um erro; ela não tem tempo de expiração.

## Capturas

`013-capturas/`: painel de novo material com a confirmação (1366×768 e 390 px), caso de erro, e as telas do ensaio dos dez casos. Dados fictícios.
