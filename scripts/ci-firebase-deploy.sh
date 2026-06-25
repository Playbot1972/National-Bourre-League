#!/usr/bin/env bash
# Deploy to Firebase in CI using a service account key (not interactive login).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-deploy.sh <only-target> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"

# Prefer credentials file from google-github-actions/auth when present.
SA_FILE="${GOOGLE_APPLICATION_CREDENTIALS:-}"
if [[ -z "$SA_FILE" || ! -f "$SA_FILE" ]]; then
  SA_JSON="${FIREBASE_SERVICE_ACCOUNT:?FIREBASE_SERVICE_ACCOUNT required when GOOGLE_APPLICATION_CREDENTIALS unset}"
  SA_FILE="${RUNNER_TEMP:-/tmp}/firebase-sa-deploy.json"
  printf '%s' "$SA_JSON" > "$SA_FILE"
  chmod 600 "$SA_FILE"
fi

rm -rf "${HOME}/.config/firebase" 2>/dev/null || true
unset FIREBASE_TOKEN 2>/dev/null || true

export GOOGLE_APPLICATION_CREDENTIALS="$SA_FILE"
export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$SA_FILE"
export GCLOUD_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export CLOUDSDK_CORE_PROJECT="$PROJECT_ID"

node scripts/validate-service-account-key.mjs "$SA_FILE" --project "$PROJECT_ID"

if command -v gcloud >/dev/null 2>&1; then
  gcloud auth activate-service-account --key-file="$SA_FILE" --project="$PROJECT_ID" --quiet
fi

EXTRA=()
if [[ "${ONLY}" == "functions" ]]; then
  EXTRA+=(--force)
fi

mint_token() {
  local attempt token
  for attempt in 1 2 3; do
    if token="$(node scripts/firebase-ci-access-token.mjs "$SA_FILE" 2>/dev/null)"; then
      printf '%s' "$token"
      return 0
    fi
    sleep $((attempt * 2))
  done
  return 1
}

if npx firebase deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${EXTRA[@]}"; then
  exit 0
fi

token="$(mint_token)" || {
  echo "::error::Could not mint Firebase access token from service account"
  exit 1
}
FIREBASE_TOKEN="$token" npx firebase deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${EXTRA[@]}"
