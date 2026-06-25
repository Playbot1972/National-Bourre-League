#!/usr/bin/env bash
# Deploy to Firebase in CI using FIREBASE_SERVICE_ACCOUNT JSON (not interactive login).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-deploy.sh <only-target> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
SA_JSON="${FIREBASE_SERVICE_ACCOUNT:?FIREBASE_SERVICE_ACCOUNT required}"

SA_FILE="${RUNNER_TEMP:-/tmp}/firebase-sa-deploy.json"
printf '%s' "$SA_JSON" > "$SA_FILE"
chmod 600 "$SA_FILE"

export GOOGLE_APPLICATION_CREDENTIALS="$SA_FILE"
export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$SA_FILE"
export GCLOUD_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export CLOUDSDK_CORE_PROJECT="$PROJECT_ID"
unset FIREBASE_TOKEN 2>/dev/null || true

node scripts/validate-service-account-key.mjs "$SA_FILE" --project "$PROJECT_ID"

EXTRA=()
if [[ "${ONLY}" == "functions" ]]; then
  EXTRA+=(--force)
fi

npx firebase deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${EXTRA[@]}"
