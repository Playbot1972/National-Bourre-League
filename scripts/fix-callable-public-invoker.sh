#!/usr/bin/env bash
# Grant public Cloud Run invoker on Gen2 game callables.
#
# gameAdvanceBots was deployed before onCall({ invoker: "public" }) landed; Firebase
# deploy does not always backfill IAM on unchanged functions. A 403 HTML response
# (no CORS headers on OPTIONS) means the browser never reaches the handler.
#
# Usage:
#   ./scripts/fix-callable-public-invoker.sh [project-id]
#   FIREBASE_PROJECT_ID=my-project npm run fix:callable-invoker

set -euo pipefail

PROJECT_ID="${1:-${FIREBASE_PROJECT_ID:-national-bourre-league}}"
REGION="${FIREBASE_FUNCTIONS_REGION:-us-central1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/gcloud-path.sh"
if ! ensure_gcloud; then
  echo "==> gcloud CLI required for callable invoker repair"
  exit 1
fi

gcloud config set project "${PROJECT_ID}" --quiet

CALLABLES=(
  gameAdvanceBots
  gameEnsureHandEnrollment
  gameTimeoutEnrollment
  gameAdvanceHandReveal
  gameSetHandParticipation
  gameSubmitDraw
  gameFoldDraw
  gamePlayCard
  gameRecordHand
  gameVoteCoWinSettlement
)

echo "==> Public invoker bindings (${PROJECT_ID}, ${REGION})"

for fn in "${CALLABLES[@]}"; do
  echo "    ${fn}"
  if gcloud functions add-invoker-policy-binding "$fn" \
    --gen2 \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --member="allUsers" \
    --quiet 2>/dev/null; then
    continue
  fi
  # Fallback: Gen2 Cloud Run service name is the function id lowercased.
  svc="$(echo "$fn" | tr '[:upper:]' '[:lower:]')"
  gcloud run services add-iam-policy-binding "$svc" \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --member="allUsers" \
    --role="roles/run.invoker" \
    --quiet
done

echo "==> Done. Verify: npm run verify:game-callables"
