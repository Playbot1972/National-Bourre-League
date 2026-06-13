#!/usr/bin/env bash
# Finish deploy without Homebrew/gcloud — browser service account + Firebase deploy.
#
# Use this if "Homebrew not found" or gcloud won't install.
#
# Usage:
#   ./scripts/finish-deploy-manual.sh [project-id] [auth-domain]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${ROOT}/.firebase-sa-key.json"
FB="npx firebase"

cd "$ROOT"

echo "==> Manual deploy setup (no Homebrew / gcloud required)"
echo ""

if ! $FB login:list 2>/dev/null | grep -q "Logged in"; then
  echo "==> Firebase login required"
  $FB login
fi

echo "==> Step A: Create service account key in your browser"
echo ""
echo "    1. Open:"
echo "       https://console.cloud.google.com/iam-admin/serviceaccounts?project=${PROJECT_ID}"
echo ""
echo "    2. Create service account:"
echo "       Name: github-firebase-deploy"
echo ""
echo "    3. Roles (add both):"
echo "       • Firebase Hosting Admin"
echo "       • Firebase Rules Admin"
echo ""
echo "    4. Keys tab → Add key → Create new key → JSON → download"
echo ""
echo "    5. Move the downloaded file to:"
echo "       ${KEY_FILE}"
echo ""
echo "    Example (adjust filename if different):"
echo "       mv ~/Downloads/${PROJECT_ID}*.json \"${KEY_FILE}\""
echo ""

while [[ ! -f "${KEY_FILE}" ]]; do
  read -r -p "Press Enter after saving ${KEY_FILE} (or type path to JSON download): " REPLY
  if [[ -n "${REPLY}" && -f "${REPLY}" ]]; then
    if [[ "${REPLY}" == *.json ]] && node -e "JSON.parse(require('fs').readFileSync('${REPLY}','utf8'))" 2>/dev/null; then
      cp "${REPLY}" "${KEY_FILE}"
      echo "    Copied to ${KEY_FILE}"
    else
      echo "    Not a valid JSON key file: ${REPLY}"
    fi
  elif [[ -f "${KEY_FILE}" ]]; then
    break
  else
    echo "    Still waiting for ${KEY_FILE}…"
  fi
done

if ! node -e "JSON.parse(require('fs').readFileSync('${KEY_FILE}','utf8'))" 2>/dev/null; then
  echo "Invalid JSON in ${KEY_FILE}"
  exit 1
fi
echo "    OK: ${KEY_FILE} ($(wc -c < "${KEY_FILE}" | tr -d ' ') bytes)"

echo ""
echo "==> Step B: GitHub secrets (for auto-deploy on push to main)"
echo "    https://github.com/Playbot1972/National-Bourre-League/settings/secrets/actions"
echo ""
echo "    Required secrets:"
echo "      FIREBASE_API_KEY          (from Firebase web app — Step 3)"
echo "      FIREBASE_AUTH_DOMAIN      = ${AUTH_DOMAIN}"
echo "      FIREBASE_PROJECT_ID       = ${PROJECT_ID}"
echo "      FIREBASE_APP_ID           (from Firebase web app — Step 3)"
echo "      FIREBASE_SERVICE_ACCOUNT  = paste entire ${KEY_FILE} contents"
echo ""

if [[ -f docs/firebase-config.js ]] && ! grep -q 'REPLACE_WITH' docs/firebase-config.js; then
  echo "    apiKey/appId from docs/firebase-config.js:"
  grep -E 'apiKey:|appId:' docs/firebase-config.js | sed 's/^/      /'
fi

read -r -p "Press Enter after adding GitHub secrets (or skip if doing deploy only)…"

echo ""
echo "==> Step C: Deploy to Firebase Hosting"
$FB use "${PROJECT_ID}"
npm ci
npm run build:hosting
$FB deploy --only hosting,firestore:rules --project "${PROJECT_ID}"

echo ""
echo "==> Done!"
echo "    https://${PROJECT_ID}.web.app/"
echo "    https://${PROJECT_ID}.web.app/social/"
echo ""
echo "    Custom domain: Firebase Console → Hosting → add ${AUTH_DOMAIN}"
