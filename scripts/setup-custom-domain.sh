#!/usr/bin/env bash
# Connect booray.win (steps 1–3): Hosting domain + Auth domains + DNS instructions.
#
# Requires: npx firebase login
#
# Usage:
#   ./scripts/setup-custom-domain.sh [project-id] [domain]

set -euo pipefail

PROJECT_ID="${1:-national-bourre-league}"
DOMAIN="${2:-booray.win}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if ! npx firebase login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Run first: npx firebase login"
  exit 1
fi

node scripts/setup-custom-domain.cjs "${PROJECT_ID}" "${DOMAIN}"
