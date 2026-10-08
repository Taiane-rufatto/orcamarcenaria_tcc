# Evidências — Spec 014: cadastro pelo teclado

**Data:** 2026-10-08
**Branch:** `spec/014-cadastro-pelo-teclado` · **Base:** `main` em `a5dd068` (011, 012 e 013 integrados)
**Ambiente:** local (Windows 11, PostgreSQL local, banco principal) · **Navegador:** Microsoft Edge dirigido por Playwright, a 1366×768 e 390×844

Nenhum arquivo de `backend/` nem de `frontend/src/servicos/` mudou. Mudaram só `Materiais.tsx`, `Servicos.tsx` e `Clientes.tsx`.

## Suítes automatizadas

| Verificação | Resultado |
|---|---|
| `backend/npx vitest run` | 14 arquivos, 142 testes aprovados |
| `frontend/npm test` | 3 arquivos, 14 testes aprovados |
| `frontend/npx tsc -b` e `npx eslint src` | sem avisos |

## Ensaio pela tela

Script Playwright fora do repositório, conta de ensaio própria ("Marcenaria Ensaio 014", dados fictícios). **65 de 65 verificações aprovadas.** As etapas herdadas do 011 (cadastros prévios) foram ajustadas para fechar o painel com Esc, porque o painel agora continua aberto depois de cadastrar.

| Critério da spec | Resultado |
|---|---|
| Enter no painel de novo cadastro grava, mantém o painel aberto, deixa o formulário em branco e leva o foco ao Nome | Atendido em Materiais, Serviços e Clientes |
| Três cadastros seguidos só com o teclado (digitar, Tab, Tab, valor, Enter) | Atendido em Materiais (Seq A, B e C) |
| Unidade (material) e tipo de cobrança (serviço) mantidos para o próximo | Atendido: `kg` e "Por unidade" |
| Esc, ✕ e botão "Fechar" fecham o painel; os itens estão na lista | Atendido |
| O botão "Cadastrar ..." tem o mesmo efeito do Enter (continua aberto) | Atendido em Serviços |
| Enter repetido não duplica | Atendido: dois Enter seguidos geraram um único "Seq D" |
| Erro (custo 0): nada gravado, painel e dados mantidos, mensagem exibida | Atendido |
| Na edição: Enter salva e fecha, sem a dica de sequência e com "Cancelar" | Atendido |
| Sem o botão "Salvar e cadastrar outro" | Atendido |
| RNF05 a 1366×768 e a 390 px com o painel aberto | Atendido |
| Dez casos de cálculo pela tela | **10 de 10 com diferença R$ 0,00** (CT01 R$ 289,90; CT02 R$ 1.035,36; CT03 R$ 2.760,00; CT04 R$ 2.520,00; CT05 R$ 51,94; CT06 R$ 934,00; CT07 R$ 1.360,00; CT08 R$ 5.110,09; CT09 R$ 3.482,00; CT10 R$ 22,50) |
| Nenhum erro de página ou de console | Atendido, exceto o aviso do navegador sobre o `400` do caso de erro proposital (esperado, contado e filtrado) |

## Isolamento (TI01–TI04)

Não reexecutados: nenhuma consulta a dados foi criada ou alterada; a suíte de integração segue aprovada.

## O que esta execução prova e o que não prova

- **Prova:** o fluxo do teclado funciona nas três telas, a edição segue como antes e o cálculo não mudou.
- **Não prova:** o ensaio é automatizado e só no Edge. Se o fluxo ficou ágil na prática, depende de a autora usar na carga real do catálogo.
- **Efeito colateral aceito (D031):** quem cadastra um item só e quer sair precisa apertar Esc ou ✕, porque o painel continua aberto; a dica na tela diz isso.

## Capturas

`014-capturas/`: painel de novo material com a confirmação e a dica de teclado (1366×768 e 390 px) e as telas do ensaio dos dez casos. Dados fictícios.
