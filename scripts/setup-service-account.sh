#!/usr/bin/env bash
# Create a Firebase deploy service account + JSON key for GitHub Actions.
#
# Prerequisites:
#   brew install --cask google-cloud-sdk   # Mac
#   gcloud auth login
#   gcloud config set project YOUR_PROJECT_ID
#
# Usage:
#   ./scripts/setup-service-account.sh [project-id]
#
# Output:
#   .firebase-sa-key.json  (gitignored — paste into FIREBASE_SERVICE_ACCOUNT secret)

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
FORCE="${FORCE_SA_KEY:-}"
SA_NAME="github-firebase-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${ROOT}/.firebase-sa-key.json"

cd "$ROOT"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
ensure_gcloud >/dev/null 2>&1 || true

if ! command -v gcloud >/dev/null; then
  echo "==> gcloud CLI not found."
  echo ""
  echo "Install on Mac:"
  echo "  brew install --cask google-cloud-sdk"
  echo "  gcloud auth login"
  echo "  gcloud config set project ${PROJECT_ID}"
  echo "  ./scripts/setup-service-account.sh ${PROJECT_ID}"
  echo ""
  echo "Or create the key manually:"
  echo "  https://console.cloud.google.com/iam-admin/serviceaccounts?project=${PROJECT_ID}"
  echo "  Roles: Firebase Hosting Admin + Firebase Rules Admin"
  echo "  Save JSON as: ${KEY_FILE}"
  exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q .; then
  echo "==> Not logged in to gcloud. Run:"
  echo "  gcloud auth login"
  exit 1
fi

echo "==> Project: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

echo "==> Service account: ${SA_EMAIL}"
if ! gcloud iam service-accounts describe "${SA_EMAIL}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name "GitHub Actions Firebase deploy"
  echo "    Created."
else
  echo "    Already exists."
fi

echo "==> Granting deploy roles…"
for ROLE in roles/firebasehosting.admin roles/firebaserules.admin; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "${ROLE}" \
    --quiet >/dev/null
done
echo "    Firebase Hosting Admin + Firebase Rules Admin"

if [[ -f "${KEY_FILE}" ]]; then
  if [[ "${FORCE}" == "1" ]]; then
    rm -f "${KEY_FILE}"
  else
    read -r -p "${KEY_FILE} exists. Overwrite? (y/N) " ans
    if [[ "${ans}" != [yY] ]]; then
      echo "    Keeping existing key: ${KEY_FILE}"
      exit 0
    fi
    rm -f "${KEY_FILE}"
  fi
fi

echo "==> Creating JSON key…"
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account "${SA_EMAIL}"

echo ""
echo "==> Service account key ready:"
echo "    ${KEY_FILE}"
echo ""
echo "    Add to GitHub secret FIREBASE_SERVICE_ACCOUNT:"
echo "    https://github.com/Playbot1972/National-Bourre-League/settings/secrets/actions"
echo "    (paste the entire JSON file contents)"
