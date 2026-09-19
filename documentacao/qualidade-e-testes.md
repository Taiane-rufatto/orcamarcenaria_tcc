# Qualidade e Testes

Versão 1.0 · Define como o projeto comprova que funciona. Atende aos objetivos específicos OE6 e OE8 e ao critério de aprovação da proposta: **diferença nula entre o cálculo manual de referência e o cálculo do sistema, após o arredondamento definido**.

## 1. Estratégia

| Nível | O que cobre | Quando executa |
|---|---|---|
| Testes de unidade do domínio | RN01–RN11 (cálculo puro, sem banco nem interface) | A cada alteração no módulo de cálculo; obrigatório antes de fechar qualquer Spec |
| Testes de integração | Casos de uso com banco: criação, registro, isolamento por marcenaria | Ao fechar Spec que crie ou altere caso de uso |
| Testes funcionais manuais | Os 10 casos da §3, executados pela interface | Incremento 008, e novamente antes da entrega final |
| Teste de isolamento multi-tenant | RNF12 | Em toda Spec que crie consulta a dados |
| Avaliação exploratória de uso | RNF01, OE7 | Incremento 009, com o proprietário da marcenaria |

Evidências ficam em `evidencias/`, referenciadas pelo número da Spec e pela data de execução.

## 2. Critérios de aprovação

| Critério | Meta |
|---|---|
| Casos de teste de cálculo | 10 de 10 com diferença R$ 0,00 |
| RF de prioridade Essencial | 100% implementados e verificados na matriz da §6 |
| Defeitos abertos de severidade alta ao final | Zero |
| Teste de isolamento entre contas | Aprovado |
| Roteiro de uso com o proprietário | 5 de 5 tarefas concluídas, com registro de erros e dúvidas |

## 3. Casos de teste do cálculo (10 casos)

**Procedimento (conforme a proposta):** para cada caso, o valor de referência é calculado em planilha **antes** da execução no sistema. Depois o mesmo caso é lançado na aplicação e o preço final é comparado. Diferença nula aprova; qualquer divergência é registrada, corrigida e o caso é reexecutado.

Os valores de referência abaixo já foram calculados aplicando `regras-de-calculo.md` e estão também em `evidencias/testes/casos-de-teste-referencia.csv`, para conferência em planilha.

| Caso | Cenário | Modo / % | Arredond. | Custo direto (R$) | Preço bruto (R$) | **Preço final de referência (R$)** |
|---|---|---|---|---|---|---|
| CT01 | 1 material (1 × 289,90), sem serviços nem adicionais, lucro zero | margem 0% | duas casas | 289,90 | 289,90 | **289,90** |
| CT02 | Quantidade fracionada: 2,5 chapas × 289,90 | margem 30% | duas casas | 724,75 | 1.035,36 | **1.035,36** |
| CT03 | Orçamento completo: 4 materiais + 2 serviços + 2 adicionais (exemplo de `regras-de-calculo.md` §4) | margem 30% | dezena | 1.931,10 | 2.758,71 | **2.760,00** |
| CT04 | Mesmo custo do CT03, trocando o modo de lucro | markup 30% | dezena | 1.931,10 | 2.510,43 | **2.520,00** |
| CT05 | Arredondamento meio para cima na linha: 4,5 × 1,2350 = 5,5575 → 5,56 e 1,5 × 23,99 = 35,985 → 35,99 | margem 20% | duas casas | 41,55 | 51,94 | **51,94** |
| CT06 | Somente serviços (4 h × 80,00 + 5,5 h × 55,00), sem materiais | markup 50% | real inteiro | 622,50 | 933,75 | **934,00** |
| CT07 | 1 material (3 × 198,75) + 2 custos adicionais (90,00 + 60,00) | margem 45% | dezena | 746,25 | 1.356,82 | **1.360,00** |
| CT08 | 12 itens (9 materiais + 3 serviços), sem adicionais | margem 25% | duas casas | 3.832,57 | 5.110,09 | **5.110,09** |
| CT09 | Margem alta: 2,25 × 412,33 + 6 h × 65,00 + frete 75,00 | margem 60% | real inteiro | 1.392,74 | 3.481,85 | **3.482,00** |
| CT10 | Valor mínimo: 0,5 hora × 45,00, sem lucro | markup 0% | duas casas | 22,50 | 22,50 | **22,50** |

### 3.1 O que cada caso verifica

| Caso | Regra alvo |
|---|---|
| CT01 | RN05 com percentual zero — preço igual ao custo, sem divisão indevida |
| CT02 | RN01 com quantidade decimal (3 casas) |
| CT03 | Sequência completa RN01→RN07, o caso de referência da monografia |
| CT04 | RN06 e a diferença entre margem e markup com o mesmo percentual |
| CT05 | RN-C02 (meio para cima) em duas linhas simultâneas e valor unitário de 4 casas |
| CT06 | Orçamento sem materiais + RN07 `real_inteiro` |
| CT07 | RN04 — custos adicionais entram no custo e recebem lucro |
| CT08 | Volume de itens e acúmulo de arredondamentos por linha |
| CT09 | Margem alta (divisor pequeno), onde erro de fórmula margem/markup fica evidente |
| CT10 | Limite inferior: fração de hora e lucro zero |

