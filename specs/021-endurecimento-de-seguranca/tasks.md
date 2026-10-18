# Tarefas — Spec 021 — Endurecimento de segurança

Lista do que a spec pede, para distinguir o que foi feito do que falta. `[x]` feito e verificado; `[ ]` pendente.

- [x] Limitador de tentativas em memória (login, cadastro, recuperação, redefinição) com 429 e `Retry-After`
- [x] `trust proxy`, `/saude` sem detalhe e comparação de hash falso no login
- [x] Recusar `JWT_SECRET` fraco
- [x] `npm audit fix` (0 vulnerabilidades)
- [x] Testes de unidade e de integração; limite desligado nos outros testes
- [x] Modelos de cabeçalhos do nginx e de restrições do systemd + roteiro em `publicacao.md`
- [x] Documentar D037 e RNF27
- [ ] Conferir o `JWT_SECRET` da VPS (32 caracteres ou mais) antes de atualizar
- [ ] Aplicar cabeçalhos do nginx e restrições do systemd na VPS e conferir com `curl -sI`
- [ ] Conferir na VPS: PostgreSQL só em localhost, grupo de segurança, SSH só por chave, permissão do `.env`
