#!/usr/bin/env bash
# Set MIXED_PUBLIC_TABLES_SERVER_ENABLED=true on Phase 3 public-table Gen2 callables.
# Updates the underlying Cloud Run services in place (no code redeploy required).
# Client rollout flag and handler auth/membership checks are unchanged.
#
# Usage:
#   ./scripts/set-public-table-server-flag.sh [project-id] [region]
#   GOOGLE_APPLICATION_CREDENTIALS=... ./scripts/set-public-table-server-flag.sh

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
REGION="${2:-us-central1}"
ENV_KEY="MIXED_PUBLIC_TABLES_SERVER_ENABLED"
ENV_VALUE="true"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PUBLIC_TABLE_CALLABLES=(
  gameFindOrCreatePublicTable
  gameJoinPublicTable
  gameLeavePublicTable
)

cd "$ROOT"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
if ! ensure_gcloud; then
  echo "::error::gcloud CLI required for public-table server flag"
  exit 1
fi

if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" && -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]]; then
  gcloud auth activate-service-account --key-file="${GOOGLE_APPLICATION_CREDENTIALS}" --project="${PROJECT_ID}" --quiet
fi

if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q .; then
  echo "::error::No active gcloud credentials. Set GOOGLE_APPLICATION_CREDENTIALS or run gcloud auth login."
  exit 1
fi

gcloud config set project "${PROJECT_ID}" --quiet

echo "==> Setting ${ENV_KEY}=${ENV_VALUE} on Phase 3 callables (project=${PROJECT_ID}, region=${REGION})"

for fn in "${PUBLIC_TABLE_CALLABLES[@]}"; do
  echo "    ${fn}"
  service_uri="$(gcloud functions describe "${fn}" \
    --gen2 \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --format='value(serviceConfig.service)' 2>/dev/null || true)"
  if [[ -z "${service_uri}" ]]; then
    echo "::error::Could not resolve Cloud Run service for ${fn}"
    exit 1
  fi
  service_name="${service_uri##*/}"
  gcloud run services update "${service_name}" \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --update-env-vars="${ENV_KEY}=${ENV_VALUE}" \
    --quiet
done

verify_fn="${PUBLIC_TABLE_CALLABLES[0]}"
live_value="$(gcloud functions describe "${verify_fn}" \
  --gen2 \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(serviceConfig.environmentVariables.${ENV_KEY})")"

if [[ "${live_value}" != "${ENV_VALUE}" ]]; then
  echo "::error::${verify_fn} ${ENV_KEY}=${live_value:-<unset>} (expected ${ENV_VALUE})"
  exit 1
fi

echo "==> Verified ${verify_fn} ${ENV_KEY}=${live_value}"
echo "==> Done. Public-table callables should accept authenticated soak traffic."
