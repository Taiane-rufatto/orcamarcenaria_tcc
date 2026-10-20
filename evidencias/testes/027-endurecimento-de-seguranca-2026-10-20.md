# Evidência — Spec 027 (endurecimento de segurança)

**Data:** 2026-10-20 · **Branch:** `spec/027-endurecimento-de-seguranca` (a partir de `main` em `cf2093f`)

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` do backend | sem erros |
| Backend (Vitest, 28 arquivos, banco local) | 305 de 305 aprovados (2 novos em `tests/unidade/host.test.ts`) |
| API real sem `HOST` (porta de teste 3999) | log `API ouvindo em http://127.0.0.1:3999`; `netstat` mostrou só `127.0.0.1:3999`; `/saude` respondeu `api: ok, banco: ok` pelo `127.0.0.1` |
| `git grep` do IP do SSH (com pontos), do nome da chave e do e-mail da conta | nenhum resultado nos arquivos atuais |

**Pendente:** publicar na VPS (`atualizar.sh main`, depois de integrar em `main`) e conferir lá `sudo ss -ltn | grep 3333` (esperado `127.0.0.1:3333`) e que o site continua funcionando pelo nginx (login, painel, PDF). Até lá, a VPS segue com a API em `*:3333`, protegida só pelo grupo de segurança.
