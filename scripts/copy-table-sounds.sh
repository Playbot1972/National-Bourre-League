#!/usr/bin/env bash
# Copy the 16 table WAV assets from a local folder (default: ~/Downloads) into public/sounds/.
set -euo pipefail

SRC="${1:-$HOME/Downloads}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/sounds"

FILES=(
  card-place-normal.wav
  card-place-heavy.wav
  card-place-soft.wav
  lead-sweetener-light.wav
  lead-sweetener-strong.wav
  trick-win-normal.wav
  trick-win-big.wav
  hand-win-stinger.wav
  card-shuffle-normal.wav
  card-shuffle-final.wav
  card-select.wav
  card-illegal.wav
  ui-button-press.wav
  coin-chime-light.wav
  draw.wav
  Fahhh.wav
)

mkdir -p "$DEST"
missing=0
for f in "${FILES[@]}"; do
  if [[ -f "$SRC/$f" ]]; then
    cp -f "$SRC/$f" "$DEST/$f"
    echo "copied $f"
  else
    echo "missing: $SRC/$f" >&2
    missing=$((missing + 1))
  fi
done

if [[ "$missing" -gt 0 ]]; then
  echo "$missing file(s) not found in $SRC" >&2
  exit 1
fi

echo "All 16 sounds installed to $DEST"
