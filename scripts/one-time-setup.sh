#!/usr/bin/env bash
# One-time production setup for booray.win
#
# Prerequisites (run once on your machine):
#   npm install -g firebase-tools
#   firebase login
#   gh auth login          # needs repo admin to set secrets
#   gcloud auth login      # optional; uses Firebase/GCP project IAM
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
SA_NAME="github-firebase-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "==> Checking prerequisites…"
command -v firebase >/dev/null || { echo "Install firebase-tools: npm i -g firebase-tools"; exit 1; }
command -v gh >/dev/null || { echo "Install GitHub CLI: https://cli.github.com"; exit 1; }
firebase login:list 2>/dev/null | grep -q "Logged in" || { echo "Run: firebase login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run: gh auth login"; exit 1; }

echo "==> Firebase project: ${PROJECT_ID}"
if ! firebase projects:list 2>/dev/null | grep -q "${PROJECT_ID}"; then
  echo "    Creating project (may take a minute)…"
  firebase projects:create "${PROJECT_ID}" --display-name "${DISPLAY_NAME}"
else
  echo "    Project already exists."
fi

firebase use "${PROJECT_ID}"

echo "==> Enabling Firestore…"
if firebase firestore:databases:list 2>/dev/null | grep -q "(default)"; then
  echo "    Firestore already enabled."
else
  firebase firestore:databases:create "(default)" --location "${REGION}" || true
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
echo "==> MANUAL STEPS in Firebase Console (cannot be fully automated via CLI):"
echo "    1. https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
echo "       Enable Email/Password and Google sign-in."
echo "    2. https://console.firebase.google.com/project/${PROJECT_ID}/settings/general"
echo "       Add a Web app if you haven't → copy apiKey and appId."
echo "    3. https://console.firebase.google.com/project/${PROJECT_ID}/hosting/sites"
echo "       Get started with Hosting (first deploy below will finish this)."
echo "    4. https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings"
echo "       Authorized domains → add: ${AUTH_DOMAIN}, www.${AUTH_DOMAIN}"
echo ""
read -r -p "Press Enter after completing the console steps and copying web app config…"

read -r -p "Firebase apiKey: " FIREBASE_API_KEY
read -r -p "Firebase appId: " FIREBASE_APP_ID

if [[ -z "${FIREBASE_API_KEY}" || -z "${FIREBASE_APP_ID}" ]]; then
  echo "apiKey and appId are required."
  exit 1
fi

echo "==> Writing local production config (for manual deploys)"
export FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN="${AUTH_DOMAIN}" FIREBASE_PROJECT_ID="${PROJECT_ID}" FIREBASE_APP_ID
node scripts/write-firebase-config.js

echo "==> Service account for GitHub Actions…"
if command -v gcloud >/dev/null; then
  gcloud config set project "${PROJECT_ID}" 2>/dev/null || true
  if ! gcloud iam service-accounts describe "${SA_EMAIL}" >/dev/null 2>&1; then
    gcloud iam service-accounts create "${SA_NAME}" \
      --display-name "GitHub Actions Firebase deploy"
  fi
  for ROLE in roles/firebasehosting.admin roles/firebaserules.admin; do
    gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
      --member "serviceAccount:${SA_EMAIL}" \
      --role "${ROLE}" \
      --quiet >/dev/null
  done
  KEY_FILE="${ROOT}/.firebase-sa-key.json"
  gcloud iam service-accounts keys create "${KEY_FILE}" \
    --iam-account "${SA_EMAIL}"
  echo "    Service account key: ${KEY_FILE}"
else
  echo "    gcloud not found — create a service account manually:"
  echo "    https://console.cloud.google.com/iam-admin/serviceaccounts?project=${PROJECT_ID}"
  echo "    Roles: Firebase Hosting Admin + Firebase Rules Admin"
  read -r -p "Path to downloaded JSON key file: " KEY_FILE
fi

echo "==> Setting GitHub Actions secrets…"
gh secret set FIREBASE_API_KEY --body "${FIREBASE_API_KEY}"
gh secret set FIREBASE_AUTH_DOMAIN --body "${AUTH_DOMAIN}"
gh secret set FIREBASE_PROJECT_ID --body "${PROJECT_ID}"
gh secret set FIREBASE_APP_ID --body "${FIREBASE_APP_ID}"
gh secret set FIREBASE_SERVICE_ACCOUNT < "${KEY_FILE}"

echo "==> First deploy (Hosting + Firestore rules)…"
npm ci
npm run build:hosting
firebase deploy --only hosting,firestore:rules --project "${PROJECT_ID}"

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
