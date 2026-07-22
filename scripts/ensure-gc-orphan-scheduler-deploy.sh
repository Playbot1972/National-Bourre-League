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
IAM_OK=0
if gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudscheduler.admin" \
  --quiet 2>/dev/null; then
  echo "    Granted roles/cloudscheduler.admin"
  IAM_OK=1
else
  echo "::warning::Could not grant roles/cloudscheduler.admin — checking whether role is already bound"
  if gcloud projects get-iam-policy "${PROJECT_ID}" \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SA_EMAIL}" \
    --format="value(bindings.role)" 2>/dev/null | grep -qx 'roles/cloudscheduler.admin'; then
    echo "    roles/cloudscheduler.admin already present on ${SA_EMAIL}"
    IAM_OK=1
  fi
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

if [[ "${IAM_OK}" -ne 1 ]]; then
  echo "::warning::Scheduler job ${JOB} is missing and cloudscheduler.admin is not confirmed."
  echo "Proceeding with gcOrphanRooms recovery deploy — deploy will fail if owner IAM is still missing."
  echo "Project Owner can fix with: npm run fix:deploy-iam"
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
