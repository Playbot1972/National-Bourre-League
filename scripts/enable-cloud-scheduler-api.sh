#!/usr/bin/env bash
# Enable Cloud Scheduler API (required for gcOrphanRooms onSchedule).
# Uses GOOGLE_APPLICATION_CREDENTIALS or active gcloud account.
#
# Usage:
#   FIREBASE_PROJECT_ID=national-bourre-league ./scripts/enable-cloud-scheduler-api.sh

set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:-national-bourre-league}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
ensure_gcloud >/dev/null 2>&1 || {
  echo "gcloud CLI required"
  exit 1
}

if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" && -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]]; then
  gcloud auth activate-service-account --key-file="${GOOGLE_APPLICATION_CREDENTIALS}" \
    --project="${PROJECT_ID}" --quiet
fi

gcloud config set project "${PROJECT_ID}" --quiet

API="cloudscheduler.googleapis.com"
if gcloud services list --enabled --project "${PROJECT_ID}" \
  --filter="config.name:${API}" --format="value(config.name)" | grep -q "${API}"; then
  echo "OK: ${API} already enabled on ${PROJECT_ID}"
  exit 0
fi

echo "==> Enabling ${API} on ${PROJECT_ID}"
gcloud services enable "${API}" --project "${PROJECT_ID}" --quiet
echo "OK: ${API} enabled"
