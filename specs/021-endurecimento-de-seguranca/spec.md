# Spec 021 — Endurecimento de segurança

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-18
**Status:** implementada no código e verificada por testes automatizados em 2026-10-18 (D037). **Falta aplicar na VPS** os cabeçalhos do nginx e as restrições do systemd, e conferir a lista "não verificado" do diagnóstico.
Origem: diagnóstico da spec 017 (achados A1, A2, A5, A6, A7, e modelos para A3 e A11). Orientação de 08/10/2026 (ata §8): primeiro diagnosticar, depois corrigir o que a autora escolher.

## Contexto

O repositório no GitHub é **público** e a branch com o diagnóstico da spec 017 foi enviada, listando fragilidades do site publicado. A autora pediu para continuar e subir o que estava pendente; por isso os achados que o código resolve foram corrigidos em seguida.

## Requisitos e decisão

RNF27 (limite de tentativas); decisão D037.

## O que muda

| Achado | Correção |
|---|---|
| A1 Sem limite de tentativas | Contador em memória, sem dependência nova: login 10 por e-mail e 30 por endereço em 15 min; cadastro e recuperação de senha 10 por hora por endereço; redefinição 10 em 15 min. Resposta 429 com `Retry-After` e a mensagem "Muitas tentativas. Aguarde alguns minutos e tente de novo." |
| A2 Dependência com aviso crítico | `npm audit fix`: 0 vulnerabilidades |
| A5 Tempo de resposta do login | Comparação com um hash falso quando o e-mail não existe |
| A6 `/saude` com detalhe | Só `api`, `banco` e hora; a causa vai para o log |
| A7 `JWT_SECRET` | A API recusa menos de 32 caracteres ou o texto do `.env.example` |
| A3 Cabeçalhos | Modelo em `implantacao/nginx-orcamarcenaria.conf` + roteiro em `publicacao.md` (aplicar à mão) |
| A11 systemd | Quatro linhas no modelo `implantacao/orcamarcenaria-api.service` + roteiro |

A API passa a confiar em 1 salto de proxy (`trust proxy`) para enxergar o endereço real atrás do nginx.

## Capacidade entregável

1. **Entrega:** as correções acima, com testes.
2. **Fica de fora:** cookie `HttpOnly` no lugar do `sessionStorage` (A4), lista de senhas comuns (A8), backup agendado (A9), aviso de privacidade (A10), teste de invasão, qualquer verificação por dentro da VPS.
3. **Demonstração:** errar a senha 11 vezes com o mesmo e-mail e ver "Muitas tentativas"; abrir `/saude` e ver só três campos; `npm audit` sem vulnerabilidades.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| O contador permite até o máximo, informa a espera, reabre depois da janela e separa as chaves | `backend/tests/unidade/limite-de-tentativas.test.ts` (4) |
| Login: a 11ª tentativa dá 429 com `Retry-After`; outro e-mail continua livre; e-mail inexistente e senha errada têm a mesma mensagem | `backend/tests/integracao/limite-de-tentativas.test.ts` |
| Cadastro: a 11ª conta do mesmo endereço dá 429 | mesmo arquivo |
| `/saude` só com `api`, `banco` e `horaDoBanco` | mesmo arquivo |
| `JWT_SECRET` curto, de 31 caracteres ou igual ao exemplo é recusado; 32 ou mais passa | `backend/tests/unidade/ambiente-segredo.test.ts` |
| Dependências sem aviso | `npm audit` no backend e no frontend |
| Os outros testes não esbarram no limite | `vitest.config.ts` desliga o limite (`LIMITE_TENTATIVAS=desligado`) |
| Cabeçalhos e systemd funcionando na VPS | Pendente: `curl -sI` e `systemctl status` (ver `publicacao.md`) |

## Riscos

- Se o `JWT_SECRET` da VPS tiver menos de 32 caracteres, a API **não sobe** depois da atualização. Conferir antes.
- O limite zera ao reiniciar a API e vale por processo.
- Atrás de proxy, o endereço vem do cabeçalho `X-Forwarded-For` do nginx; a API só deve ser acessível pelo nginx (conferir o grupo de segurança).
- A CSP do nginx pode bloquear algo que o teste local não pegou; é a primeira linha a revisar se o site quebrar.

## Evidências

`evidencias/testes/021-022-seguranca-e-ajustes-de-uso-2026-10-18.md`.
