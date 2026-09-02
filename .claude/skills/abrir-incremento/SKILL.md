---
name: abrir-incremento
description: Abre um incremento do roadmap do OrçaMarcenaria como nova Spec — confere pré-condições, reúne o contexto obrigatório, delimita a capacidade entregável e prepara a especificação antes de qualquer código. Use ao iniciar um novo incremento, ao criar uma spec ou quando pedirem para começar a próxima etapa do desenvolvimento.
---

# Abrir um incremento

Um incremento só começa quando o anterior está fechado e quando existe clareza sobre o que será entregue. Abrir cedo demais produz especificação vaga, e especificação vaga é a origem de código sem valor.

Executar as cinco etapas na ordem.

---

## 1. Confirmar que é permitido abrir

Antes de qualquer coisa, verificar:

| Verificação | Onde | Se falhar |
|---|---|---|
| O incremento anterior está fechado conforme a Definição de Pronto | `documentacao/qualidade-e-testes.md` §7 | Fechar o anterior primeiro |
| O incremento é o próximo na ordem do roadmap | `documentacao/roadmap.md` §2 | Justificar a inversão em `documentacao/decisoes.md` |
| As dependências declaradas estão concluídas | coluna "Depende de" do roadmap | Não abrir |
| Nenhum bloqueio impede esta frente | `BLOQUEIOS.md` | Abrir outra frente ou registrar o impedimento |

Incremento fora de ordem sem justificativa registrada é desvio de método, e o método faz parte do que será avaliado na banca.

## 2. Reunir o contexto obrigatório

Ler, sempre, antes de escrever a spec:

- `AGENTS.md` — regras invioláveis do repositório
- as histórias listadas para o incremento em `documentacao/roadmap.md`, com seus critérios de aceitação
- os requisitos citados por essas histórias em `documentacao/requisitos.md`
- `documentacao/regras-de-calculo.md`, se o incremento tocar em qualquer valor monetário
- `documentacao/arquitetura.md`, seções afetadas
- `documentacao/decisoes.md` — o que já foi decidido e o que ainda é provisório

Decisão marcada como **provisória** que o incremento vai consumir é sinal de alerta: ou ela é confirmada agora, ou a spec declara explicitamente que assume o valor provisório e o que muda se ele for diferente.

## 3. Delimitar a capacidade entregável

Escrever, antes da spec, três frases curtas:

1. **O que este incremento entrega** em termos de comportamento observável pelo marceneiro — não em termos de tecnologia.
2. **O que fica de fora**, listando explicitamente o que alguém poderia esperar e não virá agora.
3. **Como será demonstrado** ao final: qual tela, qual valor, qual arquivo prova que funcionou.

Teste de tamanho: se não é possível demonstrar o resultado sem concluir outros incrementos, a fatia está grande demais. Se o resultado não é observável por ninguém além do desenvolvedor, está pequena demais ou é tarefa técnica disfarçada de capacidade.

## 4. Escrever a especificação

Criar `specs/NNN-nome-curto/` (número e nome conforme o roadmap) e produzir a spec cobrindo:

- objetivo do incremento e as histórias que ele fecha, citadas por ID;
- requisitos atendidos, citados por ID (RF/RNF) — se algum requisito for tocado mas não fechado, dizer o que fica pendente;
- regras de negócio envolvidas (RN), com referência ao documento, **nunca reescritas com variação local**;
- critérios de aceitação verificáveis, herdados das histórias;
- evidência que será produzida: quais testes, quais casos, qual registro em `evidencias/`;
- fora do escopo deste incremento;
- perguntas em aberto.

Regra: cada critério de aceitação precisa dizer **como se verifica**. "Deve funcionar corretamente" não é critério.

## 5. Esclarecer antes de planejar

Percorrer as perguntas em aberto da spec e resolvê-las **antes** de planejar tarefas:

- ambiguidade de requisito → perguntar à autora e registrar a resposta em `documentacao/decisoes.md`;
- decisão que depende do marceneiro → `BLOQUEIOS.md`, e seguir por outra frente;
- conflito entre dois documentos → resolver explicitamente, atualizar a fonte canônica e registrar a decisão.

Só depois disso seguir para plano e tarefas.

---

## Antes de considerar o incremento aberto

- [ ] incremento anterior fechado e dependências concluídas
- [ ] nenhum bloqueio impeditivo para esta frente
- [ ] histórias, requisitos e regras aplicáveis lidos e citados por ID
- [ ] capacidade delimitada em entrega, exclusões e forma de demonstração
- [ ] spec criada em `specs/NNN-nome-curto/`
- [ ] todo critério de aceitação com forma de verificação declarada
- [ ] ambiguidades resolvidas ou registradas em `decisoes.md` / `BLOQUEIOS.md`
- [ ] `ESTADO_ATUAL.md` atualizado com o incremento corrente
