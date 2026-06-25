#!/usr/bin/env bash
# Firebase deploy helper for GitHub Actions (hosting / rules / functions).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-hosting-deploy.sh <only> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
FB_TOOLS="${FIREBASE_TOOLS_VERSION:-14.9.0}"

rm -rf "${HOME}/.config/firebase" 2>/dev/null || true

if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "firebase-auth=ci-token"
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

if command -v gcloud >/dev/null 2>&1; then
  gcloud auth activate-service-account --key-file="$CREDS" --project="$PROJECT_ID" --quiet
  gcloud auth application-default set-quota-project "$PROJECT_ID" 2>/dev/null || true
fi

echo "firebase-auth=application-default credentials=${CREDS}"
echo "firebase-tools=${FB_TOOLS}"

DEPLOY_ARGS=(deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${@:2}")

if npx "firebase-tools@${FB_TOOLS}" "${DEPLOY_ARGS[@]}"; then
  exit 0
fi

echo "::warning::ADC deploy failed — retrying with minted service-account access token"
TOKEN="$(node scripts/firebase-ci-access-token.mjs "$CREDS")"
echo "firebase-auth=sa-access-token"
npx "firebase-tools@${FB_TOOLS}" "${DEPLOY_ARGS[@]}" --token "$TOKEN"
