# Spec 012 — Publicação para demonstração e recuperação de senha

**Branch:** `spec/012-publicacao-e-senha` (criada de `spec/011-refinamento-visual`, para publicar já com o visual novo)
**Data:** 2026-10-01
**Status:** fechada em 2026-10-08 (D028, D029). Publicada em `https://54-232-52-91.sslip.io`; recuperação de senha verificada com o Gmail real (`evidencias/testes/012-publicacao-2026-10-08.md`). Pendentes: revisão humana do diff (B19), conferência do CT03 no site publicado e revisão dos dados da base (RNF15)

## Clarificações

### Sessão 2026-10-01

- Q: Onde publicar? → A: VPS própria (Ubuntu 24.04), ainda a contratar pela autora (D029).
- Q: Endereço? → A: sem domínio próprio; endereço gratuito baseado no IP (`<ip>.sslip.io`) com HTTPS do Let's Encrypt (D029).
- Q: A recuperação de senha (RF07, pós-TCC) entra agora? → A: sim, a pedido da autora, por e-mail (D028).
- Q: Por onde enviar o e-mail? → A: Gmail com senha de app, por SMTP (D028).

## Capacidade entregável

1. **Entrega:**
   - Na tela de entrada, o link "Esqueceu sua senha?" leva a uma tela que pede o e-mail. Se ele for de uma conta, chega um e-mail com um link válido por 1 hora e de uso único. O link abre a tela "Criar nova senha"; ao salvar, a senha muda, as sessões abertas são encerradas e a pessoa entra com a senha nova.
   - O sistema fica publicado num endereço HTTPS para o orientador acessar, com banco próprio e só dados fictícios (RNF15).
2. **Fica de fora:** domínio próprio; vários usuários por marcenaria; e-mail de confirmação de cadastro; publicação automática a cada commit.
3. **Demonstração:** pedir a recuperação com o e-mail da conta de demonstração, receber o e-mail, criar a senha nova pelo link e entrar; abrir o link de novo e ver "link inválido ou expirado". No endereço publicado, entrar e abrir o orçamento do CT03 (R$ 2.760,00).

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RF07 | E-mail cadastrado recebe link de troca; a senha muda pelo link | Integração (e-mail capturado sem SMTP) + manual com Gmail |
| RF07 | A resposta é a mesma com e-mail cadastrado ou não (não revela quem tem conta) | Integração |
| RF07 | Link vale 1 hora e uma vez só; pedir de novo invalida o anterior | Integração |
| RF07 | Trocar a senha encerra as sessões abertas | Integração |
| RNF11 | Senha nova com bcrypt; o token não é guardado em texto (só o hash SHA-256) | Inspeção do banco e do código |
| RNF03, RNF26 | Mensagens em português, dizendo o que fazer | Inspeção |
| RNF14 | Acesso publicado só por HTTPS (HTTP redireciona) | Manual no endereço publicado |
| RNF25 | Mesmo código do repositório, mudando só variáveis de ambiente | Roteiro de publicação |
| RNF15 | Base publicada só com dados fictícios | Revisão antes de enviar o link ao orientador |

## Regras e restrições

- Nenhuma mudança em cálculo ou nos dados de orçamento.
- Sem SMTP configurado (desenvolvimento e testes), o e-mail não sai: o link é escrito no console do servidor e guardado em memória para os testes.
- Credenciais (senha de app do Gmail, `JWT_SECRET`, senha do banco) só no `.env` da VPS, nunca no repositório.

## Evidências previstas

Testes de integração do RF07, roteiro de publicação em `documentacao/publicacao.md`, e registro da demonstração publicada em `evidencias/testes/012-publicacao-AAAA-MM-DD.md`.

## Perguntas em aberto

- Provedor da VPS (a autora vai contratar).
- Conta Gmail que enviará os e-mails (de preferência uma criada só para o sistema).
