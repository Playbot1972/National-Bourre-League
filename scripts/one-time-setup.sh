#!/usr/bin/env bash
# One-time production setup for booray.win
#
# No global installs required — uses firebase-tools from npm devDependencies.
#
# Before running:
#   cd National-Bourre-League
#   npm ci
#   npx firebase login
#   (optional) brew install gh && gh auth login   — or set secrets in GitHub UI
#
# Usage:
#   ./scripts/one-time-setup.sh [project-id] [auth-domain]
#
# Example:
#   ./scripts/one-time-setup.sh national-bourre-league booray.win

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
DISPLAY_NAME="National Bourré League"
REGION="us-central1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FB="npx firebase"

cd "$ROOT"

echo "==> Installing local dependencies…"
npm ci

echo "==> Checking prerequisites…"
if ! $FB login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Not logged in to Firebase. Run:"
  echo "  npx firebase login"
  exit 1
fi

HAS_GH=false
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  HAS_GH=true
else
  echo "    GitHub CLI (gh) not available — secrets will be printed for manual entry."
  echo "    Install later: brew install gh && gh auth login"
fi

echo "==> Firebase project: ${PROJECT_ID}"
if ! $FB use "${PROJECT_ID}" 2>/dev/null; then
  echo "    Could not select project \"${PROJECT_ID}\"."
  echo "    Confirm the project id in Firebase Console → Project settings → General."
  echo "    Then run: npx firebase use ${PROJECT_ID}"
  exit 1
fi
echo "    Using existing project."

echo "==> Enabling Firestore…"
if $FB firestore:databases:list --project "${PROJECT_ID}" 2>/dev/null | grep -q "(default)"; then
  echo "    Firestore already enabled (Step 2 done)."
else
  echo "    Run Step 2 first: npm run setup:firestore -- ${PROJECT_ID}"
  exit 1
fi

echo "==> Writing .firebaserc"
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "${PROJECT_ID}"
  }
}
EOF

echo ""
echo "==> Console checklist (skip items already done):"
echo "    Auth:  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
echo "    Domains: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings"
echo "           → add ${AUTH_DOMAIN}, www.${AUTH_DOMAIN}"
echo ""

CONFIG_READY=false
if [[ -f docs/firebase-config.js ]] && ! grep -q 'REPLACE_WITH' docs/firebase-config.js; then
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
  if [[ -n "${FIREBASE_API_KEY}" && -n "${FIREBASE_APP_ID}" ]]; then
    CONFIG_READY=true
    echo "==> Using docs/firebase-config.js from Step 3 (setup:webapp)"
  fi
fi

if [[ "${CONFIG_READY}" != "true" ]]; then
  echo "    No web app config yet — run: npm run setup:webapp -- ${PROJECT_ID} ${AUTH_DOMAIN}"
  read -r -p "Press Enter after Step 3 (web app) is done, or to enter config manually…"
  read -r -p "Firebase apiKey: " FIREBASE_API_KEY
  read -r -p "Firebase appId: " FIREBASE_APP_ID
  if [[ -z "${FIREBASE_API_KEY}" || -z "${FIREBASE_APP_ID}" ]]; then
    echo "apiKey and appId are required."
    exit 1
  fi
  echo "==> Writing docs/firebase-config.js"
  export FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN="${AUTH_DOMAIN}" FIREBASE_PROJECT_ID="${PROJECT_ID}" FIREBASE_APP_ID
  node scripts/write-firebase-config.js
fi

echo "==> Service account for GitHub Actions…"
KEY_FILE="${ROOT}/.firebase-sa-key.json"
# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
ensure_gcloud >/dev/null 2>&1 || true

if [[ -f "${KEY_FILE}" ]]; then
  echo "    Using existing key: ${KEY_FILE}"
elif command -v gcloud >/dev/null; then
  "${ROOT}/scripts/setup-service-account.sh" "${PROJECT_ID}"
else
  echo "    Automated path (recommended):"
  echo "      npm run finish-setup -- ${PROJECT_ID} ${AUTH_DOMAIN}"
  echo ""
  echo "    Or install gcloud manually:"
  echo "      brew install --cask google-cloud-sdk"
  echo "      npm run setup:service-account -- ${PROJECT_ID}"
  exit 1
fi

if [[ ! -f "${KEY_FILE}" ]]; then
  echo "Service account key file not found."
  exit 1
fi

echo "==> GitHub Actions secrets…"
if $HAS_GH; then
  gh secret set FIREBASE_API_KEY --body "${FIREBASE_API_KEY}"
  gh secret set FIREBASE_AUTH_DOMAIN --body "${AUTH_DOMAIN}"
  gh secret set FIREBASE_PROJECT_ID --body "${PROJECT_ID}"
  gh secret set FIREBASE_APP_ID --body "${FIREBASE_APP_ID}"
  gh secret set FIREBASE_SERVICE_ACCOUNT < "${KEY_FILE}"
  echo "    Secrets set via gh."
else
  echo ""
  echo "    Add these at:"
  echo "    https://github.com/Playbot1972/National-Bourre-League/settings/secrets/actions"
  echo ""
  echo "    FIREBASE_API_KEY          = ${FIREBASE_API_KEY}"
  echo "    FIREBASE_AUTH_DOMAIN      = ${AUTH_DOMAIN}"
  echo "    FIREBASE_PROJECT_ID       = ${PROJECT_ID}"
  echo "    FIREBASE_APP_ID           = ${FIREBASE_APP_ID}"
  echo "    FIREBASE_SERVICE_ACCOUNT  = (paste entire contents of ${KEY_FILE})"
  echo ""
  read -r -p "Press Enter after adding secrets in GitHub…"
fi

echo "==> First deploy (Hosting + Firestore rules)…"
npm run build:hosting
$FB deploy --only hosting,firestore:rules --project "${PROJECT_ID}"

echo ""
echo "==> Custom domain (${AUTH_DOMAIN})"
echo "    1. https://console.firebase.google.com/project/${PROJECT_ID}/hosting/main"
echo "       Add custom domain → ${AUTH_DOMAIN} and www.${AUTH_DOMAIN}"
echo "    2. At your domain registrar, add the A/TXT records Firebase shows."
echo "    3. If using Google sign-in, add https://${AUTH_DOMAIN} to OAuth authorized origins:"
echo "       https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo ""
echo "==> Done. Pushes to main will auto-deploy via GitHub Actions."
echo "    Test: https://${PROJECT_ID}.web.app/ and /social/"
echo "    Then: https://${AUTH_DOMAIN}/ and https://${AUTH_DOMAIN}/social/"

# Restore placeholder config for local emulator dev
git checkout docs/firebase-config.js 2>/dev/null || true
rm -f "${KEY_FILE}" 2>/dev/null || true
