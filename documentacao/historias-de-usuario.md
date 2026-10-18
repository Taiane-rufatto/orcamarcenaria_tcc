# Histórias de Usuário

Versão 1.0 · Cada história tem critérios de aceitação verificáveis e aponta os requisitos que a originam. As histórias são a entrada para as Specs: ao abrir um incremento, a Spec deve cobrir integralmente as histórias listadas para ele em `roadmap.md`.

Ator padrão: **marceneiro** (proprietário da marcenaria, usuário único da conta).

---

## Épico 1 — Acesso e conta

### US01 — Criar conta da marcenaria
**Como** marceneiro, **quero** criar uma conta informando os dados da minha marcenaria, **para** ter um espaço próprio onde meus custos e orçamentos ficam guardados.
`RF01, RF04`

- **Dado** que informo nome da marcenaria, nome do responsável, e-mail válido e senha com no mínimo 8 caracteres, **quando** confirmo o cadastro, **então** a conta é criada e sou autenticado automaticamente.
- **Dado** que informo um e-mail já cadastrado, **quando** confirmo, **então** recebo a mensagem "Este e-mail já está em uso" e nenhuma conta é criada.
- **Dado** que a conta foi criada, **quando** consulto qualquer listagem, **então** vejo apenas dados da minha marcenaria.

### US02 — Entrar e sair do sistema
**Como** marceneiro, **quero** entrar com e-mail e senha e sair quando terminar, **para** proteger meus custos e preços.
`RF02, RF03, RNF13`

- **Dado** credenciais válidas, **quando** entro, **então** vejo a lista de orçamentos.
- **Dado** credenciais inválidas, **quando** tento entrar, **então** recebo "E-mail ou senha inválidos", sem indicar qual dos dois está errado.
- **Dado** que não estou autenticado, **quando** acesso qualquer endereço interno, **então** sou redirecionado para o login.

---

## Épico 2 — Catálogo

### US03 — Cadastrar material com unidade e custo
**Como** marceneiro, **quero** cadastrar meus materiais com a unidade em que compro e o custo unitário, **para** não precisar lembrar ou consultar preço a cada orçamento.
`RF11, RF12`

- **Dado** nome, unidade e custo unitário válidos, **quando** salvo, **então** o material aparece na listagem como ativo.
- **Dado** custo unitário negativo, zero ou vazio, **quando** salvo, **então** o campo é sinalizado e o registro não é gravado.
- **Dado** um custo com quatro casas decimais (1,2350), **quando** salvo e reabro, **então** o valor é exibido sem perda de precisão.

### US04 — Manter o catálogo atualizado
**Como** marceneiro, **quero** editar o custo dos materiais quando o fornecedor reajusta o preço, **para** que os próximos orçamentos usem o valor correto.
`RF13, RF14, RF15, RN08`

- **Dado** um material usado em um orçamento já registrado, **quando** altero seu custo, **então** o orçamento anterior mantém o valor original e apenas novos itens usam o valor novo.
- **Dado** um material que não uso mais, **quando** o inativo, **então** ele deixa de aparecer na seleção de itens, mas continua visível nos orçamentos antigos.
- **Dado** um material inativo, **quando** o reativo, **então** ele volta à lista de ativos com os mesmos dados (D015).
- **Dado** muitos materiais cadastrados, **quando** busco por parte do nome ou filtro por situação (ativos, inativos ou todos), **então** vejo apenas os da minha marcenaria que correspondem (RF13).

### US05 — Cadastrar serviços e mão de obra
**Como** marceneiro, **quero** cadastrar serviços por hora ou por unidade com seu valor, **para** incluir a mão de obra no orçamento sem calcular de cabeça.
`RF17, RF18`

- **Dado** um serviço com cobrança por hora e valor R$ 45,00, **quando** o uso em um orçamento com 8 horas, **então** a linha resulta em R$ 360,00.
- **Dado** um serviço cadastrado, **quando** busco, edito, inativo ou reativo, **então** valem as mesmas regras de isolamento e preservação dos materiais (RF18, D015).

---

## Épico 3 — Clientes

### US06 — Cadastrar e localizar clientes
**Como** marceneiro, **quero** cadastrar meus clientes e localizá-los pelo nome, **para** identificar a quem pertence cada orçamento.
`RF08, RF09, RF10`

- **Dado** que informo apenas o nome, **quando** salvo, **então** o cliente é criado (demais campos são opcionais).
- **Dado** um cliente vinculado a orçamento, **quando** tento excluí-lo, **então** o sistema oferece apenas a inativação e explica o motivo.

---

## Épico 4 — Composição e cálculo do orçamento

### US07 — Compor um orçamento a partir do catálogo
**Como** marceneiro, **quero** montar o orçamento escolhendo materiais e serviços já cadastrados e informando as quantidades, **para** não refazer o levantamento de preços a cada projeto.
`RF23, RF24, RF25, RF27`

