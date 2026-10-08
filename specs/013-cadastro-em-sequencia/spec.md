# Spec 013 — Cadastro em sequência

**Branch:** `spec/013-cadastro-em-sequencia` (criada do `main`, com 011 e 012 integrados)
**Data:** 2026-10-08
**Status:** aberta; clarificações resolvidas, pronta para plano e tarefas (D030)

## Contexto

No 011, criar um cadastro abre um painel lateral que, ao salvar, fecha. Quem monta o catálogo cadastra muitos materiais e serviços seguidos e precisa clicar em "+ Novo ..." a cada um. A autora apontou o desgaste em 2026-10-08, e o marceneiro vai fazer essa carga antes da avaliação de uso (009).

## Histórias e requisitos

Histórias: US03 (cadastrar material), US05 (cadastrar serviços), US06 (cadastrar clientes). Requisitos tocados: RF11, RF17, RF08 (cadastro), sem mudar o que cada um exige; RNF01 (tempo de composição, indiretamente), RNF03 e RNF26 (mensagens em português). Nenhum requisito novo.

## Clarificações

### Sessão 2026-10-08

- Q: O que muda? → A: no painel de **criação**, um segundo botão, "Salvar e cadastrar outro", salva, mantém o painel aberto e limpa o formulário. O botão atual (Cadastrar ...) continua salvando e fechando.
- Q: E a tecla Enter? → A: continua salvando e fechando, como hoje (decidido pela autora).
- Q: Onde vale? → A: Materiais, Serviços e Clientes. Na edição, nada muda (só "Salvar alterações"). Em Orçamentos, "+ Novo orçamento" fica como está: criar leva à página do orçamento.
- Q: O que o formulário guarda para o próximo? → A: o **cursor volta ao campo Nome**. Fica escolhida a **unidade** (materiais) e o **tipo de cobrança** (serviços), porque cadastros em sequência costumam repetir. Os demais campos esvaziam.
- Q: Como a pessoa sabe que o anterior entrou? → A: uma confirmação no painel ("✓ <nome> cadastrado") e a lista atrás do painel já com o novo item.
- Q: E se der erro ao salvar? → A: o painel fica como está, com os dados digitados e a mensagem de erro, como hoje.

## Capacidade entregável

1. **Entrega:** no painel de novo material, novo serviço e novo cliente, o botão "Salvar e cadastrar outro" permite cadastrar vários itens sem reabrir o painel, com foco no Nome e confirmação do item salvo.
2. **Fica de fora:** cadastro em tabela com várias linhas de uma vez; importação de planilha; duplicar registro; mudar o comportamento do Enter; qualquer mudança de regra, rota da API ou dado.
3. **Demonstração:** em Materiais, em 1366×768, abrir "+ Novo material", cadastrar três materiais seguidos só com o botão novo e o teclado, e ver os três na lista; no fim, fechar o painel. Repetir em Serviços e Clientes.

## Requisitos e critérios verificáveis

| Critério | Verificação |
|---|---|
| "Salvar e cadastrar outro" grava o item, mantém o painel aberto, limpa o formulário e leva o foco ao Nome | Percurso de tela (Edge + Playwright) |
| A unidade (material) e o tipo de cobrança (serviço) continuam escolhidos para o próximo | Percurso de tela |
| Aparece "✓ <nome> cadastrado" e o item entra na lista atrás do painel | Percurso de tela |
| "Cadastrar material/serviço/cliente" (botão atual) e a tecla Enter salvam e fecham, como antes | Percurso de tela |
| Na edição o botão novo não existe | Percurso de tela |
| Com erro de validação (ex.: custo vazio ou zero), nada é gravado, o painel mantém os dados e mostra a mensagem | Percurso de tela |
| RNF05: sem rolagem horizontal a 1366×768 e a 390 px, com o painel aberto | Inspeção + percurso |
| Nenhuma mudança em `backend/` nem em `frontend/src/servicos/` | Revisão do diff |
| Os dez casos de cálculo seguem iguais (Regressão) | Suíte do backend + ensaio dos dez casos pela tela, como no 011 |

## Telas afetadas

`Materiais`, `Servicos` e `Clientes` (formulário do painel). Se o botão e a confirmação forem iguais nas três, extrair um pequeno componente de rodapé do formulário; sem criar camadas além disso (AGENTS §7).

## Regras e restrições

- Nenhuma mudança em cálculo, API, banco ou serviços do front.
- Cores e espaçamentos só em variáveis de `index.css` (D014); o botão novo usa o estilo `secundario` já existente.
- Textos em português do Brasil.

## Evidências previstas

Percurso de tela e ensaio dos dez casos; registro em `evidencias/testes/013-cadastro-em-sequencia-AAAA-MM-DD.md` com capturas.

## Perguntas em aberto

- Nenhuma.
