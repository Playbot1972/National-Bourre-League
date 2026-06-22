#!/usr/bin/env bash
# One-shot repair for GitHub Actions Firebase deploy.
# Run from repo root as a GCP project Owner with gh authenticated.
#
# Usage:
#   npm run fix:deploy
#   ./scripts/fix-deploy-all.sh [project-id] [auth-domain]
#   KEY_FILE=~/Downloads/key.json npm run fix:deploy
#
# Steps:
#   1. Validate service account JSON key
#   2. Enable Cloud Functions GCP APIs (incl. Cloud Billing API)
#   3. Grant Cloud Functions deploy IAM
#   4. Re-upload FIREBASE_SERVICE_ACCOUNT GitHub secret
#   5. Trigger Deploy to Firebase workflow on main

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${KEY_FILE:-${ROOT}/.firebase-sa-key.json}"

cd "$ROOT"

if ! node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['fix:deploy'] ? 0 : 1)" 2>/dev/null; then
  echo "==> This repo is missing npm run fix:deploy (old checkout)."
  echo "    Run: git pull origin main"
  echo "    Or run directly: ./scripts/fix-deploy-all.sh"
  exit 1
fi

if [[ ! -f "${KEY_FILE}" ]]; then
  echo "==> Missing service account key: ${KEY_FILE}"
  echo "    Create: npm run setup:service-account -- ${PROJECT_ID}"
  echo "    Or: KEY_FILE=/path/to/key.json npm run fix:deploy"
  exit 1
fi

echo "==> [1/5] Validate service account key (${KEY_FILE})"
node scripts/validate-service-account-key.mjs "${KEY_FILE}" --project "${PROJECT_ID}"

echo ""
echo "==> [2/5] Enable Cloud Functions APIs"
bash "${ROOT}/scripts/enable-functions-apis.sh" "${PROJECT_ID}"

echo ""
echo "==> [3/5] Fix Cloud Functions deploy IAM"
bash "${ROOT}/scripts/fix-functions-deploy-iam.sh" "${PROJECT_ID}"

echo ""
echo "==> [4/5] Sync GitHub secret FIREBASE_SERVICE_ACCOUNT"
KEY_FILE="${KEY_FILE}" bash "${ROOT}/scripts/sync-github-sa-secret.sh" "${PROJECT_ID}"

echo ""
echo "==> [5/5] Trigger GitHub Actions deploy"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh workflow run deploy.yml --ref main
  echo "    Watch: gh run watch \$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')"
else
  echo "    gh not available — trigger manually:"
  echo "    https://github.com/Playbot1972/National-Bourre-League/actions/workflows/deploy.yml"
fi

echo ""
echo "==> All repair steps finished."
