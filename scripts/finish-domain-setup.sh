#!/usr/bin/env bash
# Fetch DNS records from Firebase + set Auth authorized domains.
# Run after booray.win is registered in Hosting (even if setup:domain timed out).
#
# Usage:
#   ./scripts/finish-domain-setup.sh [project-id] [domain]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if ! npx firebase login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Run first: npx firebase login"
  exit 1
fi

node scripts/finish-domain-setup.cjs "${PROJECT_ID}" "${DOMAIN}"
