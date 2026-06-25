#!/usr/bin/env bash
# Deploy Firebase Hosting without interactive `firebase login`.
# Uses a service account JSON key via GOOGLE_APPLICATION_CREDENTIALS.
#
# Prerequisites:
#   - Service account key: .firebase-sa-key.json (or KEY_FILE=...)
#   - Firebase web config: .env.firebase (copy from .env.firebase.example)
#     OR export FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_APP_ID, FIREBASE_AUTH_DOMAIN
#
# Usage:
#   npm run deploy:hosting:sa:patch     # bump version + deploy hosting
#   npm run deploy:hosting:sa         # deploy hosting (no version bump)
#   KEY_FILE=~/Downloads/key.json npm run deploy:hosting:sa:patch

set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:-national-bourre-league}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${KEY_FILE:-${ROOT}/.firebase-sa-key.json}"
BUMP="${BUMP_VERSION:-0}"

cd "$ROOT"

if [[ ! -f "${KEY_FILE}" ]]; then
  echo "==> Missing service account key: ${KEY_FILE}"
  echo ""
  echo "Create one (GCP project Owner):"
  echo "  npm run setup:service-account -- ${PROJECT_ID}"
  echo ""
  echo "Or download from Google Cloud Console → IAM → Service Accounts"
  echo "  → github-firebase-deploy → Keys → Add key → JSON"
  echo "  Save as: ${KEY_FILE}"
  exit 1
fi

node scripts/validate-service-account-key.mjs "${KEY_FILE}" --project "${PROJECT_ID}"

# Service account auth — do not mix with firebase login session or FIREBASE_TOKEN.
unset FIREBASE_TOKEN 2>/dev/null || true
export GOOGLE_APPLICATION_CREDENTIALS="${KEY_FILE}"
export GCLOUD_PROJECT="${PROJECT_ID}"
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"

if command -v gcloud >/dev/null 2>&1; then
  gcloud auth activate-service-account --key-file="${KEY_FILE}" --project="${PROJECT_ID}" --quiet 2>/dev/null || true
fi

echo "==> Firebase auth: service account ${KEY_FILE}"
echo "==> Project: ${PROJECT_ID}"

FB_TOOLS="${FIREBASE_TOOLS_VERSION:-14.9.0}"
npx "firebase-tools@${FB_TOOLS}" use "${PROJECT_ID}" --non-interactive

if [[ "${BUMP}" == "1" ]]; then
  BUILD_CHANNEL=production node scripts/bump-version.js
fi

BUILD_CHANNEL=production node scripts/ensure-firebase-config.js
node scripts/check-deploy-version.mjs
npm run build:hosting

deploy_hosting() {
  local auth_mode="$1"
  shift
  if [[ "$auth_mode" == "adc" ]]; then
    npx "firebase-tools@${FB_TOOLS}" deploy --only hosting --non-interactive --project "${PROJECT_ID}"
  else
    npx "firebase-tools@${FB_TOOLS}" deploy --only hosting --non-interactive --project "${PROJECT_ID}" --token "$1"
  fi
}

echo "==> Deploying hosting…"
if deploy_hosting adc; then
  :
else
  if [[ ! -d functions/node_modules/google-auth-library ]]; then
    npm ci --prefix functions --omit=dev --silent
  fi
  TOKEN="$(node scripts/firebase-ci-access-token.mjs "${KEY_FILE}")"
  echo "==> ADC failed — retrying with service-account access token"
  deploy_hosting token "$TOKEN"
fi

echo ""
echo "==> Done. Verify:"
echo "    npm run verify:prod"
