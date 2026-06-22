#!/usr/bin/env bash
# One-shot repair for GitHub Actions Firebase deploy (IAM + corrupted SA secret).
# Run from repo root as a GCP project Owner with gh authenticated.
#
# Usage:
#   ./scripts/fix-deploy-all.sh [project-id] [auth-domain]
#
# Steps:
#   1. Validate .firebase-sa-key.json
#   2. Grant Cloud Functions IAM (Service Account User on App Engine SA)
#   3. Re-upload FIREBASE_SERVICE_ACCOUNT GitHub secret
#   4. Trigger Deploy to Firebase workflow on main

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "==> [1/4] Validate service account key"
node scripts/validate-service-account-key.mjs "${ROOT}/.firebase-sa-key.json" --project "${PROJECT_ID}"

echo ""
echo "==> [2/4] Fix Cloud Functions deploy IAM"
"${ROOT}/scripts/fix-functions-deploy-iam.sh" "${PROJECT_ID}"

echo ""
echo "==> [3/4] Sync GitHub secret FIREBASE_SERVICE_ACCOUNT"
"${ROOT}/scripts/sync-github-sa-secret.sh" "${PROJECT_ID}"

echo ""
echo "==> [4/4] Trigger GitHub Actions deploy"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh workflow run deploy.yml --ref main
  echo "    Watch: gh run list --workflow=deploy.yml --limit 1"
else
  echo "    gh not available — trigger manually:"
  echo "    https://github.com/Playbot1972/National-Bourre-League/actions/workflows/deploy.yml"
fi

echo ""
echo "==> All repair steps finished."
