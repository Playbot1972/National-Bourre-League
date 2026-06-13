#!/usr/bin/env bash
# Step 2: Create Firestore and deploy security rules.
#
# Prerequisites:
#   npm ci
#   npx firebase login
#
# Usage:
#   ./scripts/setup-firestore.sh [project-id] [region]
#
# Example:
#   ./scripts/setup-firestore.sh national-bourre-league us-central1

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
REGION="${2:-us-central1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FB="npx firebase"

cd "$ROOT"

if ! $FB login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Not logged in. Run: npx firebase login"
  exit 1
fi

echo "==> Using project: ${PROJECT_ID}"
$FB use "${PROJECT_ID}"

echo "==> Enabling Cloud Firestore API (if needed)…"
if command -v gcloud >/dev/null; then
  gcloud services enable firestore.googleapis.com --project "${PROJECT_ID}" 2>/dev/null || true
  echo "    API enable requested via gcloud."
else
  echo "    If create fails with 403, enable the API here (click Enable):"
  echo "    https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${PROJECT_ID}"
  echo "    Or create Firestore in Firebase Console → Build → Firestore Database → Create database"
fi

echo "==> Creating Firestore database (production mode)…"
if $FB firestore:databases:list --project "${PROJECT_ID}" 2>/dev/null | grep -q "(default)"; then
  echo "    Firestore already exists."
else
  if ! $FB firestore:databases:create "(default)" --location "${REGION}" --project "${PROJECT_ID}"; then
    echo ""
    echo "==> Create failed. Common fix: enable the Firestore API, wait 1–2 min, retry."
    echo "    https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${PROJECT_ID}"
    echo "    Or use Firebase Console → Firestore Database → Create database (UI enables API automatically)."
    exit 1
  fi
  echo "    Firestore created in ${REGION}."
fi

echo "==> Writing .firebaserc"
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "${PROJECT_ID}"
  }
}
EOF

echo "==> Deploying Firestore security rules…"
$FB deploy --only firestore:rules --project "${PROJECT_ID}"

echo ""
echo "==> Step 2 complete."
echo "    Verify: https://console.firebase.google.com/project/${PROJECT_ID}/firestore"
echo "    Next: register a Web app (Step 3), then run ./scripts/one-time-setup.sh"
