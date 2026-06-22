#!/usr/bin/env bash
# Grant missing IAM for GitHub Actions Cloud Functions deploy.
# Run once as a project Owner after setup-service-account.sh created github-firebase-deploy.
#
# Usage: ./scripts/fix-functions-deploy-iam.sh [project-id]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
SA_NAME="github-firebase-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
APP_ENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
ensure_gcloud

gcloud config set project "${PROJECT_ID}"

echo "==> Project roles for ${SA_EMAIL}"
for ROLE in \
  roles/cloudfunctions.developer \
  roles/serviceusage.serviceUsageViewer; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "${ROLE}" \
    --quiet >/dev/null
  echo "    ${ROLE}"
done

echo "==> Service Account User on ${APP_ENGINE_SA}"
gcloud iam service-accounts add-iam-policy-binding "${APP_ENGINE_SA}" \
  --member "serviceAccount:${SA_EMAIL}" \
  --role "roles/iam.serviceAccountUser" \
  --quiet >/dev/null

echo ""
echo "Done. Re-run Deploy to Firebase in GitHub Actions (workflow_dispatch on main)."
