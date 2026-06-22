#!/usr/bin/env bash
# Validate .firebase-sa-key.json and upload to GitHub secret FIREBASE_SERVICE_ACCOUNT.
#
# Usage (from repo root):
#   ./scripts/sync-github-sa-secret.sh [project-id]
#
# Prerequisites: gh auth login, .firebase-sa-key.json in repo root

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${ROOT}/.firebase-sa-key.json"
REPO="${GITHUB_REPOSITORY:-Playbot1972/National-Bourre-League}"

cd "$ROOT"

if [[ ! -f "${KEY_FILE}" ]]; then
  echo "==> Missing ${KEY_FILE}"
  echo "    Create it: npm run setup:service-account -- ${PROJECT_ID}"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "==> gh CLI required. Install: https://cli.github.com"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "==> Run: gh auth login"
  exit 1
fi

echo "==> Validating service account key…"
node scripts/validate-service-account-key.mjs "${KEY_FILE}" --project "${PROJECT_ID}"

echo "==> Uploading FIREBASE_SERVICE_ACCOUNT to ${REPO}…"
gh secret set FIREBASE_SERVICE_ACCOUNT < "${KEY_FILE}" --repo "${REPO}"

echo ""
echo "==> Done. Re-run deploy:"
echo "    gh workflow run deploy.yml --ref main"
