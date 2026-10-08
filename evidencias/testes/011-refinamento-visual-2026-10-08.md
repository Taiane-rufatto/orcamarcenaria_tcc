# Evidências — Spec 011: refinamento visual

**Data:** 2026-10-08
**Branch:** `spec/011-refinamento-visual` · **Commit verificado:** `853ef29`
**Ambiente:** local (Windows 11, PostgreSQL local, banco principal) · **Navegador:** Microsoft Edge dirigido por Playwright, a 1366×768 (desktop) e 390×844 (celular)

Nenhum arquivo de `backend/` nem de `frontend/src/servicos/` mudou nesta spec (`git diff main...spec/011-refinamento-visual -- backend frontend/src/servicos` vazio). A única mudança tocando o memorial é o rótulo da linha "Lucro" (D027), sem alterar valor.

## Suítes automatizadas

| Verificação | Resultado |
|---|---|
| `backend/npx vitest run` | 13 arquivos, 139 testes aprovados (inclui os dez casos de `calculo.test.ts`) |
| `frontend/npm test` | 3 arquivos, 14 testes aprovados (inclui `CampoBusca` e `Memorial`) |
| `frontend/npm run lint` | sem avisos |
| `frontend/npm run build` | compilou (`tsc -b` + `vite build`) |

## Ensaio pela tela (Regressão da spec)

Script Playwright fora do repositório. Conta de ensaio própria ("Marcenaria Ensaio 011", dados fictícios), cliente "Cliente Teste 011". Os dez casos foram lidos de `008-roteiro-casos-pela-tela.md` (gerado do CSV conferido em planilha, B08) e lançados pela tela nova: **+ Novo orçamento** no painel lateral, cliente escolhido no campo com busca, itens avulsos, custos adicionais. Foram lidos os quatro valores principais do memorial e comparados à referência.

| Caso | Custo direto | Lucro | Ajuste | Preço final (tela) | Referência | Diferença |
|---|---|---|---|---|---|---|
| CT01 | R$ 289,90 | R$ 0,00 | R$ 0,00 | R$ 289,90 | R$ 289,90 | R$ 0,00 |
| CT02 | R$ 724,75 | R$ 310,61 | R$ 0,00 | R$ 1.035,36 | R$ 1.035,36 | R$ 0,00 |
| CT03 | R$ 1.931,10 | R$ 827,61 | R$ 1,29 | R$ 2.760,00 | R$ 2.760,00 | R$ 0,00 |
| CT04 | R$ 1.931,10 | R$ 579,33 | R$ 9,57 | R$ 2.520,00 | R$ 2.520,00 | R$ 0,00 |
| CT05 | R$ 41,55 | R$ 10,39 | R$ 0,00 | R$ 51,94 | R$ 51,94 | R$ 0,00 |
| CT06 | R$ 622,50 | R$ 311,25 | R$ 0,25 | R$ 934,00 | R$ 934,00 | R$ 0,00 |
| CT07 | R$ 746,25 | R$ 610,57 | R$ 3,18 | R$ 1.360,00 | R$ 1.360,00 | R$ 0,00 |
| CT08 | R$ 3.832,57 | R$ 1.277,52 | R$ 0,00 | R$ 5.110,09 | R$ 5.110,09 | R$ 0,00 |
| CT09 | R$ 1.392,74 | R$ 2.089,11 | R$ 0,15 | R$ 3.482,00 | R$ 3.482,00 | R$ 0,00 |
| CT10 | R$ 22,50 | R$ 0,00 | R$ 0,00 | R$ 22,50 | R$ 22,50 | R$ 0,00 |

**10 de 10 com diferença R$ 0,00.** Além disso, o CT03 foi lançado de novo **com material e serviço do catálogo** (cadastrados pelo painel lateral), escolhidos no campo com busca digitando sem acento ("corredica", "dobradica") e confirmando com Enter, com a quantidade digitada em seguida sem usar o mouse: mesmos valores, R$ 2.760,00.

## Critérios da spec

| Requisito | Resultado | Como foi verificado |
|---|---|---|
| RNF05 | Atendido | Sem rolagem horizontal a 1366×768 em Orçamentos, Materiais, Serviços, Clientes, Minha marcenaria e na página do orçamento (`scrollWidth ≤ innerWidth`). Capturas `*-1366.png` |
| Demonstração (orçamento CT03, 1366×768) | Atendido | Itens no centro; memorial e preço final R$ 2.760,00 à direita e visíveis; após rolar 600 px o resumo continua na janela (`orcamento-ct03-1366.png`, `orcamento-ct03-rolado-1366.png`) |
| RNF02 | Atendido | Alterar a quantidade de um item atualizou o preço final sem nenhuma navegação da página; voltar ao valor original devolveu R$ 2.760,00 |
| Celular (390 px) | Atendido | Menu vira barra no topo (390 px de largura, 149 px de altura); o resumo fica depois dos itens; sem rolagem lateral em Orçamentos, Materiais, Serviços, Clientes, Minha marcenaria e orçamento (`orcamento-390.png`, `clientes-390.png`) |
| Listas com painel lateral | Atendido | Clientes: "+ Novo" abre o painel; cadastrar, editar, inativar e reativar; chip Inativos mostra o inativo com "Reativar"; rodapé "2 clientes no total". Materiais (4) e serviços (2) cadastrados pelo painel |
| Ações da coluna da direita | Atendido | Registrar e marcar como enviado → "Cliente aprovou/recusou"; "Baixar PDF" gerou `orcamento-1.pdf`; "Cliente aprovou" marcou aprovado |
| Cálculo (AGENTS §4) | Atendido | Nenhum arquivo de `backend/` mudou; `Memorial.tsx` só exibe valores da API; o único `Number(...)` do front é `validadeDias` (dias, não valor monetário) |
| D014 | Atendido | Cores e espaçamentos só em variáveis de `index.css` (revisão do diff) |
| RNF26 | Atendido | Textos novos ou movidos em português do Brasil (inspeção) |
| Erros | Nenhum | Nenhum erro de página nem de console durante todo o ensaio |

**45 de 45 verificações automáticas aprovadas.**

## Isolamento (TI01–TI04)

Não reexecutados: a spec não criou nem alterou consulta a dados (`backend/` inalterado; a suíte de integração, que contém TI01–TI04, segue aprovada nos 139 testes).

## O que esta execução prova e o que não prova

- **Prova:** a interface nova, com painel lateral, campo com busca e resumo à direita, exibe exatamente o que a API calcula nos dez casos; o layout atende RNF05 e o comportamento do resumo fixo e do celular combinado na spec.
- **Não prova:** a execução formal pela autora (008, D025) não foi repetida; ela continua valendo porque o cálculo não mudou (backend inalterado, suíte verde). Este ensaio foi automatizado. Não há capturas "antes" para comparação lado a lado (o estado anterior está em `main`). Só o Edge foi usado; Chrome, Firefox e celular real não foram testados. A revisão humana do diff (DoD §7.3) está pendente (B18).

## Capturas

`011-capturas/`: cadastro, clientes (lista, painel, inativos), materiais, serviços, minha marcenaria, orçamentos, campo com busca, orçamento CT03 (inicial, rolado, registrado) a 1366×768; orçamento e clientes a 390 px. Todos os dados são fictícios.
