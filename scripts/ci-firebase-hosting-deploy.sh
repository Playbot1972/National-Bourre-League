#!/usr/bin/env bash
# Firebase deploy helper for GitHub Actions (hosting / rules / functions).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ONLY="${1:?usage: ci-firebase-hosting-deploy.sh <only> e.g. hosting}"
PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
FB_TOOLS="${FIREBASE_TOOLS_VERSION:-14.9.0}"

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
  if [[ "$ONLY" == "functions" ]]; then
    npx "firebase-tools@${FB_TOOLS}" functions:artifacts:setpolicy \
      --location us-central1 \
      --days 30 \
      --force \
      --non-interactive \
      --project "$PROJECT_ID" 2>/dev/null || true
  fi
  set +e
  local out
  out=$(npx "firebase-tools@${FB_TOOLS}" deploy --only "$ONLY" --non-interactive --project "$PROJECT_ID" "${@:2}" 2>&1)
  local code=$?
  set -e
  echo "$out"
  if [[ $code -ne 0 && "$ONLY" == "functions" ]]; then
    if echo "$out" | grep -q "Functions successfully deployed but could not set up cleanup policy"; then
      echo "::warning::Functions deployed; artifact cleanup policy not configured (non-fatal)"
      return 0
    fi
  fi
  if [[ $code -eq 0 && "$ONLY" == "functions" ]]; then
    echo "==> Ensuring public invoker on Phase 3 public-table callables"
    bash "${ROOT}/scripts/fix-public-table-callable-invoker.sh" "${PROJECT_ID}" us-central1 || {
      echo "::warning::public-table invoker fix failed — run scripts/fix-public-table-callable-invoker.sh manually"
    }
    echo "==> Ensuring MIXED_PUBLIC_TABLES_SERVER_ENABLED on Phase 3 public-table callables"
    bash "${ROOT}/scripts/set-public-table-server-flag.sh" "${PROJECT_ID}" us-central1 || {
      echo "::warning::public-table server flag failed — run scripts/set-public-table-server-flag.sh manually"
    }
  fi
  return "$code"
}

activate_sa
if deploy_adc "${@:2}"; then
  exit 0
fi

echo "::warning::ADC deploy failed — re-activating service account and retrying once"
rm -rf "${HOME}/.config/firebase" 2>/dev/null || true
activate_sa
deploy_adc "${@:2}"
