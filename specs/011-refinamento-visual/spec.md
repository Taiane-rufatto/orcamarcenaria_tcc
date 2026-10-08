# Spec 011 — Refinamento visual

**Branch:** `spec/011-refinamento-visual`
**Data:** 2026-10-01
**Status:** fechada em 2026-10-08. Implementada em 2026-10-01 com a autora, ajuste a ajuste (D026, D027); ensaio dos dez casos pela tela e critérios verificados em `evidencias/testes/011-refinamento-visual-2026-10-08.md`; diff revisado e integrado em `main` (B18)

## Clarificações

### Sessão 2026-10-01

- Q: Qual o modelo? → A: a proposta "Bancada" do estudo de propostas de design (artifact de 2026-09-30), em versão mais limpa (D026).
- Q: Até onde vai a mudança? → A: visual + layout. Menu lateral, cartões, tabelas e botões mais limpos, e no orçamento o resumo fixo à direita. Os formulários continuam onde estão.
- Q: Cores? → A: as atuais (verde musgo, laranja de cedro, papel claro), um pouco mais claras.
- Q: Tipografia? → A: só sem serifa (Figtree); sai a Young Serif.
- Q: Régua? → A: fica discreta: no painel de acesso e na marca, não no cabeçalho.
- Q: Como escolher entre muitos materiais, serviços ou clientes? → A: campo com busca no lugar da lista suspensa, em todas as escolhas desse tipo (material, serviço e cliente).
- Q: Como ficam as listas de cadastro? → A: como o mockup "Lista de materiais" do estudo: botão "+ Novo" no topo, busca com chips Ativos/Inativos/Todos, botões Editar e Inativar em cada linha e contador no rodapé; criar e editar num painel lateral. "Duplicar" não entra (funcionalidade nova, fora do escopo).

## Capacidade entregável

1. **Entrega:** as telas internas passam a ter menu lateral fixo com a marca no topo e o "Sair" no rodapé do menu. Listas e formulários ficam em cartões brancos, com tabelas mais leves e botões planos. Materiais, serviços e clientes abrem na lista, com botão "+ Novo" no topo, busca com chips de situação, botões Editar e Inativar (ou Reativar) visíveis em cada linha e contador no rodapé; criar e editar acontecem num painel lateral. Em Orçamentos, "+ Novo orçamento" abre o mesmo painel. Na página do orçamento, o memorial de cálculo, o preço final e as ações de situação (registrar, aprovado, recusado, baixar PDF) ficam numa coluna à direita que acompanha a rolagem, enquanto itens, custos e dados ficam no centro.
2. **Fica de fora:** duplicar registro; ações da linha só ao passar o mouse; desfazer inativação; máscara de moeda nos campos; tema escuro; mudanças no PDF; qualquer mudança de regra, rota da API ou dado.
3. **Demonstração:** em 1366×768, abrir o orçamento do CT03 e ver, sem rolagem horizontal, os itens no centro e o preço final R$ 2.760,00 com o memorial à direita; rolar os itens e o resumo continua visível; no celular (390 px), o menu vira barra no topo e o resumo desce para depois dos itens.

## Paleta (mesmos matizes de D014, mais claros)

| Papel | Hoje | Proposto | Contraste do texto |
|---|---|---|---|
| Fundo da página (`--papel`) | `#f3eee3` | `#f7f5f0` | tinta 13,9:1 |
| Cartão (`--folha`) | `#fbf8f1` | `#ffffff` | tinta 15:1 |
| Linhas e bordas (`--linha`) | `#d9d1bf` | `#e6e1d5` | decorativo |
| Verde estrutura (`--verde`) | `#1e4d38` | `#2d6a4f` | branco sobre ele 6,4:1 |
| Verde escuro (`--verde-escuro`) | `#143626` | `#1f4e39` | 8,3:1 sobre verde claro |
| Verde claro (`--verde-claro`) | `#e0ebe2` | `#e9f2ec` | fundo de selo e item ativo do menu |
| Laranja ação (`--laranja`) | `#e8722d` | `#f08a4b` | tinta sobre ele 6,3:1 |
| Laranja texto (`--laranja-escuro`) | `#c85a1a` | `#a33a12` | 5,8:1 sobre laranja claro |
| Laranja claro (`--laranja-claro`) | `#fbe6d6` | `#fdeee3` | fundo de selo |
| Texto secundário (`--tinta-suave`) | `#4f5d52` | `#56635a` | 5,8:1 sobre o fundo |

Texto principal (`--tinta` `#17261d`) e erro (`#9e2a1d`) não mudam. Todo par de texto fica acima de 4,5:1 (WCAG 2.2 AA).

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RNF05 | Todas as telas internas em 1366×768 sem rolagem horizontal da página, com menu lateral e, no orçamento, a coluna de resumo | Inspeção visual + percurso de tela |
| RNF02 | Ao incluir, alterar ou remover item, o memorial e o preço final na coluna à direita atualizam sem recarregar | Percurso de tela |
| Cálculo (AGENTS §4) | O front continua só exibindo valores da API; `Memorial.tsx` não ganha nenhuma conta | Revisão do diff + teste existente de `Memorial` |
| RNF26 | Textos novos ou movidos em português do Brasil | Inspeção |
| D014 | Cores, fontes e espaçamentos continuam só em variáveis de `index.css` | Revisão do diff |
| Celular | Em 390 px o menu vira barra no topo e o resumo vem depois dos itens, sem rolagem lateral | Percurso de tela a 390 px |
| Regressão | Ensaio dos dez casos pela tela (Edge + Playwright) passa 10 de 10 com diferença R$ 0,00 | Ensaio, como no 008 |

## Telas afetadas

- `Layout` (menu lateral), `Marca`, `PainelAcesso` (entrar e cadastro).
- Listas e cadastros: Materiais, Serviços e Clientes (lista + painel lateral), Orçamentos (lista + painel para o novo), Minha marcenaria (só estilo).
- Componentes novos: `PainelLateral` (sobre o `<dialog>` do navegador), `FiltroLista` e `CampoBusca`.
- Escolha de material, serviço e cliente: o `<select>` vira campo com busca (`CampoBusca`), que filtra enquanto digita (sem diferenciar maiúsculas e acentos), escolhe com ↑↓ e Enter e leva o foco ao campo seguinte. A busca é feita na lista que a tela já carrega; a API não muda.
- Orçamento: reorganizado em duas colunas (centro e resumo à direita).
- `index.html`: sai a Young Serif do carregamento de fontes.

## Regras e restrições

- Nenhuma mudança em `backend/`, nos serviços do front (`servicos/`) ou nas regras de cálculo.
- Nenhum componente novo além de painel lateral, menu da linha e filtro de lista.

## Evidências previstas

Capturas de tela antes e depois (1366×768 e 390 px), ensaio dos dez casos e registro em `evidencias/testes/011-refinamento-visual-AAAA-MM-DD.md`.

## Perguntas em aberto

- Nenhuma.
