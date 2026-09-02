# Requisitos — OrçaMarcenaria

Versão 1.0 · Fonte canônica dos requisitos do projeto. Qualquer mudança aqui exige registro em `decisoes.md` e revisão das Specs afetadas.

## Como ler

- **RF** = requisito funcional · **RNF** = requisito não funcional · **RN** = regra de negócio (detalhadas em `regras-de-calculo.md`)
- **Prioridade:** `Essencial` (sem ele não há TCC) · `Importante` (previsto no escopo, entra se o cronograma permitir) · `Desejável` (evolução futura, não implementado no MVP)
- **OE** = objetivo específico da proposta:

| Código | Objetivo específico da proposta |
|---|---|
| OE1 | Identificar as dificuldades enfrentadas por pequenos marceneiros na elaboração de orçamentos |
| OE2 | Levantar os requisitos funcionais e não funcionais da aplicação |
| OE3 | Definir e documentar as regras de cálculo dos custos, da margem e do preço final |
| OE4 | Desenvolver os cadastros de clientes, materiais e serviços |
| OE5 | Implementar o cálculo e a geração de orçamentos |
| OE6 | Realizar testes funcionais dos cálculos e do funcionamento |
| OE7 | Realizar avaliação exploratória de uso com o proprietário |
| OE8 | Verificar atendimento aos requisitos e consistência dos valores |

---

## 1. Requisitos funcionais

### 1.1 Conta e acesso

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF01 | O sistema deve permitir o cadastro de uma nova marcenaria informando nome da marcenaria, nome do responsável, e-mail e senha. | Essencial | OE4 | 001 |
| RF02 | O sistema deve autenticar o usuário por e-mail e senha e manter a sessão ativa até o logout ou a expiração. | Essencial | OE4 | 001 |
| RF03 | O sistema deve encerrar a sessão por solicitação do usuário (logout). | Essencial | OE4 | 001 |
| RF04 | O sistema deve isolar todos os dados por marcenaria, de modo que nenhum registro de uma conta seja legível ou alterável por outra. | Essencial | OE4 | 001 |
| RF05 | O sistema deve permitir ao usuário editar os dados da marcenaria (nome, responsável, telefone, e-mail de contato, CNPJ opcional, endereço) exibidos no orçamento. | Importante | OE5 | 007 |
| RF06 | O sistema deve permitir a alteração da senha mediante informação da senha atual. | Importante | OE4 | 001 |
| RF07 | O sistema deve permitir a recuperação de senha por e-mail. | Desejável | — | pós-TCC |

### 1.2 Clientes

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF08 | O sistema deve permitir cadastrar clientes com nome, telefone, e-mail e endereço, sendo obrigatório apenas o nome. | Essencial | OE4 | 005 |
| RF09 | O sistema deve permitir listar, buscar por nome, editar e inativar clientes. | Essencial | OE4 | 005 |
| RF10 | O sistema deve impedir a exclusão definitiva de cliente vinculado a orçamento, permitindo apenas a inativação. | Essencial | OE4 | 005 |

### 1.3 Catálogo de materiais

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF11 | O sistema deve permitir cadastrar material com nome, descrição opcional, unidade de medida, custo unitário e situação (ativo/inativo). | Essencial | OE4 | 002 |
| RF12 | O sistema deve oferecer as unidades de medida: unidade (un), metro (m), metro quadrado (m²), metro linear (ml), chapa (ch), quilograma (kg), litro (L) e peça (pç). | Essencial | OE4 | 002 |
| RF13 | O sistema deve permitir listar materiais com busca por nome e filtro por situação. | Essencial | OE4 | 002 |
| RF14 | O sistema deve permitir editar o custo unitário de um material sem alterar os valores de orçamentos já registrados (RN08 — congelamento de valores). | Essencial | OE3, OE5 | 003 |
| RF15 | O sistema deve permitir inativar material, mantendo-o fora da seleção de novos orçamentos e preservando o histórico. | Essencial | OE4 | 002 |
| RF16 | O sistema deve registrar o histórico de alterações de custo unitário do material (data, valor anterior, valor novo). | Desejável | — | pós-TCC |

