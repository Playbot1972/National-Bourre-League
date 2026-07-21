#!/usr/bin/env bash
# Grant public Cloud Run invoker on Phase 3 public-table Gen2 callables.
# Required for Firebase httpsCallable clients (same as other game callables).
# Handler auth remains in functions/index.js wrap() — this only opens the transport layer.
#
# Usage:
#   ./scripts/fix-public-table-callable-invoker.sh [project-id] [region]
#   GOOGLE_APPLICATION_CREDENTIALS=... ./scripts/fix-public-table-callable-invoker.sh

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
REGION="${2:-us-central1}"
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
  echo "::error::gcloud CLI required for public-table callable invoker fix"
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

echo "==> Fixing public invoker on Phase 3 callables (project=${PROJECT_ID}, region=${REGION})"

for fn in "${PUBLIC_TABLE_CALLABLES[@]}"; do
  echo "    ${fn}"
  gcloud functions add-invoker-policy-binding "${fn}" \
    --region="${REGION}" \
    --member="allUsers" \
    --project="${PROJECT_ID}" \
    --quiet
done

echo "==> Done. Public-table callables should return callable JSON (not 401 HTML) to authenticated clients."
