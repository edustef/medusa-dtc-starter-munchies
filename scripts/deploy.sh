#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

deploy_medusa() {
  echo "🚂 Deploying Medusa to Railway..."
  cd "$ROOT_DIR"
  railway up --service medusa-backend
}

deploy_search() {
  echo "🔍 Syncing search index & deploying worker..."
  cd "$ROOT_DIR/apps/search"
  pnpm sync
  pnpm deploy
}

deploy_web() {
  echo "🌐 Building & deploying web to Cloudflare..."
  cd "$ROOT_DIR/apps/web"
  pnpm deploy
}

case "${1:-all}" in
  medusa)  deploy_medusa ;;
  search)  deploy_search ;;
  web)     deploy_web ;;
  all)
    deploy_medusa
    deploy_search
    deploy_web
    echo "✅ All services deployed!"
    ;;
  *)
    echo "Usage: $0 {medusa|search|web|all}"
    exit 1
    ;;
esac
