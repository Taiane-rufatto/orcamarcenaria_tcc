# Especificação da Funcionalidade: Conta e Acesso

**Branch da funcionalidade**: `spec/001-conta-acesso`

**Criada em**: 2026-09-18

**Status**: pronta para clarificação

**Entrada**: permitir que o marceneiro crie uma conta da marcenaria, entre e saia do sistema
com segurança, altere a própria senha e mantenha os dados isolados por marcenaria.

## Objetivo e delimitação

Este incremento entrega uma conta individual para cada marcenaria: o proprietário pode se
cadastrar, iniciar e encerrar a sessão e alterar sua senha, sem acessar dados de outra conta.

Ficam fora deste incremento: recuperação de senha por e-mail (RF07), múltiplos usuários ou papéis
por marcenaria, edição dos dados cadastrais da marcenaria (RF05), catálogo, clientes, orçamento e
configurações de cálculo.

A demonstração será feita criando duas marcenarias fictícias, entrando e saindo de uma conta,
tentando uma credencial inválida e confirmando que uma conta não lê dados da outra. As evidências
serão testes de integração de autenticação e isolamento, teste manual das telas e registro em
`evidencias/testes/`.

## Clarificações

### Sessão 2026-09-18

- P: TI01–TI03 devem aguardar os incrementos que introduzem as entidades citadas, ou a Spec 001
  deve criar dados equivalentes apenas para executá-los? → R: TI01–TI03 serão executados nos
  incrementos que introduzirem material, orçamento e cliente; TI04 será executado na Spec 001.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 — Criar a conta da marcenaria (Prioridade: P1)

Como marceneiro, quero criar uma conta com os dados essenciais da minha marcenaria para ter um
espaço próprio onde custos e orçamentos futuros ficarão guardados.

**Por que esta prioridade**: sem uma conta vinculada à marcenaria não é possível proteger nem
separar os dados que serão cadastrados nos próximos incrementos.

**Teste independente**: informar dados válidos de uma nova marcenaria e confirmar que a conta é
criada, a sessão é iniciada e uma segunda conta fictícia não recebe os seus dados.

**Cenários de aceitação**:

1. **Dado** nome da marcenaria, nome do responsável, e-mail válido e senha de ao menos 8
   caracteres, **quando** o marceneiro confirma o cadastro, **então** a conta é criada e ele já
   fica autenticado.
2. **Dado** um e-mail já cadastrado, **quando** o marceneiro confirma o cadastro, **então** recebe
   a mensagem “Este e-mail já está em uso” e nenhuma nova conta é criada.
3. **Dado** duas marcenarias cadastradas, **quando** o proprietário da segunda acessa dados pelo
   identificador da primeira, **então** o sistema responde como se o registro não existisse.

---

### História de Usuário 2 — Entrar e sair do sistema (Prioridade: P1)

Como marceneiro, quero entrar com meu e-mail e senha e sair ao terminar para proteger custos e
preços da minha marcenaria.

**Por que esta prioridade**: a autenticação impede que outra pessoa use ou consulte os dados da
conta no mesmo computador.

**Teste independente**: criar uma conta fictícia, sair, entrar novamente com as credenciais
corretas e confirmar que o acesso sem sessão é direcionado à entrada.

**Cenários de aceitação**:

1. **Dado** credenciais válidas, **quando** o marceneiro entra, **então** vê a lista de orçamentos
   vazia até que os próximos incrementos permitam cadastrá-los.
2. **Dado** credenciais inválidas, **quando** tenta entrar, **então** recebe “E-mail ou senha
   inválidos”, sem indicação de qual campo falhou.
3. **Dado** que não está autenticado, **quando** acessa um endereço interno, **então** é
   redirecionado para a tela de entrada.
4. **Dado** que está autenticado, **quando** escolhe sair, **então** a sessão é encerrada e um novo
   acesso interno exige autenticação.

---

### História de Usuário 3 — Alterar a própria senha (Prioridade: P2)

Como marceneiro autenticado, quero alterar minha senha informando a senha atual para manter o
acesso da conta sob meu controle.

**Por que esta prioridade**: complementa a proteção da conta sem ampliar o escopo para recuperação
por e-mail.

**Teste independente**: com uma conta fictícia autenticada, informar a senha atual correta e uma
nova senha válida; sair e entrar somente com a nova senha.

**Cenários de aceitação**:

