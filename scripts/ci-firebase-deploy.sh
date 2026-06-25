#!/usr/bin/env bash
# Deploy to Firebase in CI using FIREBASE_SERVICE_ACCOUNT JSON (not interactive login).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-deploy.sh <only-target> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
SA_JSON="${FIREBASE_SERVICE_ACCOUNT:?FIREBASE_SERVICE_ACCOUNT required}"

SA_FILE="${RUNNER_TEMP:-/tmp}/firebase-sa-deploy.json"
printf '%s' "$SA_JSON" > "$SA_FILE"
chmod 600 "$SA_FILE"

# Drop cached user login / conflicting auth from prior steps.
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

deploy_once() {
  if npx firebase deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${EXTRA[@]}"; then
    return 0
  fi
  # Fallback: mint OAuth token from SA (firebase-tools 15.x intermittent ADC miss).
  local token
  token="$(node scripts/firebase-ci-access-token.mjs "$SA_FILE")"
  FIREBASE_TOKEN="$token" npx firebase deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${EXTRA[@]}"
}

deploy_once
