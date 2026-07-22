#!/usr/bin/env bash
# Ensure gcOrphanRooms scheduler can be created on deploy:
# - best-effort Cloud Scheduler Admin IAM for the deploy service account
# - delete gcOrphanRooms when its scheduler job is missing (forces schedule upsert)
#
# Usage (from repo root, after google-github-actions/auth):
#   FIREBASE_PROJECT_ID=national-bourre-league \
#     GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json \
#     bash scripts/ensure-gc-orphan-scheduler-deploy.sh

set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID required}"
REGION="${GC_ORPHAN_REGION:-us-central1}"
FN="gcOrphanRooms"
JOB="firebase-schedule-${FN}-${REGION}"
CREDS="${GOOGLE_APPLICATION_CREDENTIALS:?GOOGLE_APPLICATION_CREDENTIALS required}"

SA_EMAIL="$(node -p "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).client_email" "$CREDS")"

echo "==> Deploy service account: ${SA_EMAIL}"

echo "==> Attempting Cloud Scheduler Admin IAM grant for ${SA_EMAIL}"
IAM_GRANTED=0
if gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudscheduler.admin" \
  --quiet 2>/dev/null; then
  echo "    Granted roles/cloudscheduler.admin"
  IAM_GRANTED=1
else
  echo "::warning::Could not grant roles/cloudscheduler.admin — project Owner must run: npm run fix:deploy-iam"
fi

echo "==> Checking scheduler job: ${JOB}"
if gcloud scheduler jobs describe "${JOB}" \
  --location="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(state)" 2>/dev/null | grep -q .; then
  echo "    Scheduler job already exists"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "force_gc_orphan_deploy=false" >> "${GITHUB_OUTPUT}"
  fi
  exit 0
fi

if [[ "${IAM_GRANTED}" -ne 1 ]]; then
  echo "::error::Scheduler job ${JOB} is missing and deploy SA lacks roles/cloudscheduler.admin."
  echo "Project Owner must run: npm run fix:deploy-iam"
  echo "Then re-run Deploy to Firebase or Deploy Functions Only on main."
  exit 1
fi

echo "    Scheduler job missing — deleting ${FN} to force fresh deploy with schedule upsert"
if gcloud functions delete "${FN}" \
  --gen2 \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --quiet 2>/dev/null; then
  echo "    Deleted ${FN}"
else
  echo "    ${FN} not found (or delete skipped)"
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "force_gc_orphan_deploy=true" >> "${GITHUB_OUTPUT}"
fi
