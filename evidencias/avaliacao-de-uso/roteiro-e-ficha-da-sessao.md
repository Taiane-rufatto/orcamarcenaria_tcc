# Avaliação exploratória de uso — roteiro e ficha da sessão

Preparação do incremento 009 (OE7, RNF01, US16), conforme `documentacao/qualidade-e-testes.md` §5 e a proposta. **Só aplicar depois do termo de consentimento assinado (B06).** Todos os dados abaixo são fictícios (RNF15).

## 1. Antes da sessão (pesquisadora)

- [ ] Termo de consentimento validado pelo orientador e assinado (duas vias).
- [ ] Sistema rodando (API e tela) e testado no computador que será usado.
- [ ] Conta nova só para a sessão, por exemplo **"Marcenaria Avaliação"**, com a configuração padrão (markup 150%, sem arredondamento, validade 10 dias). Não mexer nos padrões.
- [ ] Nessa conta, deixar cadastrados **antes**: o cliente **"Cliente Exemplo"** e o material **"Dobradiça com amortecedor"** (pç, R$ 7,50).
- [ ] Cronômetro (celular) e esta ficha impressa ou aberta em outra tela.
- [ ] Sessão já logada na conta, na página de Orçamentos.

## 2. Fala de abertura (ler ou dizer com as próprias palavras)

> "Vou pedir que você faça cinco tarefas no sistema. É o sistema que está sendo avaliado, não você: se algo ficar difícil, é um problema dele. Tente fazer sozinho e vá falando em voz alta o que está pensando. Eu só vou ajudar se você pedir ou se ficar travado. Pode parar a qualquer momento."

Como participante e pesquisadora são da mesma família, reforçar que críticas ajudam o trabalho, e perguntar "o que atrapalhou?" mesmo quando ele disser que está tudo bem.

Durante as tarefas: não indicar onde clicar. Se o participante pedir ajuda ou ficar parado por mais de 2 minutos, ajudar e marcar **"com ajuda"**.

## 3. Tarefas (dados para entregar ao participante)

| # | Tarefa | Dados |
|---|---|---|
| 1 | Cadastrar um material informando unidade e custo | **MDF branco 15 mm**, unidade **ch**, custo **R$ 245,00** |
| 2 | Cadastrar um serviço com valor por hora | **Montagem**, por hora, **R$ 60,00** |
| 3 | Compor um orçamento para um cliente, com pelo menos três itens e um custo adicional | Cliente **Cliente Exemplo**, projeto **Armário de lavanderia**: 2 ch de MDF branco 15 mm, 8 dobradiças com amortecedor, 4 h de montagem; custo adicional **Frete R$ 80,00**. Manter o lucro como está |
| 4 | Conferir o valor total no memorial de cálculo | Pedir que explique, olhando a tela, de onde vem o preço final |
| 5 | Registrar o orçamento e gerar o PDF | — |

**Valores esperados na tarefa 3/4** (markup 150%, sem arredondamento): materiais R$ 550,00 · serviços R$ 240,00 · adicionais R$ 80,00 · custo direto R$ 870,00 · lucro R$ 1.305,00 · **preço final R$ 2.175,00**. Se o participante mudar o lucro, anotar o que escolheu; o valor esperado muda.

**RNF01 (até 5 minutos):** cronometrar da criação do orçamento (tarefa 3) até o registro (tarefa 5, antes do PDF). O requisito fala em "usuário treinado"; como é o primeiro uso, registrar o tempo como observado e, se houver tempo, repetir a tarefa 3 com outro projeto para medir o segundo uso.

## 4. Ficha de registro

**Data:** ____/____/______ · **Início:** ____:____ · **Fim:** ____:____ · **Local / computador:** ______________ · **Navegador:** ______________

| # | Resultado | Tempo | Erros cometidos | Dúvidas verbalizadas | Observações |
|---|---|---|---|---|---|
| 1 | ☐ sem ajuda ☐ com ajuda ☐ não concluída | | | | |
| 2 | ☐ sem ajuda ☐ com ajuda ☐ não concluída | | | | |
| 3 | ☐ sem ajuda ☐ com ajuda ☐ não concluída | | | | Preço final obtido: R$ ________ |
| 4 | ☐ sem ajuda ☐ com ajuda ☐ não concluída | | | | Explicou o memorial? ☐ sim ☐ em parte ☐ não |
| 5 | ☐ sem ajuda ☐ com ajuda ☐ não concluída | | | | PDF aberto? ☐ sim ☐ não |

**RNF01 — tempo da criação ao registro:** 1º uso ____ min ____ s · 2º uso (se houver) ____ min ____ s

## 5. Questionário final

Escala: 1 = discordo totalmente · 5 = concordo totalmente. Anotar a justificativa com as palavras do participante.

| # | Pergunta | Nota (1–5) | Justificativa |
|---|---|---|---|
| 1 | As telas deixam claro o que fazer em cada etapa? | | |
| 2 | Os nomes usados (material, serviço, custo adicional, margem) correspondem ao vocabulário do dia a dia da marcenaria? | | |
| 3 | O fluxo de composição do orçamento corresponde à forma como você orça hoje? | | |
| 4 | O valor apresentado pelo sistema é confiável a ponto de você entregá-lo ao cliente? | | |
| 5 | O que faltou ou atrapalhou? *(aberta, sem nota)* | — | |

## 6. Depois da sessão

- Passar a ficha a limpo em `evidencias/avaliacao-de-uso/avaliacao-AAAA-MM-DD.md`, sem nome do participante nem dados reais.
- Sugestões novas do participante vão para `documentacao/roadmap.md` §5, não para o código (escopo fechado).
- Declarar as limitações: participante único; o resultado é evidência do estudo de caso, não medida de usabilidade generalizável. **O participante é pai da pesquisadora**, o que pode deixar notas e comentários mais favoráveis: dar mais peso ao que foi observado (erros, ajudas, tempos) do que às notas do questionário.
