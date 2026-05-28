#!/usr/bin/env bash
# Despliega un preview PÚBLICO (sin login) en GitHub Pages del fork.
# La app apunta al backend de .env.production (Supabase staging).
# Uso: bash scripts/deploy-pages.sh
set -euo pipefail

REPO_URL="https://github.com/DaGarJim/CampoIA.git"
BASE="/CampoIA/"

echo "→ Build con base ${BASE} (staging horneada desde .env.production)"
npx vite build --base="${BASE}"

echo "→ Fallback SPA + .nojekyll"
cp dist/index.html dist/404.html
touch dist/.nojekyll

echo "→ Publicando rama gh-pages"
(
  cd dist
  rm -rf .git
  git init -q
  git checkout -q -B gh-pages
  git add -A
  git -c user.email=dano.garcia.jimenez@gmail.com -c user.name=DaGarJim commit -q -m "deploy: CAMPO preview público"
  git push -f "${REPO_URL}" gh-pages
)

echo "✓ Publicado → https://dagarjim.github.io/CampoIA/ (Pages tarda ~1 min en propagar)"
