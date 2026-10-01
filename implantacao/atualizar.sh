#!/usr/bin/env bash
# Atualiza a versão publicada (D029). Rodar na VPS como o usuário orcamarcenaria:
#   bash /opt/orcamarcenaria/implantacao/atualizar.sh [branch]
# Sem branch, usa a que já está baixada.
set -euo pipefail
cd /opt/orcamarcenaria

if [ "${1:-}" != "" ]; then git fetch origin && git switch "$1"; fi
git pull --ff-only

echo "== API: dependências, compilação e migrações"
cd backend
npm ci
npm run build
npm run migrar

echo "== Front-end: compilação (a API fica em /api no mesmo endereço)"
cd ../frontend
npm ci
VITE_API_URL=/api npm run build

echo "== Reiniciando a API"
sudo systemctl restart orcamarcenaria-api
sleep 2
curl -fsS http://127.0.0.1:3333/saude && echo && echo "Atualizado."
