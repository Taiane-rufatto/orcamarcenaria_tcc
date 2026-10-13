# Diagnóstico de segurança — OrçaMarcenaria

**Data:** 2026-10-13 · **Versão analisada:** `main` em `ee08afb` · **Site:** `https://54-232-52-91.sslip.io`
Gravidade: **Alta** (corrigir antes de divulgar mais o link), **Média** (corrigir se houver tempo), **Baixa** (melhoria ou risco aceitável), **Info** (observação).

## Resumo

Não encontrei falha que exponha dados de uma marcenaria a outra nem forma simples de entrar sem senha. A base está bem construída: isolamento por marcenaria vindo da sessão, consultas parametrizadas, senhas com bcrypt, sessão revogável no servidor e recuperação de senha cuidadosa. Os pontos fracos são de **endurecimento**: nada limita tentativas de senha, faltam cabeçalhos de segurança, há uma dependência com aviso crítico e o `/saude` é público e detalhado demais.

| # | Achado | Gravidade | Esforço para corrigir |
|---|---|---|---|
| A1 | Sem limite de tentativas no login, cadastro e redefinição | **Alta** | P |
| A2 | Dependência `proxy-addr` com aviso crítico (`npm audit`) | **Média** | P |
| A3 | Site sem cabeçalhos de segurança (HSTS, CSP, X-Frame-Options etc.) | **Média** | P |
| A4 | Token de sessão guardado em `sessionStorage` | Média | M |
| A5 | Login revela se o e-mail existe pelo tempo de resposta | Baixa | P |
| A6 | `/saude` público devolve mensagem de erro do banco | Baixa | P |
| A7 | `JWT_SECRET` sem exigência de tamanho mínimo | Baixa | P |
| A8 | Política de senha só pede 8 caracteres | Baixa | P |
| A9 | Backup do banco só manual | Média | P a M |
| A10 | Dados pessoais de clientes finais sem aviso de privacidade | Baixa | P |
| A11 | Serviço systemd sem restrições adicionais | Info | P |

## Achados

### A1 · Sem limite de tentativas — Alta
**Onde:** `backend/src/servidor.ts` (nenhum middleware de limite), rotas `POST /auth/entrar`, `/auth/cadastro`, `/auth/redefinir-senha`.
**Impacto:** qualquer pessoa pode testar senhas sem parar contra uma conta conhecida, ou criar contas em massa para encher o banco. A senha mínima de 8 caracteres e o bcrypt (custo 12) atrasam, mas não impedem. O bcrypt também deixa cada tentativa cara para o servidor: muitas tentativas seguidas podem derrubar a API (negação de serviço barata).
**Correção sugerida:** limite por IP e por e-mail (por exemplo, 10 tentativas de login em 15 minutos) com `express-rate-limit`, e `app.set('trust proxy', 1)` porque a API fica atrás do nginx. Alternativa só de configuração: `limit_req` no nginx para `/api/auth/`.
**Observação:** a recuperação de senha já tem trava de 1 pedido por minuto por usuário, o que está certo e fica como está.

### A2 · Dependência com aviso crítico — Média
**Onde:** `backend`, pacote `proxy-addr` (vem do `express`); `npm audit --omit=dev` aponta 1 vulnerabilidade crítica (falsificação de IP por sub-rede IPv4 em IPv6). O frontend não tem avisos.
**Impacto hoje:** baixo, porque a API não usa `trust proxy`. Passa a importar assim que o limite de A1 usar o IP do cliente.
**Correção sugerida:** `npm audit fix` no backend, rodar a suíte e publicar. Fazer junto com A1.

### A3 · Sem cabeçalhos de segurança — Média
**Onde:** `implantacao/nginx-orcamarcenaria.conf`. A resposta de `https://54-232-52-91.sslip.io` traz só `Server: nginx/1.24.0`: sem `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` ou `Referrer-Policy`. A versão do nginx também aparece.
**Impacto:** o site pode ser embutido em outra página (clickjacking), o navegador aceita o site por HTTP na primeira visita, e não há segunda barreira contra injeção de script.
**Correção sugerida:** no nginx, `server_tokens off;` e `add_header ... always` para HSTS, `X-Content-Type-Options nosniff`, `X-Frame-Options DENY`, `Referrer-Policy strict-origin-when-cross-origin` e uma CSP simples (`default-src 'self'`). Não exige mexer no código.

### A4 · Token em `sessionStorage` — Média
**Onde:** `frontend/src/servicos/autenticacao.ts`.
**Impacto:** se algum dia houver injeção de script (XSS), o token pode ser lido. Hoje o risco é reduzido: o React escapa o conteúdo, o `sessionStorage` morre ao fechar a aba, a sessão tem 8 horas e pode ser revogada no servidor (logout e troca de senha encerram as sessões).
**Correção sugerida:** a CSP de A3 já reduz bastante. Trocar por cookie `HttpOnly` é a solução completa, mas muda o front e a API; deixar para o TCC II e citar como risco aceito.

### A5 · Tempo de resposta do login — Baixa
**Onde:** `aplicacao/autenticacao/entrar.ts`. Para e-mail inexistente a função responde logo; para e-mail existente roda o bcrypt (cerca de 250 ms). Quem medir o tempo descobre quais e-mails têm conta, mesmo com a mensagem igual nos dois casos.
**Correção sugerida:** rodar uma comparação de bcrypt com hash falso quando o usuário não existe.
**Observação:** o cadastro já avisa "e-mail já em uso", o que também revela contas; isso é comum e aceitável num sistema com cadastro aberto.

