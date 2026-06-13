#!/usr/bin/env bash
# Step 3: Register a Firebase Web app and write docs/firebase-config.js.
#
# Prerequisites:
#   npm ci
#   npx firebase login
#   Step 2 complete (Firestore + rules)
#
# Usage:
#   ./scripts/setup-web-app.sh [project-id] [auth-domain]
#
# Example:
#   ./scripts/setup-web-app.sh national-bourre-league booray.win

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
DISPLAY_NAME="Booray Web"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FB="npx firebase"
SDK_FILE="$(mktemp)"

cd "$ROOT"

cleanup() {
  rm -f "${SDK_FILE}"
}
trap cleanup EXIT

if ! $FB login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Not logged in. Run: npx firebase login"
  exit 1
fi

echo "==> Using project: ${PROJECT_ID}"
$FB use "${PROJECT_ID}"

echo "==> Looking for an existing Web app…"
APP_ID="$($FB apps:list WEB --project "${PROJECT_ID}" 2>/dev/null | grep -oE '1:[0-9]+:web:[a-f0-9]+' | head -1 || true)"

if [[ -z "${APP_ID}" ]]; then
  echo "    Creating Web app \"${DISPLAY_NAME}\"…"
  CREATE_OUT="$($FB apps:create WEB "${DISPLAY_NAME}" --project "${PROJECT_ID}" 2>&1)"
  APP_ID="$(echo "${CREATE_OUT}" | grep -oE '1:[0-9]+:web:[a-f0-9]+' | head -1 || true)"
  if [[ -z "${APP_ID}" ]]; then
    echo "${CREATE_OUT}"
    echo "Could not create or parse Web app id."
    exit 1
  fi
  echo "    Created app: ${APP_ID}"
else
  echo "    Using existing app: ${APP_ID}"
fi

echo "==> Fetching web app config…"
$FB apps:sdkconfig WEB "${APP_ID}" --project "${PROJECT_ID}" --non-interactive > "${SDK_FILE}" 2>/dev/null || \
  $FB apps:sdkconfig WEB "${APP_ID}" --project "${PROJECT_ID}" > "${SDK_FILE}"

echo "==> Writing docs/firebase-config.js"
node scripts/apply-sdkconfig.js "${SDK_FILE}" "${PROJECT_ID}" "${AUTH_DOMAIN}"

echo ""
echo "==> Step 3 complete."
echo "    project: ${PROJECT_ID}"
echo ""
echo "    Next: ./scripts/one-time-setup.sh ${PROJECT_ID} ${AUTH_DOMAIN}"
echo "    (firebase-config.js is already written — skip apiKey/appId prompts if offered.)"
