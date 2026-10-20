# Evidência — Spec 027 (endurecimento de segurança)

**Data:** 2026-10-20 · **Branch:** `spec/027-endurecimento-de-seguranca` (a partir de `main` em `cf2093f`)

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` do backend | sem erros |
| Backend (Vitest, 28 arquivos, banco local) | 305 de 305 aprovados (2 novos em `tests/unidade/host.test.ts`) |
| API real sem `HOST` (porta de teste 3999) | log `API ouvindo em http://127.0.0.1:3999`; `netstat` mostrou só `127.0.0.1:3999`; `/saude` respondeu `api: ok, banco: ok` pelo `127.0.0.1` |
| `git grep` do IP do SSH (com pontos), do nome da chave e do e-mail da conta | nenhum resultado nos arquivos atuais |

## Publicação na VPS (2026-10-20)

`atualizar.sh main` rodou sem erro; a VPS passou de `cf2093f` para `8df2aa7`. O `.env` da VPS não define `HOST`, e o nginx já apontava para `127.0.0.1:3333`.

| Verificação | Resultado |
|---|---|
| `sudo ss -ltn \| grep 3333` na VPS | antes: `*:3333`; depois: `127.0.0.1:3333` |
| Serviço `orcamarcenaria-api` | active |
| `/saude` pela VPS (nginx, HTTPS) e de fora (`https://<site>/api/saude`) | `api: ok, banco: ok` |
| Site `https://<site>/` de fora | 200 |
| Porta 3333 direto de fora da VPS | sem resposta (000) |

**Não verificado:** percurso de tela no site (login, painel, PDF) pela autora. Os achados F-02, F-03 e F-05 a F-11 seguem abertos.
