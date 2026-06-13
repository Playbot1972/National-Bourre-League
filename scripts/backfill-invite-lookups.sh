#!/usr/bin/env bash
# Backfill inviteLookups for rooms created before the join fix.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! npx firebase login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Run first: npx firebase login"
  exit 1
fi
node scripts/backfill-invite-lookups.cjs "$@"
