# Spec 027 — Endurecimento de segurança (achados F-01 e F-04 da auditoria)

**Branch:** `spec/027-endurecimento-de-seguranca`
**Data:** 2026-10-20
**Status:** fechada em 2026-10-20. Implementada, testada e publicada na VPS (`main` em `8df2aa7`); `ss -ltn` mostra `127.0.0.1:3333` e a porta 3333 não responde de fora (`evidencias/testes/027-endurecimento-de-seguranca-2026-10-20.md`).

## Clarificações

### Sessão 2026-10-20

- Q: De onde vêm os achados? → A: da auditoria de segurança de 2026-10-19 (relatório fora do repositório, que é público; ver D042).
- Q: O que entra agora? → A: só o que é rápido e seguro: F-01 (a API escuta só em `127.0.0.1`) e F-04 (tirar IP, usuário, chave e e-mail do SSH dos documentos). O resto vira próximas specs.
- Q: O relatório vai para o repositório? → A: não, `docs/security-audit/` entra no `.gitignore`; a autora decide depois das correções.

## Capacidade entregável

1. **Entrega:** a API passa a escutar só em `127.0.0.1` por padrão (variável `HOST` muda isso), então só o nginx alcança a porta 3333 e o limite de tentativas de login e cadastro não pode ser contornado com um `X-Forwarded-For` falso. Os documentos públicos deixam de trazer o IP do SSH, o usuário, o nome da chave e o e-mail da conta que envia as mensagens.
2. **Fica de fora:** os demais achados (CSP em modo bloqueio, limite na troca de senha, JOINs com `marcenaria_id`, token de recuperação em logs, cadastro que revela e-mails, dependência do front); nenhuma mudança de cálculo, rota, tela ou migração.
3. **Demonstração:** subir a API local e ver `API ouvindo em http://127.0.0.1:PORTA` e `netstat` com `127.0.0.1:PORTA`; na VPS, `sudo ss -ltn | grep 3333` deve mostrar `127.0.0.1:3333` e o site continua funcionando.

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RNF (segurança, achado A1/F-01) | Sem `HOST`, a API escuta em `127.0.0.1` | `backend/tests/unidade/host.test.ts` + `netstat` com a API real |
| Regressão | Nenhum teste existente quebra | Backend 305 de 305 (eram 303) |
| F-04 | `git grep` do IP com pontos, do nome da chave e do e-mail não acha nada nos arquivos atuais | `git grep` |
| D014 / AGENTS §5.4 | Nenhum segredo ou dado real no repositório | Revisão do diff |

## Telas e arquivos afetados

- `backend/src/config/host.ts` (novo), `ambiente.ts`, `servidor.ts`, `backend/.env.example`.
- `HANDOFF.md`, `documentacao/publicacao.md`, `evidencias/testes/012-publicacao-2026-10-08.md`: troca de dados de infraestrutura por marcadores.
- `.gitignore`: `docs/security-audit/` e `frontend/.vitest/`.

## Pendências e riscos

- O endereço do site (`https://<IP com hífens>.sslip.io`) continua nos documentos: é público por natureza e só some se o site passar a usar um domínio próprio. O IP e o nome da chave continuam no **histórico do Git**; não são segredos (sem senha nem chave privada) e o SSH aceita um único IP.
- Em desenvolvimento no Windows, `localhost` pode resolver para `::1`; o navegador tenta também `127.0.0.1`, então o front local segue funcionando. Se algum cliente falhar, ajustar `VITE_API_URL` para `http://127.0.0.1:3333`.
