#!/usr/bin/env bash
# Enable GCP APIs required for Firebase Cloud Functions (2nd gen) deploy.
# Run once as project Owner: ./scripts/enable-functions-apis.sh [project-id]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
if ! ensure_gcloud; then
  echo "==> gcloud CLI required."
  exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q .; then
  echo "==> Run: gcloud auth login"
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

APIS=(
  cloudbilling.googleapis.com
  cloudfunctions.googleapis.com
  cloudbuild.googleapis.com
  artifactregistry.googleapis.com
  run.googleapis.com
  eventarc.googleapis.com
  pubsub.googleapis.com
  storage.googleapis.com
  firebaseextensions.googleapis.com
  cloudscheduler.googleapis.com
  serviceusage.googleapis.com
)

echo "==> Enabling APIs for Cloud Functions deploy (${PROJECT_ID})…"
for API in "${APIS[@]}"; do
  gcloud services enable "${API}" --project "${PROJECT_ID}" --quiet
  echo "    ${API}"
done

echo ""
echo "Done. If you just enabled Cloud Billing API, wait 1–2 minutes, then redeploy."
