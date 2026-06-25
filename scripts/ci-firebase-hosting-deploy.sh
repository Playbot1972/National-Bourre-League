#!/usr/bin/env bash
# Firebase deploy helper for GitHub Actions (hosting / rules / functions).
set -euo pipefail

ONLY="${1:?usage: ci-firebase-hosting-deploy.sh <only> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
FB_TOOLS="${FIREBASE_TOOLS_VERSION:-14.9.0}"

# Prefer explicit deploy key written by the workflow step.
CREDS="${FIREBASE_DEPLOY_SA_KEY:-${GOOGLE_APPLICATION_CREDENTIALS:-}}"
if [[ -z "$CREDS" || ! -f "$CREDS" ]]; then
  echo "::error::Service account key file missing (FIREBASE_DEPLOY_SA_KEY / GOOGLE_APPLICATION_CREDENTIALS)"
  exit 1
fi

node scripts/validate-service-account-key.mjs "$CREDS" --project "$PROJECT_ID"

export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"
export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$CREDS"
export GCLOUD_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export CLOUDSDK_CORE_PROJECT="$PROJECT_ID"
unset FIREBASE_TOKEN 2>/dev/null || true

activate_sa() {
  if command -v gcloud >/dev/null 2>&1; then
    gcloud auth activate-service-account --key-file="$CREDS" --project="$PROJECT_ID" --quiet
    gcloud config set project "$PROJECT_ID" --quiet 2>/dev/null || true
  fi
}

deploy_sa() {
  echo "firebase-auth=service-account file=${CREDS}"
  echo "firebase-tools=${FB_TOOLS}"
  npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${@:2}"
}

# Optional legacy CI token (firebase login:ci) — only when explicitly set.
if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "firebase-auth=ci-token"
  unset GOOGLE_APPLICATION_CREDENTIALS 2>/dev/null || true
  unset CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE 2>/dev/null || true
  npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" --token "$FIREBASE_TOKEN" "${@:2}"
  exit 0
fi

activate_sa
if deploy_sa "${@:2}"; then
  exit 0
fi

echo "::warning::Service-account deploy failed — retrying after clearing firebase local config"
rm -rf "${HOME}/.config/firebase" 2>/dev/null || true
activate_sa
deploy_sa "${@:2}"
