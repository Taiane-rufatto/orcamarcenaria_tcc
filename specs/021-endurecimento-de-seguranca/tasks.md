# Tarefas — Spec 021 — Endurecimento de segurança

Lista do que a spec pede, para distinguir o que foi feito do que falta. `[x]` feito e verificado; `[ ]` pendente.

- [x] Limitador de tentativas em memória (login, cadastro, recuperação, redefinição) com 429 e `Retry-After`
- [x] `trust proxy`, `/saude` sem detalhe e comparação de hash falso no login
- [x] Recusar `JWT_SECRET` fraco
- [x] `npm audit fix` (0 vulnerabilidades)
- [x] Testes de unidade e de integração; limite desligado nos outros testes
- [x] Modelos de cabeçalhos do nginx e de restrições do systemd + roteiro em `publicacao.md`
- [x] Documentar D037 e RNF27
- [x] Conferir o `JWT_SECRET` da VPS (32 caracteres ou mais) antes de atualizar (64 caracteres, 2026-10-18)
- [x] Aplicar cabeçalhos do nginx e restrições do systemd na VPS e conferir com `curl -sI` (2026-10-18, por `implantacao/aplicar-endurecimento.sh`; CSP em modo só relatar)
- [x] Conferir na VPS: PostgreSQL só em localhost, grupo de segurança, permissão do `.env` (2026-10-18; falta conferir SSH só por chave)
- [ ] Conferir no navegador que a CSP em modo só relatar não bloqueia nada e trocar para `Content-Security-Policy`
- [ ] Fazer a API escutar só em `127.0.0.1` (hoje escuta em todas as interfaces; o grupo de segurança bloqueia a porta)
