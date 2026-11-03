# Tarefas — Spec 028

- [x] F-05: limite de tentativas no `PUT /auth/senha` e teto de 128 caracteres nas senhas (`fechamento-de-seguranca.test.ts`)
- [x] F-06: token no fragmento do link, tela que o lê e o apaga do endereço, e-mail sem texto no log em produção (testes de integração; link antigo `?token=` ainda aceito pela tela)
- [x] F-07: filtro da marcenaria nos JOINs de material e fornecedor, com teste que falha sem a correção
- [x] F-09: `LIMITE_TENTATIVAS=desligado` ignorado em produção
- [x] F-10: sessão só vale com usuário ativo, com teste que falha sem a correção
- [x] F-02: CSP em modo bloqueio no modelo do nginx e no script de endurecimento; percurso no navegador com 0 violações
- [x] F-11: `npm audit fix` no backend e no frontend; 0 vulnerabilidades em produção
- [x] Decisão D044 (riscos aceitos: F-03, F-08, parte estrutural do F-07, avisos de ferramentas de desenvolvimento)
- [x] Backend 312 de 312, frontend 31 de 31, `tsc` e ESLint limpos
- [x] Merge em `main` (432c1a5, 2026-11-03)
- [x] Publicado na VPS em 2026-11-03: `atualizar.sh main` e `aplicar-endurecimento.sh`, com backup antes
- [ ] Conferir no site publicado: entrar, abrir orçamento, baixar PDF, console sem erros de CSP