### A6 · `/saude` público e detalhado — Baixa
**Onde:** `servidor.ts`. Quando o banco cai, devolve `erro.message` na resposta, que pode revelar nome de host, porta ou usuário do banco.
**Correção sugerida:** devolver só `banco: "indisponivel"` e registrar o detalhe no log. Manter a rota (o `atualizar.sh` a usa).

### A7 · `JWT_SECRET` sem validação — Baixa
**Onde:** `config/ambiente.ts` exige que exista, mas aceita qualquer valor, inclusive o do `.env.example` (`troque-por-um-valor-aleatorio-longo`).
**Correção sugerida:** recusar valores com menos de 32 caracteres ou iguais ao exemplo. O roteiro de publicação manda gerar com `openssl rand -hex 32`; confirmar na VPS (ver "Não verificado").

### A8 · Política de senha — Baixa
**Onde:** `api/validacoes/autenticacao.ts` (mínimo de 8 caracteres). Aceita `12345678`.
**Correção sugerida:** recusar uma lista curta de senhas muito comuns e senha igual ao e-mail. Não exigir símbolos obrigatórios, que não ajudam.

### A9 · Backup do banco só manual — Média
**Onde:** o backup foi feito à mão antes da migração `009` (`pg_dump`). Não há rotina agendada nem teste de restauração.
**Impacto:** o item "armazenamento dos dados" que o professor citou inclui poder recuperar os dados. Se a VPS ou o disco falhar, os dados do cliente se perdem.
**Correção sugerida:** `cron` diário com `pg_dump`, guardando os últimos 7 dias em outro local (outro disco ou bucket), e um teste de restauração anotado em `evidencias/`.

### A10 · Dados pessoais de clientes finais — Baixa
O cadastro de clientes guarda nome, telefone, e-mail e endereço de pessoas que não usam o sistema. Isso é dado pessoal (LGPD). Para o TCC, bastam dois cuidados: manter só dados fictícios na base publicada (RNF15) e escrever na monografia que o uso real exigiria aviso de privacidade e base legal. Não é parecer jurídico.

### A11 · Serviço sem restrições extras — Info
`orcamarcenaria-api.service` roda com usuário dedicado, o que está certo. Dá para somar `NoNewPrivileges=true`, `ProtectSystem=full` e `PrivateTmp=true` sem custo.

## O que já está bem

- **Isolamento entre marcenarias:** o `marcenariaId` vem sempre da sessão (nunca do corpo ou da URL) e todas as consultas de orçamento, catálogo, cliente e configuração filtram por ele; as rotas de itens e custos conferem a posse do orçamento por subconsulta. Os testes de integração cobrem o isolamento (TI01–TI04).
- **SQL:** consultas parametrizadas (`$1`, `$2`); nenhuma concatenação de texto do usuário em SQL nos repositórios.
- **Senhas:** bcrypt com custo 12; nunca devolvidas pela API.
- **Sessão:** JWT HS256 com algoritmo fixado na verificação, validade de 8 horas **e** sessão guardada no banco (logout, troca e redefinição de senha encerram as sessões de verdade).
- **Recuperação de senha:** token aleatório de 32 bytes, só o hash no banco, validade de 1 hora, uso único, trava de linha contra uso duplo, resposta idêntica para e-mail com e sem conta, e as sessões abertas são encerradas ao redefinir.
- **Rotas protegidas:** todas as rotas de dados exigem autenticação; sem token, `/api/orcamentos` responde 401.
- **CORS:** só a origem do site é aceita; uma origem estranha não recebe permissão.
- **HTTPS:** HTTP redireciona (301) para HTTPS; `.env` fora do Git; `.env.example` sem segredos reais (o histórico só traz o texto de exemplo).
- **Erros:** erros internos viram "Ocorreu um erro interno." sem detalhe.
- **Dependências do frontend:** 0 vulnerabilidades.

## Não verificado (precisa de acesso à VPS)

1. O PostgreSQL escuta só em `localhost`, não em toda a rede.
2. O grupo de segurança da AWS libera só as portas 22, 80 e 443.
3. SSH só por chave, sem login por senha e sem login direto como `root`.
4. O `.env` da VPS tem permissão restrita (`chmod 600`) e o `JWT_SECRET` real tem 32 caracteres ou mais.
5. Atualizações automáticas de segurança do sistema (`unattended-upgrades`) e renovação automática do certificado.
6. Configuração TLS do nginx (versões e cifras): conferir com uma ferramenta de teste de TLS.
7. Nenhum teste dinâmico foi feito (injeção, quebra de sessão, abuso de rotas).

## Proposta de correção, em ordem

Um incremento pequeno de endurecimento resolve o que mais pesa, sem tocar no cálculo:

1. **A1 + A2** — limite de tentativas e `npm audit fix` (junto).
2. **A3** — cabeçalhos no nginx (só configuração, sem mexer no código).
3. **A6 + A7 + A5** — `/saude` sem detalhe, validação do segredo, comparação falsa de senha.
4. **A9** — backup agendado e teste de restauração.
5. **A8 + A11** — senha comum e restrições do systemd, se sobrar tempo.
6. **A4 e A10** — registrar como risco aceito e trabalho do TCC II (cookie `HttpOnly`, aviso de privacidade).

Estimativa: um a dois dias para os itens 1 a 4. Sugiro encaixar **depois do diferencial (018 e 019)**, antes de divulgar o link para mais gente, e fazer os itens A1 e A3 já se o orientador for acessar o site antes.