### 3.2 Casos negativos (validação de entrada — RN10)

| Caso | Entrada | Resultado esperado |
|---|---|---|
| CN01 | Margem = 100 | Bloqueio com mensagem explicativa; nenhum cálculo executado |
| CN02 | Quantidade = 0 ou negativa | Campo sinalizado; item não é adicionado |
| CN03 | Valor unitário negativo | Campo sinalizado; item não é adicionado |
| CN04 | Data de validade anterior à emissão | Campo sinalizado |
| CN05 | Registrar orçamento sem itens | Bloqueio com indicação do que falta (RF32) |
| CN06 | Registrar orçamento sem cliente | Bloqueio (RF32) |

### 3.3 Formulário de registro do resultado

Preencher em `evidencias/testes/resultado-casos-de-teste.md` a cada execução:

| Caso | Data | Valor de referência | Valor do sistema | Diferença | Situação | Observação / defeito |
|---|---|---|---|---|---|---|
| CT01 | | 289,90 | | | Aprovado / Reprovado | |
| … | | | | | | |

Casos reprovados geram correção e **reexecução completa da tabela**, não apenas do caso corrigido.

## 4. Testes de isolamento entre contas (RNF12)

| Caso | Procedimento | Esperado |
|---|---|---|
| TI01 | Criar marcenarias A e B; cadastrar material em A; autenticar como B e listar materiais | Lista vazia |
| TI02 | Autenticado como B, acessar por ID direto um orçamento de A | "Não encontrado" |
| TI03 | Autenticado como B, tentar editar um cliente de A | "Não encontrado" |
| TI04 | Acessar qualquer rota interna sem sessão | Redirecionamento ao login (RNF13) |

**Execução por incremento.** TI04 é verificado na Spec 001, que cria a autenticação. TI01 é
verificado quando o catálogo de materiais existir; TI02, quando houver orçamento; e TI03, quando
houver cliente. Os quatro testes são reexecutados e consolidados no incremento 010.

## 5. Avaliação exploratória de uso (OE7)

Participante: proprietário da marcenaria familiar, mediante consentimento registrado (RNF16). Sessão única, observada, com anotações.

**Roteiro de tarefas** (conforme a proposta):

1. Cadastrar um material informando unidade e custo.
2. Cadastrar um serviço com valor por hora.
3. Compor um orçamento para um cliente, com pelo menos três itens e um custo adicional.
4. Conferir o valor total no memorial de cálculo.
5. Registrar o orçamento e gerar o PDF.

**Registro por tarefa:** concluída sem ajuda / concluída com ajuda / não concluída; erros cometidos; dúvidas verbalizadas; tempo observado.

**Questionário final** (escala de 1 a 5 e justificativa aberta):

1. As telas deixam claro o que fazer em cada etapa?
2. Os nomes usados (material, serviço, custo adicional, margem) correspondem ao vocabulário do dia a dia da marcenaria?
3. O fluxo de composição do orçamento corresponde à forma como você orça hoje?
4. O valor apresentado pelo sistema é confiável a ponto de você entregá-lo ao cliente?
5. O que faltou ou atrapalhou?

**Limitação declarada:** por envolver um único participante, o resultado é evidência do estudo de caso e não medida de usabilidade generalizável — como já registrado na proposta.

## 6. Matriz de verificação de requisitos (OE8)

Preenchida ao fim de cada incremento e consolidada antes da defesa.

| Requisito | Incremento | Forma de verificação | Situação |
|---|---|---|---|
| RF01–RF06 | 001 | Teste manual + teste de integração de autenticação | pendente |
| RF11–RF18 | 002 | Teste manual + integração dos cadastros | pendente |
| RF23–RF31 | 003 | CT01–CT10 + testes de unidade do domínio | pendente |
| RF32–RF39 | 004 | Teste manual do ciclo de vida + CN05, CN06 | pendente |
| RF08–RF10 | 005 | Teste manual dos cadastros de cliente | pendente |
| RF41–RF43 | 006 | Inspeção do PDF gerado + medição de tempo | pendente |
| RF05, RF19–RF22 | 007 | Teste manual das configurações + CT03/CT04/CT06 | pendente |
| RNF06, RNF21 | 008 | Execução completa dos casos de teste | pendente |
| RNF01 | 009 | Avaliação exploratória de uso | pendente |
| RNF12, RNF13 | 001–005 e 010 | TI04 na Spec 001; TI01–TI03 quando suas entidades existirem; reexecução completa no 010 | pendente |

## 7. Definição de pronto (Definition of Done)

Uma Spec só é fechada quando:

1. Todos os critérios de aceitação das histórias do incremento foram verificados.
2. Os testes automatizados do incremento passam, incluindo os do domínio de cálculo.
3. O diff foi revisado por uma pessoa — não apenas o resumo do agente (exigência da ata).
4. A documentação afetada em `documentacao/` foi atualizada.
5. As decisões tomadas foram registradas em `decisoes.md`.
6. `ESTADO_ATUAL.md`, `HANDOFF.md` e `BLOQUEIOS.md` refletem a situação real.
7. O commit referencia o número da Spec e os requisitos atendidos.