1. **Dado** senha atual correta e nova senha com ao menos 8 caracteres, **quando** o marceneiro
   confirma a alteração, **então** a nova senha passa a autenticar a conta.
2. **Dado** senha atual incorreta, **quando** o marceneiro tenta alterá-la, **então** a senha não é
   modificada e a mensagem não expõe informação adicional sobre a conta.

### Casos de Borda

- Campos obrigatórios vazios, e-mail sem formato válido ou senha com menos de 8 caracteres impedem
  o cadastro e indicam em português a correção esperada.
- Após expiração ou encerramento da sessão, uma tentativa de acessar área interna exige nova entrada.
- A alteração de senha não pode aceitar uma nova senha inválida nem alterar a senha quando a atual
  estiver incorreta.
- Dados de uma conta nunca podem ser lidos ou modificados por uma sessão vinculada a outra
  marcenaria.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001 (RF01)**: o sistema deve permitir cadastrar uma marcenaria com nome da marcenaria,
  nome do responsável, e-mail e senha válidos, iniciando a sessão após o cadastro bem-sucedido.
- **FR-002 (RF02)**: o sistema deve autenticar o usuário por e-mail e senha e manter a sessão até
  o logout ou sua expiração.
- **FR-003 (RF03)**: o usuário autenticado deve poder encerrar a própria sessão.
- **FR-004 (RF04)**: o sistema deve separar os dados por marcenaria e impedir leitura ou alteração
  de registros de outra conta.
- **FR-005 (RF06)**: o usuário autenticado deve poder alterar sua senha mediante a informação
  correta da senha atual.
- **FR-006 (RNF11)**: senhas devem ser armazenadas somente em forma protegida com hash e sal,
  nunca em texto legível ou hash simples.
- **FR-007 (RNF12)**: toda consulta a dados de negócio deve usar a marcenaria da sessão como
  critério obrigatório de isolamento.
- **FR-008 (RNF13)**: todas as rotas internas devem exigir autenticação; apenas cadastro e entrada
  permanecem disponíveis sem sessão.

### Entidades Principais

- **Marcenaria**: espaço proprietário dos dados de negócio, identificado por nome e associado a
  uma única conta de usuário neste MVP.
- **Usuário**: responsável pela marcenaria, identificado por nome, e-mail único, senha protegida e
  situação ativa.
- **Sessão autenticada**: vínculo temporário que identifica o usuário e sua marcenaria durante o
  acesso às áreas internas.

### Regras e fontes canônicas

- US01 e US02 de `documentacao/historias-de-usuario.md` são cobertas integralmente.
- RF01–RF04 e RF06, além de RNF11–RNF13, são a fonte dos requisitos desta Spec.
- A regra de multi-tenant simples segue D001 e `documentacao/arquitetura.md` §4: um usuário
  pertence a uma única marcenaria e o identificador da marcenaria vem da sessão, não do cliente.
- Os testes de isolamento TI01–TI04 de `documentacao/qualidade-e-testes.md` §4 são obrigatórios
  quando houver consultas de dados de negócio.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: um novo marceneiro consegue criar uma conta fictícia válida e chegar à área interna
  em uma única tentativa, sem ajuda técnica.
- **SC-002**: 100% dos testes de integração de cadastro, entrada, saída, alteração de senha e
  acesso sem sessão passam antes do encerramento da Spec.
- **SC-003**: o teste TI04 comprova nesta Spec que qualquer acesso interno sem sessão é
  redirecionado à entrada; TI01, TI02 e TI03 serão executados nos incrementos que introduzirem,
  respectivamente, material, orçamento e cliente, e consolidados no incremento 010.
- **SC-004**: em 100% das tentativas com credenciais inválidas, a mensagem apresentada não revela
  se o e-mail ou a senha é o dado incorreto.
- **SC-005**: a revisão do banco e do código confirma que nenhuma senha fictícia é armazenada em
  texto legível.

## Premissas

- Cada marcenaria terá exatamente um usuário no MVP; equipes, papéis e troca de empresa não fazem
  parte desta entrega.
- A lista de orçamentos poderá estar vazia nesta etapa, pois cadastro e gestão de orçamentos serão
  entregues em incrementos posteriores.
- Recuperação de senha por e-mail permanece fora do escopo, como evolução pós-TCC (RF07).
- Dados e credenciais usados em testes e evidências serão fictícios.