- **Dado** um orçamento em edição, **quando** seleciono um material e informo a quantidade, **então** a linha é criada com o valor unitário do catálogo e o valor da linha calculado.
- **Dado** um item na lista, **quando** altero a quantidade, **então** o valor da linha e todos os totais são recalculados imediatamente (RNF02).
- **Dado** um item incluído por engano, **quando** o removo, **então** os totais são recalculados sem ele.

### US08 — Ajustar valor apenas naquele orçamento
**Como** marceneiro, **quero** alterar o valor unitário de um item só neste orçamento, **para** cobrir uma condição específica sem mudar meu catálogo.
`RF24, RF26, RN08`

- **Dado** um item de material, **quando** altero seu valor unitário no orçamento, **então** o catálogo permanece inalterado e o orçamento sinaliza que o valor foi ajustado manualmente.
- **Dado** um material que ainda não cadastrei, **quando** adiciono um item avulso com descrição, unidade, quantidade e valor, **então** ele compõe os totais como qualquer outro item.

### US09 — Incluir custos adicionais
**Como** marceneiro, **quero** lançar frete, deslocamento e ferragens diversas como valor fixo, **para** que esses gastos não fiquem de fora do preço.
`RF28, RN04`

- **Dado** dois custos adicionais lançados, **quando** consulto os totais, **então** eles aparecem somados em linha própria e integram o custo direto total.

### US10 — Aplicar lucro e ver o preço final
**Como** marceneiro, **quero** informar meu percentual de lucro e ver o preço final, **para** fechar o preço com segurança de que estou cobrindo os custos.
`RF19, RF20, RF29, RF30, RN05, RN06, RN07`

- **Dado** o modo margem configurado em 30% e custo direto de R$ 1.931,10, **quando** o orçamento é calculado, **então** o preço bruto é R$ 2.758,71 e o lucro R$ 827,61.
- **Dado** o modo markup em 30% e o mesmo custo, **quando** o orçamento é calculado, **então** o preço bruto é R$ 2.510,43.
- **Dado** o arredondamento configurado em dezena, **quando** o preço bruto é R$ 2.758,71, **então** o preço final é R$ 2.760,00 e o ajuste de R$ 1,29 é exibido.
- **Dado** que informo margem de 100 ou mais, **quando** tento aplicar, **então** o sistema recusa e explica que a margem deve ser menor que 100%.

### US11 — Conferir o cálculo passo a passo
**Como** marceneiro, **quero** ver a memória de cálculo do orçamento, **para** conferir o valor na calculadora e confiar no sistema.
`RF31, RNF06`

- **Dado** um orçamento calculado, **quando** abro o memorial, **então** vejo subtotal de materiais, subtotal de serviços, custos adicionais, custo direto total, lucro com o percentual e o modo, ajuste de arredondamento e preço final, nessa ordem.
- **Dado** o memorial exibido, **quando** repito as operações manualmente, **então** obtenho exatamente o mesmo preço final.

---

## Épico 5 — Registro e acompanhamento

### US12 — Registrar e localizar orçamentos
**Como** marceneiro, **quero** registrar o orçamento e encontrá-lo depois, **para** consultar o que foi combinado quando o cliente retornar.
`RF32, RF34, RF37, RF38`

- **Dado** um orçamento com cliente, descrição e ao menos um item, **quando** registro, **então** recebe número sequencial e passa a constar na listagem.
- **Dado** um orçamento sem itens, **quando** tento registrar, **então** o sistema recusa e indica o que falta.
- **Dado** vários orçamentos, **quando** busco pelo nome do cliente ou filtro por situação, **então** vejo apenas os correspondentes.

### US13 — Acompanhar a situação do orçamento
**Como** marceneiro, **quero** marcar se o orçamento foi enviado, aprovado ou recusado, **para** saber o que está em aberto.
`RF35, RF36, RF39, RN09`

- **Dado** um orçamento enviado cuja validade passou, **quando** abro a listagem, **então** ele aparece como vencido.
- **Dado** um orçamento já enviado, **quando** tento alterar itens, **então** a edição é bloqueada e apenas a situação pode mudar.

---

## Épico 6 — Entrega ao cliente

### US14 — Gerar o orçamento em PDF
**Como** marceneiro, **quero** gerar um PDF do orçamento, **para** entregar ou enviar ao cliente com aparência profissional.
`RF41, RF42, RF43, RNF19`

- **Dado** um orçamento registrado, **quando** gero o PDF, **então** ele contém dados da marcenaria, do cliente, número, datas de emissão e validade, descrição do projeto, itens, preço final em número e por extenso e campo de observações.
- **Dado** o PDF gerado, **quando** o abro, **então** não há qualquer indicação do custo interno, do percentual de lucro ou da margem.
- **Dado** um orçamento de dez itens, **quando** gero o PDF, **então** o arquivo fica pronto em menos de cinco segundos.

