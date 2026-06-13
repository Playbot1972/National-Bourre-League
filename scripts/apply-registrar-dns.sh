#!/usr/bin/env bash
# Apply Firebase Hosting DNS records at your domain registrar.
#
# Usage:
#   ./scripts/apply-registrar-dns.sh [project-id] [domain] [--provider cloudflare] [--dry-run]
#
# Credentials (pick one provider):
#   cloudflare  CLOUDFLARE_API_TOKEN
#   namecheap   NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_CLIENT_IP
#   porkbun     PORKBUN_API_KEY, PORKBUN_SECRET_API_KEY

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! npx firebase login:list 2>/dev/null | grep -q "Logged in"; then
  echo "Run first: npx firebase login"
  exit 1
fi

node scripts/apply-registrar-dns.cjs "$@"