### 1.4 Catálogo de serviços e mão de obra

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF17 | O sistema deve permitir cadastrar serviço com nome, descrição opcional, tipo de cobrança (por hora ou por unidade), valor unitário e situação. | Essencial | OE4 | 002 |
| RF18 | O sistema deve permitir listar, buscar, editar e inativar serviços, com as mesmas regras aplicadas a materiais (RF13 a RF15). | Essencial | OE4 | 002 |

### 1.5 Configuração de cálculo

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF19 | O sistema deve permitir configurar, por marcenaria, o modo de aplicação de lucro: margem sobre o preço de venda ou markup sobre o custo (RN05, RN06). | Essencial | OE3 | 007 |
| RF20 | O sistema deve permitir configurar o percentual de lucro padrão, aplicado como sugestão a novos orçamentos. | Essencial | OE3 | 007 |
| RF21 | O sistema deve permitir configurar a regra de arredondamento do preço final entre: duas casas decimais, real inteiro ou múltiplo de dez reais (RN07). | Importante | OE3 | 007 |
| RF22 | O sistema deve permitir configurar o prazo padrão de validade do orçamento, em dias. | Importante | OE5 | 007 |

### 1.6 Composição e cálculo do orçamento

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF23 | O sistema deve permitir criar um orçamento informando cliente, descrição do projeto, data de emissão e validade. | Essencial | OE5 | 003 |
| RF24 | O sistema deve permitir adicionar itens de material ao orçamento, selecionando o material do catálogo e informando a quantidade; o valor unitário é copiado do catálogo e pode ser ajustado apenas naquele orçamento. | Essencial | OE5 | 003 |
| RF25 | O sistema deve permitir adicionar itens de serviço ao orçamento, com quantidade de horas ou unidades e valor unitário copiado do catálogo. | Essencial | OE5 | 003 |
| RF26 | O sistema deve permitir adicionar itens avulsos, não presentes no catálogo, informando descrição, unidade, quantidade e valor unitário. | Importante | OE5 | 003 |
| RF27 | O sistema deve permitir editar a quantidade e o valor unitário de um item e remover itens do orçamento. | Essencial | OE5 | 003 |
| RF28 | O sistema deve permitir lançar custos adicionais de valor fixo, com descrição e valor (RN04). | Essencial | OE5 | 003 |
| RF29 | O sistema deve calcular e exibir, a cada alteração: subtotal de materiais, subtotal de serviços, total de custos adicionais, custo direto total, valor do lucro e preço final (RN01 a RN07). | Essencial | OE3, OE5 | 003 |
| RF30 | O sistema deve permitir informar, no próprio orçamento, um percentual de lucro diferente do padrão, sem alterar a configuração da marcenaria. | Essencial | OE3, OE5 | 003 |
| RF31 | O sistema deve exibir o memorial de cálculo do orçamento — a sequência de operações que leva do custo ao preço final — de forma que o valor possa ser conferido manualmente. | Essencial | OE3, OE6, OE8 | 003 |
| RF32 | O sistema deve impedir o registro de orçamento sem cliente, sem descrição do projeto ou sem ao menos um item. | Essencial | OE5 | 004 |
| RF33 | O sistema deve permitir aplicar um desconto de valor fixo ou percentual sobre o preço final, exibindo o valor descontado. | Desejável | — | pós-TCC |

### 1.7 Registro, consulta e ciclo de vida

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF34 | O sistema deve registrar o orçamento com número sequencial por marcenaria, gerado automaticamente. | Essencial | OE5 | 004 |
| RF35 | O sistema deve manter a situação do orçamento entre: rascunho, enviado, aprovado, recusado e vencido (RN09). | Importante | OE5 | 004 |
| RF36 | O sistema deve marcar automaticamente como vencido o orçamento cuja data de validade tenha passado e que esteja na situação "enviado". | Importante | OE5 | 004 |
| RF37 | O sistema deve listar os orçamentos com número, cliente, data, preço final e situação, permitindo busca por cliente e filtro por situação e período. | Essencial | OE5 | 004 |
| RF38 | O sistema deve permitir consultar um orçamento registrado com todos os seus itens e valores originais. | Essencial | OE5 | 004 |
| RF39 | O sistema deve permitir editar um orçamento em rascunho e bloquear a edição de itens após o envio, permitindo apenas mudança de situação. | Importante | OE5 | 004 |
| RF40 | O sistema deve permitir duplicar um orçamento existente como novo rascunho. | Desejável | — | pós-TCC |

