#!/usr/bin/env bash
# Aplica na VPS o endurecimento do diagnóstico de segurança (spec 017 e 021):
#   A3  cabeçalhos de segurança e versão do nginx escondida;
#   A11 restrições do serviço systemd da API.
#
# Rodar como root, uma vez:   sudo bash implantacao/aplicar-endurecimento.sh
#
# É seguro rodar de novo (só faz o que ainda não foi feito). Antes de mexer, guarda uma cópia dos arquivos em
# /var/backups/orcamarcenaria-config-<data> e, se o nginx recusar a configuração ou a API não responder depois,
# DESFAZ sozinho e termina com erro. O que fica no repositório não tem IP, ID de conta nem segredo (repositório público).
set -euo pipefail

SITE=/etc/nginx/sites-available/orcamarcenaria
UNIDADE=/etc/systemd/system/orcamarcenaria-api.service
COPIAS=/var/backups/orcamarcenaria-config-$(date +%F-%H%M%S)

[ "$(id -u)" -eq 0 ] || { echo "Rode como root: sudo bash $0"; exit 1; }
mkdir -p "$COPIAS"
cp "$SITE" "$UNIDADE" "$COPIAS"/
echo "== cópia dos arquivos em $COPIAS"

# ---------- nginx (A3) ----------
if grep -q "Strict-Transport-Security" "$SITE"; then
  echo "== nginx: os cabeçalhos já estão aplicados; nada a fazer"
else
  python3 - "$SITE" <<'PY'
import re, sys
caminho = sys.argv[1]
s = open(caminho, encoding='utf-8').read()
bloco = '''
    # Achado A3 do diagnóstico de segurança (spec 021): esconde a versão do nginx e manda cabeçalhos de segurança.
    # O nginx não herda add_header para um location que declare o seu próprio (como /assets/); tudo bem, porque a
    # CSP importa nas páginas HTML, servidas pelo location /.
    server_tokens off;
    add_header Strict-Transport-Security "max-age=15552000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # A CSP começa em modo SÓ RELATAR (não bloqueia nada). Depois de abrir o site no navegador e conferir que o console
    # não mostra bloqueios (fontes do Google, estilos do React, PDF), troque o nome do cabeçalho por
    # Content-Security-Policy para valer de verdade.
    add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
'''
# O primeiro "server_name" do arquivo é o do bloco HTTPS (o certbot põe o redirecionamento do HTTP no segundo bloco).
m = re.search(r'\n[ \t]*server_name [^;]+;\n', s)
if not m:
    sys.exit('não achei server_name em ' + caminho)
s = s[:m.end()] + bloco + s[m.end():]
open(caminho, 'w', encoding='utf-8').write(s)
PY
  if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "== nginx: cabeçalhos aplicados e nginx recarregado"
  else
    cp "$COPIAS/$(basename "$SITE")" "$SITE"
    echo "!! nginx recusou a configuração; arquivo restaurado. Nada foi alterado."
    nginx -t
    exit 1
  fi
fi

# ---------- systemd (A11) ----------
if grep -q "^NoNewPrivileges=" "$UNIDADE"; then
  echo "== systemd: as restrições já estão aplicadas; nada a fazer"
else
  sed -i '/^RestartSec=5$/a NoNewPrivileges=true\nPrivateTmp=true\nProtectSystem=full\nProtectHome=true' "$UNIDADE"
  systemctl daemon-reload
  systemctl restart orcamarcenaria-api
  ok=0
  for _ in 1 2 3 4 5 6 7 8; do
    sleep 2
    if curl -fsS http://127.0.0.1:3333/saude >/dev/null 2>&1; then ok=1; break; fi
  done
  if [ "$ok" -eq 1 ]; then
    echo "== systemd: restrições aplicadas e a API respondeu em /saude"
  else
    cp "$COPIAS/$(basename "$UNIDADE")" "$UNIDADE"
    systemctl daemon-reload
    systemctl restart orcamarcenaria-api
    echo "!! a API não respondeu com as restrições; arquivo restaurado e API reiniciada."
    journalctl -u orcamarcenaria-api -n 15 --no-pager || true
    exit 1
  fi
fi

echo "== pronto. Cópias para desfazer à mão, se precisar: $COPIAS"