---

## Épico 7 — Validação do TCC

Histórias de suporte à pesquisa; não geram funcionalidade para o usuário final, mas geram artefatos obrigatórios.

### US15 — Executar os casos de teste de cálculo
**Como** pesquisadora, **quero** executar os dez casos de teste comparando valor de referência e valor do sistema, **para** comprovar a correção do cálculo.
`RNF06, RNF21, OE6`

- **Dado** os dez casos definidos em `qualidade-e-testes.md`, **quando** executo a suíte, **então** todos apresentam diferença nula após o arredondamento e o resultado é registrado na tabela de evidências.

### US20 — Achar e identificar com menos esforço
**Como** marceneiro, **quero** achar um orçamento pelo número, registrar o CPF ou CNPJ de quem recebe o orçamento e entender o arredondamento, **para** não perder tempo nem errar por falta de clareza.
`RF54, RF55, RF56, RF57, D036`

- **Dado** o orçamento nº 2, **quando** busco "2", "#2" ou "nº 2", **então** ele aparece, e a busca pelo nome do cliente continua funcionando.
- **Dado** um cliente, **quando** informo um CPF ou CNPJ com dígito verificador errado, **então** a tela diz "CPF ou CNPJ inválido: confira os números"; vazio continua valendo.
- **Dado** a escolha do arredondamento, **quando** olho as opções, **então** cada uma traz um exemplo (R$ 2.758,71 vira R$ 2.759,00 ou R$ 2.760,00) e a explicação de que ele só sobe o preço.
- **Dado** uma quantidade negativa, **quando** incluo o item, **então** a mensagem é "A quantidade não pode ser negativa".

### US19 — Ver como foi o mês
**Como** marceneiro, **quero** ver quantos orçamentos enviei no mês, quantos foram aprovados e quanto isso rendeu, **para** saber se o meu trabalho de orçar está dando resultado.
`RF47, RF48, D035`

- **Dado** 5 orçamentos enviados em outubro, dos quais 2 aprovados (R$ 6.960,00 no total, R$ 2.928,90 de lucro), **quando** abro o Painel do mês de outubro, **então** vejo "2 de 5 foram aprovados (40,00%)" e o valor e o lucro dos aprovados.
- **Dado** um mês sem orçamentos enviados, **quando** o abro, **então** a tela diz que não há orçamento enviado, sem números inventados.
- **Dado** um orçamento enviado com validade vencida, **quando** abro o painel, **então** ele conta como vencido.

### US18 — Saber de quem vem o preço e se ele está velho
**Como** marceneiro, **quero** registrar de qual fornecedor vem o preço de cada material e ser lembrado quando o preço estiver velho, **para** não orçar com custo desatualizado.
`RF16, RF49, RF50, RF51, RF52, D034`

- **Dado** um material com fornecedor, **quando** troco o custo, **então** a data do preço renova e o histórico ganha uma linha com a data, o custo e o fornecedor.
- **Dado** um material cujo preço não é atualizado há mais de 30 dias, **quando** abro a lista, **então** ele aparece com "Preço antigo" e o botão "Continua o mesmo", que renova a data sem mudar o custo.
- **Dado** que mudei só o nome do material, **quando** abro o histórico, **então** não há linha nova.
- **Dado** um fornecedor marcado como padrão, **quando** cadastro um material novo, **então** o fornecedor já vem escolhido e posso trocá-lo.

### US17 — Saber quanto sobra de lucro e ser avisado quando for pouco
**Como** marceneiro, **quero** ver quanto de lucro sobra em cada orçamento e ser avisado quando ficar abaixo do mínimo que aceito, **para** não fechar, sem perceber, um trabalho que não compensa.
`RF44, RF45, RF46, D033`

- **Dado** um orçamento de R$ 4.200,00 com custo direto de R$ 2.100,00, **quando** abro o orçamento, **então** a tela mostra lucro de R$ 2.100,00, que é 50,00% do preço de venda.
- **Dado** um lucro mínimo de 30%, **quando** baixo o markup e o lucro cai para 16,67% do preço, **então** a tela avisa que ficou abaixo do mínimo e o preço continua o que o cálculo deu.
- **Dado** que não defini lucro mínimo, **quando** abro o orçamento, **então** vejo o lucro e a tela convida a definir o mínimo, sem aviso.

### US16 — Conduzir a avaliação exploratória de uso
**Como** pesquisadora, **quero** aplicar o roteiro de cinco tarefas com o proprietário, **para** registrar erros, dúvidas e adequação do fluxo ao processo real.
`RNF01, OE7`

- **Dado** o roteiro aplicado, **quando** a sessão termina, **então** existem: registro de tarefas concluídas, erros e dúvidas por tarefa, tempos observados e respostas do questionário final.