### 1.8 Saída para o cliente

| ID | Requisito | Prioridade | OE | Incremento |
|---|---|---|---|---|
| RF41 | O sistema deve gerar o orçamento em PDF contendo: identificação da marcenaria, dados do cliente, número e data, descrição do projeto, itens com quantidade e valor, preço final por extenso e numérico, validade e campo de observações. | Essencial | OE5 | 006 |
| RF42 | O PDF deve apresentar os itens sem revelar a composição interna de custo e lucro, exibindo apenas o que o marceneiro optar por mostrar: lista de itens com valores ou apenas valor total. | Importante | OE5, OE7 | 006 |
| RF43 | O sistema deve permitir baixar o PDF gerado a partir da tela do orçamento. | Essencial | OE5 | 006 |

---

## 2. Requisitos não funcionais

Classificados pelas características de qualidade da ISO/IEC 25010. Cada RNF traz um critério verificável — RNF sem forma de verificar não entra no baseline.

### 2.1 Usabilidade

| ID | Requisito | Verificação |
|---|---|---|
| RNF01 | Um orçamento com até dez itens deve ser composto e registrado por um usuário treinado em no máximo 5 minutos. | Cronometragem na avaliação exploratória (OE7) |
| RNF02 | Os totais devem ser recalculados e exibidos na mesma tela, sem recarregamento, a cada alteração de item, quantidade ou percentual. | Teste manual em Chrome e Firefox |
| RNF03 | Mensagens de erro devem indicar o campo e a correção esperada, em português, sem termos técnicos ou códigos de exceção. | Inspeção das telas de validação |
| RNF04 | Valores monetários devem ser exibidos no formato brasileiro (R$ 1.234,56) e a entrada deve aceitar vírgula como separador decimal. | Caso de teste específico |
| RNF05 | As telas devem ser utilizáveis em resolução a partir de 1366×768 sem rolagem horizontal. | Inspeção visual |

### 2.2 Confiabilidade e correção

| ID | Requisito | Verificação |
|---|---|---|
| RNF06 | O cálculo do preço final deve apresentar diferença nula em relação ao cálculo manual de referência, após a regra de arredondamento definida. | 10 casos de teste (`qualidade-e-testes.md`) — critério de aprovação do TCC |
| RNF07 | Valores monetários devem ser armazenados e calculados em tipo decimal exato (NUMERIC), nunca em ponto flutuante binário. | Revisão de esquema e de código |
| RNF08 | Toda regra de cálculo deve ser implementada em um único módulo de domínio, sem duplicação entre front-end e back-end. | Revisão de código; o front-end só exibe o que o back-end calcula |
| RNF09 | O sistema não deve perder um orçamento em edição por falha de rede: a submissão deve ser reenviável sem duplicar o registro. | Teste com rede desconectada |
| RNF10 | Nenhum registro deve ser excluído fisicamente do banco; exclusões são lógicas (inativação), preservando o histórico. | Revisão de esquema |

### 2.3 Segurança e privacidade

| ID | Requisito | Verificação |
|---|---|---|
| RNF11 | Senhas devem ser armazenadas com função de hash com sal (bcrypt ou Argon2), nunca em texto legível ou com hash simples. | Inspeção do banco e do código |
| RNF12 | Toda consulta a dados de negócio deve filtrar obrigatoriamente pela marcenaria da sessão; a ausência desse filtro deve ser tratada como defeito grave. | Teste de isolamento: usuário A tenta acessar registro de B por ID direto |
| RNF13 | O sistema deve exigir autenticação em todas as rotas exceto cadastro e login. | Teste de acesso sem sessão |
| RNF14 | Em ambiente publicado, o acesso deve ocorrer por HTTPS. | Verificação na demonstração em VPS, se realizada |
| RNF15 | A base de demonstração e as evidências do TCC não podem conter nomes de clientes, valores comerciais reais ou propostas identificáveis (LGPD e compromisso da proposta). | Revisão dos dados de demonstração antes da entrega |
| RNF16 | A entrevista e a avaliação de uso devem ocorrer mediante consentimento prévio registrado do participante. | Termo de consentimento anexado ao TCC |

