#!/usr/bin/env bash
# Firebase deploy helper for GitHub Actions (hosting / rules / functions).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-hosting-deploy.sh <only> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
FB_TOOLS="${FIREBASE_TOOLS_VERSION:-14.9.0}"

rm -rf "${HOME}/.config/firebase" 2>/dev/null || true

if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "firebase-auth=ci-token"
  unset GOOGLE_APPLICATION_CREDENTIALS 2>/dev/null || true
  unset CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE 2>/dev/null || true
  npx "firebase-tools@${FB_TOOLS}" use "$PROJECT_ID" --non-interactive --token "$FIREBASE_TOKEN"
  npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" --token "$FIREBASE_TOKEN" "${@:2}"
  exit 0
fi

CREDS="${GOOGLE_APPLICATION_CREDENTIALS:-}"
if [[ -z "$CREDS" || ! -f "$CREDS" ]]; then
  echo "::error::GOOGLE_APPLICATION_CREDENTIALS missing — google-github-actions/auth step failed"
  exit 1
fi

node scripts/validate-service-account-key.mjs "$CREDS" --project "$PROJECT_ID"

export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$CREDS"
export GCLOUD_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export CLOUDSDK_CORE_PROJECT="$PROJECT_ID"
unset FIREBASE_TOKEN 2>/dev/null || true

activate_sa() {
  if command -v gcloud >/dev/null 2>&1; then
    gcloud auth activate-service-account --key-file="$CREDS" --project="$PROJECT_ID" --quiet
    gcloud auth application-default set-quota-project "$PROJECT_ID" 2>/dev/null || true
  fi
}

deploy_adc() {
  echo "firebase-auth=application-default credentials=${CREDS}"
  echo "firebase-tools=${FB_TOOLS}"
  unset FIREBASE_TOKEN 2>/dev/null || true
  export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"
  export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$CREDS"
  npx "firebase-tools@${FB_TOOLS}" use "$PROJECT_ID" --non-interactive
  npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${@:2}"
}

deploy_token() {
  local token="$1"
  echo "firebase-auth=service-account-access-token"
  echo "firebase-tools=${FB_TOOLS}"
  # ADC env vars take precedence over --token in firebase-tools — clear them for token auth.
  unset GOOGLE_APPLICATION_CREDENTIALS 2>/dev/null || true
  unset CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE 2>/dev/null || true
  unset GOOGLE_GHA_CREDS_PATH 2>/dev/null || true
  export FIREBASE_TOKEN="$token"
  npx "firebase-tools@${FB_TOOLS}" use "$PROJECT_ID" --non-interactive --token "$token"
  npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" --token "$token" "${@:2}"
}

activate_sa
if deploy_adc "${@:2}"; then
  exit 0
fi

echo "::warning::ADC deploy failed — re-activating service account and retrying once"
rm -rf "${HOME}/.config/firebase" 2>/dev/null || true
activate_sa
if deploy_adc "${@:2}"; then
  exit 0
fi

echo "::warning::ADC deploy failed again — minting service-account access token"
if [[ ! -d functions/node_modules/google-auth-library ]]; then
  npm ci --prefix functions --omit=dev --silent
fi
TOKEN="$(node scripts/firebase-ci-access-token.mjs "$CREDS")"
deploy_token "$TOKEN" "${@:2}"
