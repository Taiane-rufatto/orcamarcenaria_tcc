# Spec 026 — Painel do mês em cards

**Branch:** `spec/026-painel-em-cards`
**Data:** 2026-10-19
**Status:** aberta. Ajuste visual da tela do painel (specs 019 e 024), pedido pela autora.

## Clarificações

### Sessão 2026-10-19

- Q: Precisa de spec para ajuste visual? → A: sim, por AGENTS §3; é uma spec curta, como a 011.
- Q: Como ficam os rótulos? → A: sempre com a primeira letra maiúscula e o resto em minúsculas ("Em produção", "Esperando resposta"), sem caixa alta.

## Capacidade entregável

1. **Entrega:** a tela Painel do mês passa a ter um card por assunto (Mês, Meta do mês, Aprovação, O que entrou, Mão de obra, Preços dos materiais), com mais espaço entre os cards e entre as linhas de texto. Os números da aprovação viram indicadores com cor: verde para o que deu certo (aprovados, entregues), laranja para o que está em andamento (em produção, esperando resposta), vermelho para o que se perdeu (recusados, vencidos) e cinza para rascunhos. A meta ganha uma barra de progresso, verde quando batida. Nos materiais, um ponto colorido indica se o custo está subindo (vermelho), caindo (verde) ou estável (cinza). As frases deixam de ter palavras em negrito; os rótulos seguem um só padrão.
2. **Fica de fora:** qualquer mudança de cálculo, rota da API, dado ou texto das frases; gráficos; outras telas.
3. **Demonstração:** abrir o painel de outubro de 2026 com dados fictícios e ver os cards, as cores e a barra de meta em 1366×768 e a 390 px, sem rolagem horizontal.

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RF47, RF48, RF60 a RF63 | Todos os valores e frases do painel continuam iguais; a tela só exibe o que a API devolveu | `Painel.test.tsx` passa; revisão do diff |
| Cálculo (AGENTS §4) | Nenhuma conta nova no front; a barra usa o percentual que a API já devolveu | Revisão do diff |
| RNF05 | 1366×768 e 390 px sem rolagem horizontal | Captura de tela |
| Acessibilidade | A cor nunca é o único sinal: cada indicador tem rótulo em texto; contraste de texto ≥ 4,5:1 | Inspeção |
| D014 | Cores só em variáveis de `index.css` | Revisão do diff |

## Telas afetadas

- `Painel.tsx` e `Painel.test.tsx`; estilos novos no fim de `index.css`.
- Preços dos materiais no painel: a lista vira tabela com custo antes, custo agora e variação (todos os materiais mostram preço, não só os que mudaram).
- `Orcamento.tsx` (pedido de 2026-10-19): o botão "Duplicar para ajustar" sai do card Situação e vai para um card próprio, "Duplicar orçamento", logo abaixo, com o botão "Duplicar" e o texto "Cria uma cópia em rascunho, com os mesmos dados. Este orçamento não muda." Comportamento da spec 025 inalterado.
- Remoção provisória (pedido de 2026-10-19, a autora vai estudar outra forma): o card "Quanto sobra de lucro" sai de `Orcamento.tsx` e a seção "Lucro mínimo" sai de `MinhaMarcenaria.tsx`. Só a tela muda: `AvisoEquilibrio`, a API e o campo guardado continuam no código, e a spec 018 fica com essa parte suspensa até a nova versão.
- Seletor de mês do painel: clicar em qualquer ponto do campo abre o calendário dos meses (`showPicker`), não só no ícone.
- `PainelLateral.tsx`: o painel de criar e editar só fecha ao clicar no fundo escuro se o clique também começou no fundo. Selecionar texto e soltar o mouse fora do painel não o fecha mais.
- `Materiais.tsx`: o histórico de preço no painel de editar fica recolhido ("Histórico de preço (N)") e, aberto, rola dentro de uma caixa de altura fixa; assim o botão Salvar alterações não desce com muitas linhas.
- Confirmações na tela: o aviso "localhost diz" do navegador (`window.confirm`) é trocado por uma janela do próprio sistema (`hooks/useConfirmar.tsx`) em Registrar orçamento e em Inativar material, serviço, cliente e fornecedor. Mesmos textos, com título e botões "Registrar"/"Inativar" e "Cancelar"; Esc ou clique fora cancela.
- Tabela de preços: a coluna segue como "Custo antes", com um "?" ao lado que explica a RN19 em uma frase curta ("Preço de 90 dias atrás, ou o primeiro registrado."). A regra não mudou.
