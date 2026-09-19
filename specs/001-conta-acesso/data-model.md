# Modelo de Dados: Conta e Acesso

## Marcenaria

| Campo | Regra |
|---|---|
| id | Identificador interno imutável. |
| nome | Obrigatório, informado no cadastro. |
| responsavel | Obrigatório, informado no cadastro. |
| criado_em | Data e hora de criação. |

Uma marcenaria possui exatamente um usuário neste MVP.

## Usuário

| Campo | Regra |
|---|---|
| id | Identificador interno imutável. |
| marcenaria_id | Obrigatório; vínculo com a marcenaria proprietária. |
| nome | Obrigatório. |
| email | Obrigatório, formato válido e único no sistema. |
| senha_hash | Obrigatório; nunca armazena a senha em texto legível. |
| ativo | Inicia ativo; exclusão física não é permitida. |
| criado_em | Data e hora de criação. |

## Sessão

| Campo | Regra |
|---|---|
| id | Identificador interno incluído no token. |
| usuario_id | Obrigatório; usuário autenticado. |
| marcenaria_id | Obrigatório; contexto de isolamento da sessão. |
| expira_em | Obrigatório; limite de validade. |
| encerrada_em | Nulo enquanto ativa; preenchido no logout ou troca de senha. |
| criado_em | Data e hora de criação. |

Uma sessão é válida somente quando não expirou, não foi encerrada e pertence ao usuário e à
marcenaria declarados no token verificado. A alteração de senha encerra todas as sessões anteriores
do usuário e cria uma nova para a sessão atual.