### 2.4 Desempenho

| ID | Requisito | Verificação |
|---|---|---|
| RNF17 | O recálculo de um orçamento com até 50 itens deve responder em menos de 1 segundo em ambiente local. | Medição por caso de teste |
| RNF18 | A listagem de orçamentos deve responder em menos de 2 segundos com até 500 orçamentos cadastrados. | Teste com massa de dados gerada |
| RNF19 | A geração do PDF deve concluir em menos de 5 segundos. | Medição |

### 2.5 Manutenibilidade e rastreabilidade

| ID | Requisito | Verificação |
|---|---|---|
| RNF20 | O código deve estar versionado em Git, com histórico que permita relacionar commit, Spec e requisito. | Inspeção do histórico |
| RNF21 | As regras de cálculo devem possuir testes automatizados cobrindo todos os casos de `qualidade-e-testes.md`. | Execução da suíte |
| RNF22 | A documentação em `documentacao/` deve ser atualizada ao fechamento de cada Spec; documentação divergente do código é tratada como pendência. | Checklist de fechamento (skill `fechar-spec`) |
| RNF23 | O projeto deve rodar em ambiente local a partir do README, com no máximo: instalar dependências, configurar variáveis, migrar banco, iniciar. | Execução em máquina limpa |

### 2.6 Portabilidade e disponibilidade

| ID | Requisito | Verificação |
|---|---|---|
| RNF24 | A aplicação deve funcionar em Google Chrome e Mozilla Firefox, versões atuais. | Roteiro executado nos dois navegadores |
| RNF25 | A aplicação deve ser executável em ambiente local (desenvolvimento) e implantável em VPS/VM sem alteração de código, apenas por configuração. | Variáveis de ambiente; demonstração opcional em VPS |
| RNF26 | Toda a interface e as mensagens devem estar em português do Brasil. | Inspeção |

---

## 3. Rastreabilidade objetivo → requisitos

| Objetivo específico | Requisitos / artefatos correspondentes |
|---|---|
| OE1 | `roteiro-entrevista.md` + notas de entrevista (não gera RF diretamente; alimenta a revisão deste documento) |
| OE2 | Este documento |
| OE3 | RF14, RF19–RF22, RF29–RF31 + `regras-de-calculo.md` |
| OE4 | RF01–RF06, RF08–RF18 |
| OE5 | RF23–RF39, RF41–RF43 |
| OE6 | RNF06, RNF21 + `qualidade-e-testes.md` |
| OE7 | RNF01 + roteiro de avaliação exploratória em `qualidade-e-testes.md` §5 |
| OE8 | Matriz de verificação de requisitos em `qualidade-e-testes.md` §6 |

## 4. Requisitos pendentes de confirmação

Os itens abaixo dependem da entrevista com o proprietário (OE1) e estão registrados em `BLOQUEIOS.md`. Enquanto não confirmados, valem as decisões provisórias de `decisoes.md`.

- Como a mão de obra é atualmente estimada: por hora trabalhada, por peça ou como percentual do material?
- O marceneiro raciocina em margem sobre a venda ou em markup sobre o custo? Qual percentual pratica?
- Materiais comprados em chapa e consumidos em m² — hoje ele calcula por chapa inteira ou por área? Sobra é cobrada?
- Existe cobrança de deslocamento, instalação ou montagem separada dos serviços?
- Qual o prazo de validade usual do orçamento e o que ocorre quando vence?
- O orçamento entregue ao cliente hoje mostra itens detalhados ou apenas o valor total?
