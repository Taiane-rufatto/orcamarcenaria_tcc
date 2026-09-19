# Pesquisa Técnica: Conta e Acesso

## Hash de senha

**Decisão:** usar `bcrypt` com API assíncrona e custo configurado no servidor.

**Justificativa:** RNF11 exige hash com sal e cita bcrypt como opção. A documentação do projeto
recomenda a API assíncrona para não bloquear o processamento de requisições. [Documentação do
bcrypt](https://github.com/kelektiv/node.bcrypt.js/blob/master/README.md)

**Alternativas consideradas:** Argon2 atende RNF11, mas adicionaria uma nova escolha de parâmetros
sem benefício necessário para o escopo atual; hash síncrono foi rejeitado por bloquear a aplicação.

## Sessão e token

**Decisão:** emitir JWT assinado com `HS256`, contendo somente identificadores de usuário,
marcenaria e sessão; verificar assinatura, expiração e sessão ativa em toda rota protegida.

**Justificativa:** o ambiente já prevê `JWT_SECRET` e `JWT_EXPIRACAO`. A verificação deve usar
`verify`, não apenas decodificação, pois `decode` não verifica assinatura. [Documentação do
jsonwebtoken](https://github.com/auth0/node-jsonwebtoken/blob/master/README.md)

**Alternativas consideradas:** JWT sem sessão persistida não permite invalidar efetivamente o token
no logout; cookie de sessão exigiria mudanças de credenciais CORS e configuração adicional fora do
escopo inicial.

## Validação de entrada

**Decisão:** usar Zod para validar os corpos de cadastro, entrada e alteração de senha; traduzir os
erros para mensagens em português antes de responder ao frontend.

**Justificativa:** o esquema valida dados desconhecidos e entrega tipos compatíveis com TypeScript,
reduzindo divergência entre validação e uso. [Documentação do Zod](https://github.com/colinhacks/zod)

**Alternativas consideradas:** validação manual em cada rota duplicaria regras e mensagens; expor
mensagens padrão da biblioteca violaria RNF03.

## Tratamento de erros

**Decisão:** centralizar erros de domínio e validação em middleware de erro da API, sem retornar
stack trace ou indicar se e-mail ou senha falharam.

**Justificativa:** Express 5 encaminha rejeições de handlers assíncronos ao middleware de erro.
[Guia oficial do Express](https://expressjs.com/en/guide/error-handling/)

**Alternativas consideradas:** respostas improvisadas em cada rota aumentariam risco de mensagens
inconsistentes e vazamento de detalhes técnicos.
