#!/usr/bin/env bash
# Run from anywhere:  ~/National-Bourre-League/dev.sh
# Starts Firebase emulators + social app (http://localhost:8080).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
exec npm run dev:local
