#!/usr/bin/env bash
# Finish deploy setup (steps 2–6): gcloud → service account key → deploy.
#
# Run in a normal Terminal tab (not inside another script prompt).
#
# Usage:
#   ./scripts/finish-deploy-setup.sh [project-id] [auth-domain]
#
# Example:
#   ./scripts/finish-deploy-setup.sh national-bourre-league booray.win

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
AUTH_DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${ROOT}/.firebase-sa-key.json"

cd "$ROOT"

echo "==> Step 2: Google Cloud CLI"
# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
if ! ensure_gcloud; then
  echo "Could not find or install gcloud."
  if ! command -v brew >/dev/null 2>&1; then
    echo ""
    echo "Homebrew is not installed. Use the manual path instead:"
    echo "  npm run finish-setup:manual -- ${PROJECT_ID} ${AUTH_DOMAIN}"
    echo ""
    echo "Or install Homebrew first: https://brew.sh"
  else
    gcloud_install_hint
  fi
  exit 1
fi
echo "    $(gcloud --version 2>&1 | head -1)"

echo ""
echo "==> Step 3: gcloud login + project"
if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q .; then
  echo "    Opening browser for gcloud auth login…"
  gcloud auth login
fi
gcloud config set project "${PROJECT_ID}"
echo "    Active account: $(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -1)"
echo "    Project: ${PROJECT_ID}"

echo ""
echo "==> Step 4: Service account + JSON key"
FORCE_KEY="${FORCE_SA_KEY:-}"
if [[ -f "${KEY_FILE}" && "${FORCE_KEY}" != "1" ]]; then
  echo "    Key already exists: ${KEY_FILE}"
else
  FORCE_SA_KEY=1 "${ROOT}/scripts/setup-service-account.sh" "${PROJECT_ID}"
fi

echo ""
echo "==> Step 5: Verify key file"
if [[ ! -f "${KEY_FILE}" ]]; then
  echo "    MISSING: ${KEY_FILE}"
  exit 1
fi
if ! node -e "JSON.parse(require('fs').readFileSync('${KEY_FILE}','utf8'))" 2>/dev/null; then
  echo "    Invalid JSON in ${KEY_FILE}"
  exit 1
fi
echo "    OK: ${KEY_FILE} ($(wc -c < "${KEY_FILE}" | tr -d ' ') bytes)"

echo ""
echo "==> Step 6: Deploy (one-time-setup)"
"${ROOT}/scripts/one-time-setup.sh" "${PROJECT_ID}" "${AUTH_DOMAIN}"
