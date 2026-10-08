# Publicação para demonstração (VPS)

Roteiro da publicação decidida em D029: uma VPS com Ubuntu 24.04, PostgreSQL, a API como serviço do sistema e o nginx servindo o front-end, com HTTPS do Let's Encrypt num endereço gratuito `<ip>.sslip.io`. Os arquivos de configuração estão em `implantacao/`.

```
navegador ──HTTPS──▶ nginx ──┬── /        → frontend/dist (arquivos do React)
                             └── /api/... → API Node (127.0.0.1:3333) ──▶ PostgreSQL (local)
```

Front e API ficam no mesmo endereço; o front é compilado com `VITE_API_URL=/api`.

## 0. O que você precisa antes

- **VPS** com Ubuntu 24.04, 1–2 GB de RAM, e o **IP público** dela (aparece no painel do provedor). Exemplo neste roteiro: `203.0.113.10`.
- **Endereço:** troque os pontos do IP por hífens e acrescente `.sslip.io`. Ex.: `203-0-113-10.sslip.io`. Ele já aponta para a VPS; não há nada a configurar.
- **Gmail para os e-mails** (RF07, D028): de preferência uma conta criada só para o sistema, com verificação em duas etapas ligada e uma **senha de app** gerada em Conta Google › Segurança › Senhas de app.

Nos comandos abaixo, troque `ENDERECO` pelo seu endereço `.sslip.io`.

## 1. Acessar a VPS e preparar o sistema

No PowerShell do seu computador: `ssh root@203.0.113.10` (a senha vem no e-mail ou no painel do provedor). Depois, na VPS:

```bash
apt update && apt upgrade -y
apt install -y git nginx postgresql certbot python3-certbot-nginx ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs

# firewall: só SSH, HTTP e HTTPS
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# usuário próprio para rodar o sistema (não usar root)
adduser --disabled-password --gecos "" orcamarcenaria
echo "orcamarcenaria ALL=(root) NOPASSWD: /usr/bin/systemctl restart orcamarcenaria-api" > /etc/sudoers.d/orcamarcenaria
```

## 2. Banco de dados

```bash
SENHA_BANCO=$(openssl rand -hex 16); echo "Guarde: $SENHA_BANCO"
sudo -u postgres psql -c "CREATE USER orcamarcenaria WITH PASSWORD '$SENHA_BANCO';"
sudo -u postgres psql -c "CREATE DATABASE orcamarcenaria OWNER orcamarcenaria;"
```

O PostgreSQL só aceita conexões da própria VPS (padrão do Ubuntu); a porta 5432 não fica aberta para a internet.

## 3. Código e configuração

```bash
mkdir -p /opt/orcamarcenaria && chown orcamarcenaria: /opt/orcamarcenaria
sudo -u orcamarcenaria git clone https://github.com/Taiane-rufatto/orcamarcenaria_tcc.git /opt/orcamarcenaria
cd /opt/orcamarcenaria && sudo -u orcamarcenaria git switch spec/012-publicacao-e-senha
```

Se o repositório for privado, o `git clone` pede usuário e um *token* do GitHub (Settings › Developer settings › Personal access tokens), não a senha.

Crie o `.env` da API (`sudo -u orcamarcenaria nano /opt/orcamarcenaria/backend/.env`):

```
PORT=3333
NODE_ENV=production
DATABASE_URL=postgresql://orcamarcenaria:SENHA_BANCO@localhost:5432/orcamarcenaria
JWT_SECRET=<resultado de: openssl rand -hex 32>
JWT_EXPIRACAO=8h
CORS_ORIGIN=https://ENDERECO
URL_FRONTEND=https://ENDERECO
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USUARIO=conta.do.sistema@gmail.com
SMTP_SENHA=<senha de app do Gmail>
EMAIL_REMETENTE=OrçaMarcenaria <conta.do.sistema@gmail.com>
```

Depois: `chmod 600 /opt/orcamarcenaria/backend/.env`. Esse arquivo nunca vai para o repositório (AGENTS §5).

## 4. Serviço da API e nginx

```bash
cp /opt/orcamarcenaria/implantacao/orcamarcenaria-api.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable orcamarcenaria-api

sed "s/ENDERECO/203-0-113-10.sslip.io/" /opt/orcamarcenaria/implantacao/nginx-orcamarcenaria.conf > /etc/nginx/sites-available/orcamarcenaria
ln -sf /etc/nginx/sites-available/orcamarcenaria /etc/nginx/sites-enabled/orcamarcenaria
rm -f /etc/nginx/sites-enabled/default
chmod o+x /opt/orcamarcenaria /opt/orcamarcenaria/frontend   # o nginx precisa ler o dist
```

## 5. Primeira compilação e HTTPS

```bash
sudo -u orcamarcenaria bash /opt/orcamarcenaria/implantacao/atualizar.sh
nginx -t && systemctl reload nginx
certbot --nginx -d ENDERECO --redirect -m seu.email@exemplo.com --agree-tos -n
```

O `atualizar.sh` instala as dependências, compila API e front, aplica as migrações e reinicia a API; no fim mostra a resposta de `/saude`. O certbot instala o certificado, passa a redirecionar HTTP para HTTPS (RNF14) e renova sozinho.

## 6. Conferir

- `https://ENDERECO` abre a tela de entrada, com cadeado.
- Criar uma conta de demonstração, com dados fictícios (RNF15), e montar o orçamento do CT03: preço final R$ 2.760,00.
- Antes de testar o e-mail, confira que o `.env` tem as cinco linhas `SMTP_*`/`EMAIL_REMETENTE` e reinicie a API: `sudo grep -E "^(SMTP|EMAIL)" /opt/orcamarcenaria/backend/.env | sed -E "s/(SENHA)=.*/=<oculto>/"`. Sem elas o sistema não envia e-mail, só escreve o link no log (foi o que aconteceu no primeiro teste da publicação).
- "Esqueceu sua senha?" com o e-mail da conta: o e-mail chega (confira o spam) e o link troca a senha. A tela responde igual para e-mail sem conta, então use o e-mail exato do cadastro; um novo pedido em menos de 1 minuto é ignorado.
- E-mail não chegou: `journalctl -u orcamarcenaria-api -n 30`. `SMTP não configurado` = faltam as variáveis; `Invalid login` ou `535` = senha de app errada ou verificação em duas etapas desligada; `ETIMEDOUT` = porta 465 bloqueada (trocar para 587); nenhuma linha = o e-mail digitado não tem conta.
- Problemas: `journalctl -u orcamarcenaria-api -n 50` mostra o log da API; `tail /var/log/nginx/error.log`, o do nginx.

## Atualizar depois de novos commits

Envie os commits para o GitHub e, na VPS:

```bash
sudo -u orcamarcenaria bash /opt/orcamarcenaria/implantacao/atualizar.sh            # mesma branch
sudo -u orcamarcenaria bash /opt/orcamarcenaria/implantacao/atualizar.sh main       # trocar para main
```

## Cópia de segurança do banco

```bash
sudo -u postgres pg_dump orcamarcenaria > ~/orcamarcenaria-$(date +%F).sql
```
