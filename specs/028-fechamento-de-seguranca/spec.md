# Spec 028 — Fechamento dos achados de segurança do TCC I

**Branch:** `spec/028-fechamento-de-seguranca`
**Data:** 2026-11-03
**Status:** implementada e testada em 2026-11-03; falta publicar na VPS (passos abaixo) e a revisão do diff pela autora.

## Clarificações

### Sessão 2026-11-03

- Q: O que entra? → A: todos os achados da auditoria de 2026-10-19 que ainda estavam abertos (F-02, F-03, F-05 a F-11). A meta da autora é terminar o TCC I sem nenhum risco alto e sem achado sem destino. O relatório continua fora do repositório (D042).
- Q: O que foi corrigido e o que foi aceito como risco? → A: ver D044. Corrigidos no código: F-05, F-06, F-07 (parte dos JOINs), F-09, F-10, F-11 (produção). Corrigido por configuração: F-02. Aceitos e documentados: F-03, F-08, a parte estrutural do F-07 e os avisos de ferramentas de desenvolvimento.
- Q: Muda cálculo, tela ou migração? → A: não. A única mudança de tela é o formato do link de recuperação de senha. Nenhuma migração.

## Capacidade entregável

1. **Troca de senha com limite (F-05).** `PUT /auth/senha` aceita 10 tentativas por usuário a cada 15 minutos; a 11ª recebe 429 com `Retry-After`. Senhas têm no máximo 128 caracteres em cadastro, login, troca e redefinição.
2. **Link de recuperação fora dos logs (F-06).** O token vai depois do `#` (`/redefinir-senha#token=...`), que o navegador não envia ao servidor; a tela lê o token e o apaga do endereço. Links antigos com `?token=` continuam valendo até expirar (1 hora). Sem SMTP em produção, o texto do e-mail não vai para o log.
3. **Isolamento reforçado nas consultas (F-07).** Os JOINs de material e fornecedor repetem o filtro da marcenaria, de modo que um vínculo indevido gravado direto no banco não expõe dados de outra conta.
4. **Limite que não desliga em produção (F-09).** `LIMITE_TENTATIVAS=desligado` é ignorado quando `NODE_ENV=production`.
5. **Sessão de usuário desativado (F-10).** A sessão só vale se o usuário continua ativo.
6. **CSP em modo bloqueio (F-02, F-08).** O cabeçalho passa de `Content-Security-Policy-Report-Only` para `Content-Security-Policy` em `implantacao/nginx-orcamarcenaria.conf`; `aplicar-endurecimento.sh` faz a troca numa VPS que já tem o endurecimento.
7. **Dependências (F-11).** `npm audit --omit=dev`: 0 vulnerabilidades no backend e no frontend. Restam 12 avisos moderados do `minimatch` dentro do ESLint (ferramenta de desenvolvimento, que não vai para o site).

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RNF27 (ampliado) | 11ª troca de senha em 15 min responde 429; senha com 129 caracteres é recusada e com 128 é aceita | `fechamento-de-seguranca.test.ts` |
| Segurança (F-06) | Em produção sem SMTP o log não contém o link nem `token=`; fora dela contém `redefinir-senha#token=`; o fluxo de redefinição continua funcionando com o link novo | `fechamento-de-seguranca.test.ts` e `recuperar-senha.test.ts` |
| RNF12 (F-07) | Material com fornecedor de outra marcenaria (forçado no banco) lista sem o nome do fornecedor | `fechamento-de-seguranca.test.ts` (falha se a correção sair) |
| Segurança (F-09) | Com `NODE_ENV=production` e `LIMITE_TENTATIVAS=desligado`, a 11ª tentativa de login responde 429 | `fechamento-de-seguranca.test.ts` |
| Segurança (F-10) | Usuário desativado no banco recebe 401 com o token emitido antes | `fechamento-de-seguranca.test.ts` (falha se a correção sair) |
| Segurança (F-02) | Site compilado como na VPS (`VITE_API_URL=/api`) servido com a CSP em bloqueio: zero violações em cadastro, entrada, listas, minha marcenaria, orçamento, painel, esqueci-senha e redefinição | Percurso no Edge com Playwright (evidência) |
| Regressão | Nenhum teste existente quebra; cálculo intacto | Backend 312 de 312; frontend 31 de 31 |

## Telas e arquivos afetados

- Backend: `api/rotas/autenticacao.ts`, `api/validacoes/autenticacao.ts`, `api/middlewares/limite-de-tentativas.ts`, `aplicacao/autenticacao/recuperar-senha.ts`, `infra/email/enviar-email.ts`, `infra/repositorios/{sessao,material,orcamento}-repositorio.ts`.
- Frontend: `paginas/RedefinirSenha.tsx` (lê o token do `#`).
- Implantação: `nginx-orcamarcenaria.conf`, `aplicar-endurecimento.sh`.
- `backend/src/dominio/orcamento/` não foi tocado.

## Publicação na VPS (fica para a autora, com backup)

1. Integrar a branch em `main` e rodar `atualizar.sh main` (nenhuma migração nova).
2. `sudo bash implantacao/aplicar-endurecimento.sh` para a CSP passar a bloquear. O script desfaz sozinho se o nginx recusar.
3. Conferir que o `.env` da VPS tem `NODE_ENV=production` (já consta em `documentacao/publicacao.md`); sem isso F-06 e F-09 não valem.
4. Abrir o site, entrar, abrir um orçamento, baixar o PDF e conferir o console (F12) sem erros de CSP.

## Riscos e pendências

- O download do PDF não foi exercitado no percurso automatizado (o orçamento do ensaio ficou em rascunho). Ele usa um link `blob:` com `download`, que a CSP não bloqueia, mas a conferência do passo 4 fecha isso.
- O ensaio rodou em Edge; a CSP vale igual no Chrome. No Firefox não foi rodado.
