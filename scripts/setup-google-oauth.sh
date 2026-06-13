#!/usr/bin/env bash
# Fix Google sign-in redirect_uri_mismatch (Firebase Option A + OAuth client URIs).
#
# Usage:
#   ./scripts/setup-google-oauth.sh [project-id] [domain] [--open]
#
# Requires: npx firebase login

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! npx firebase login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Run first: npx firebase login"
  exit 1
fi

node scripts/setup-google-oauth.cjs "$@"
