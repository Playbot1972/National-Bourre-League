#!/usr/bin/env bash
# Grant missing IAM for GitHub Actions Cloud Functions deploy.
# Run once as a project Owner after setup-service-account.sh created github-firebase-deploy.
#
# Usage (from repo root):
#   ./scripts/fix-functions-deploy-iam.sh [project-id]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
SA_NAME="github-firebase-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
APP_ENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
if ! ensure_gcloud; then
  echo "==> gcloud CLI required. Install, then:"
  echo "  gcloud auth login"
  echo "  gcloud config set project ${PROJECT_ID}"
  echo "  ./scripts/fix-functions-deploy-iam.sh ${PROJECT_ID}"
  exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q .; then
  echo "==> Not logged in to gcloud. Run:"
  echo "  gcloud auth login"
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "==> Deploy service account: ${SA_EMAIL}"
if [[ -f "${ROOT}/.firebase-sa-key.json" ]]; then
  node scripts/validate-service-account-key.mjs "${ROOT}/.firebase-sa-key.json" --project "${PROJECT_ID}"
fi

echo "==> Project roles for ${SA_EMAIL}"
for ROLE in \
  roles/cloudfunctions.developer \
  roles/serviceusage.serviceUsageViewer \
  roles/serviceusage.serviceUsageAdmin; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "${ROLE}" \
    --quiet >/dev/null
  echo "    ${ROLE}"
done

grant_service_account_user() {
  local target_sa="$1"
  echo "==> Service Account User on ${target_sa}"
  gcloud iam service-accounts add-iam-policy-binding "${target_sa}" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "roles/iam.serviceAccountUser" \
    --quiet >/dev/null
}

grant_service_account_user "${APP_ENGINE_SA}"
grant_service_account_user "${COMPUTE_SA}"

echo ""
echo "Also enable Cloud Scheduler API (required for gcOrphanRooms onSchedule):"
echo "  npm run enable:functions-apis"
echo "  or: gcloud services enable cloudscheduler.googleapis.com --project=${PROJECT_ID}"
echo ""
echo "Done. Re-run deploy:"
echo "  gh workflow run deploy.yml --ref main"
echo "  or: npm run fix:deploy"
echo ""
echo "If functions still fail with actAs on *-compute@developer.gserviceaccount.com,"
echo "re-run this script — step 3 grants both App Engine and Compute default SAs."
