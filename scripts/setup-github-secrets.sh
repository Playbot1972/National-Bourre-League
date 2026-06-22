#!/usr/bin/env bash
# Set all 5 GitHub Actions secrets for Firebase deploy.
#
# Prerequisites:
#   gh auth login   (repo admin access)
#   docs/firebase-config.js populated (Step 3)
#   .firebase-sa-key.json present
#
# Usage:
#   ./scripts/setup-github-secrets.sh [project-id] [auth-domain]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${ROOT}/.firebase-sa-key.json"
REPO="Playbot1972/National-Bourre-League"

cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "==> GitHub CLI (gh) not installed."
  echo ""
  echo "Install gh, then re-run:"
  echo "  https://cli.github.com — download macOS installer"
  echo "  gh auth login"
  echo "  ./scripts/setup-github-secrets.sh ${PROJECT_ID} ${AUTH_DOMAIN}"
  echo ""
  echo "Or add secrets manually:"
  echo "  https://github.com/${REPO}/settings/secrets/actions"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "==> Not logged in to GitHub. Run:"
  echo "  gh auth login"
  exit 1
fi

if [[ ! -f docs/firebase-config.js ]] || grep -q 'REPLACE_WITH' docs/firebase-config.js; then
  echo "==> Missing web app config. Run Step 3 first:"
  echo "  npm run setup:webapp -- ${PROJECT_ID} ${AUTH_DOMAIN}"
  exit 1
fi

if [[ ! -f "${KEY_FILE}" ]]; then
  echo "==> Missing service account key: ${KEY_FILE}"
  echo "    Create it: npm run setup:service-account -- ${PROJECT_ID}"
  exit 1
fi

echo "==> Validating service account key…"
node scripts/validate-service-account-key.mjs "${KEY_FILE}" --project "${PROJECT_ID}"

FIREBASE_API_KEY="$(node --input-type=module -e "
import { readFileSync } from 'node:fs';
const src = readFileSync('docs/firebase-config.js', 'utf8');
console.log(src.match(/apiKey:\\s*\"([^\"]+)\"/)?.[1] || '');
")"
FIREBASE_APP_ID="$(node --input-type=module -e "
import { readFileSync } from 'node:fs';
const src = readFileSync('docs/firebase-config.js', 'utf8');
console.log(src.match(/appId:\\s*\"([^\"]+)\"/)?.[1] || '');
")"

if [[ -z "${FIREBASE_API_KEY}" || -z "${FIREBASE_APP_ID}" ]]; then
  echo "Could not read apiKey/appId from docs/firebase-config.js"
  exit 1
fi

echo "==> Setting GitHub secrets on ${REPO}…"

gh secret set FIREBASE_API_KEY --body "${FIREBASE_API_KEY}" --repo "${REPO}"
gh secret set FIREBASE_AUTH_DOMAIN --body "${AUTH_DOMAIN}" --repo "${REPO}"
gh secret set FIREBASE_PROJECT_ID --body "${PROJECT_ID}" --repo "${REPO}"
gh secret set FIREBASE_APP_ID --body "${FIREBASE_APP_ID}" --repo "${REPO}"
gh secret set FIREBASE_SERVICE_ACCOUNT < "${KEY_FILE}" --repo "${REPO}"

echo ""
echo "==> All 5 secrets set:"
echo "    FIREBASE_API_KEY"
echo "    FIREBASE_AUTH_DOMAIN = ${AUTH_DOMAIN}"
echo "    FIREBASE_PROJECT_ID  = ${PROJECT_ID}"
echo "    FIREBASE_APP_ID"
echo "    FIREBASE_SERVICE_ACCOUNT"
echo ""
echo "    Verify: https://github.com/${REPO}/settings/secrets/actions"
