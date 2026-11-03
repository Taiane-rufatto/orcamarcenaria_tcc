# Evidência — Spec 028 (fechamento dos achados de segurança)

**Data:** 2026-11-03 · **Branch:** `spec/028-fechamento-seguranca` (a partir de `main` em `ddfc9fe`)

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` do backend; `tsc -b` e ESLint do frontend | sem erros |
| Backend (Vitest, 29 arquivos, banco local de teste) | 312 de 312 (7 novos em `tests/integracao/fechamento-de-seguranca.test.ts`); antes eram 305 |
| Frontend (Vitest, 7 arquivos) | 31 de 31 |
| Teste de mutação | com as correções de F-07 e F-10 desfeitas, os dois testes correspondentes falham; com elas, passam |
| `npm audit --omit=dev` | backend: 0 vulnerabilidades (eram 4 em 2026-11-03: `body-parser`, `nodemailer`, `qs`); frontend: 0 |
| `npm audit` completo do frontend | 12 avisos moderados, todos do `minimatch` dentro do ESLint (ferramenta de desenvolvimento; a correção forçada rebaixaria o ESLint) |
| Cálculo | `backend/src/dominio/orcamento/` sem alterações; CT01–CT10 passam na suíte |

## CSP em modo bloqueio (F-02)

Ensaio no Edge (Playwright) com o site compilado como na VPS (`VITE_API_URL=/api`) e servido por um servidor local com o mesmo cabeçalho `Content-Security-Policy` do modelo do nginx e `/api` repassado à API. Cada tela foi aberta com um ouvinte de `securitypolicyviolation`.

| Tela | Violações da CSP |
|---|---|
| Criar conta e entrar | 0 |
| Início, Materiais, Serviços, Clientes, Orçamentos, Minha marcenaria | 0 |
| Orçamento aberto, Painel | 0 |
| Esqueci minha senha | 0 |
| Redefinir senha com `#token=...` | 0; a tela mostrou o formulário e o token saiu do endereço |

Um primeiro ensaio acusou violação de `connect-src` porque o site foi compilado sem `VITE_API_URL=/api` (apontava para `localhost:3333`); isso é efeito do ensaio, não do site publicado, que sempre compila com `/api` (`atualizar.sh`).

**Não verificado:** download do PDF (orçamento do ensaio ficou em rascunho); Firefox; percurso no site publicado, que depende da publicação (ver `spec.md`).
