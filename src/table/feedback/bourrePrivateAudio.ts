/** Local-only bourré punishment assets — not table-wide broadcast cues. */
export type BourrePrivatePunishmentAsset = "fahhh" | "fahhhh";

export type BourrePrivateSkipReason =
  | "not-local"
  | "duplicate"
  | "audio-locked"
  | "missing-asset"
  | "sound-off";

let lastBourrePrivateKey: string | null = null;

export function bourrePrivateDedupeKey(sessionId: string, handNumber: number): string {
  return `${sessionId}:${handNumber}:bourre-private`;
}

/** Equal 50/50 pick between fahhh and fahhhh punishment clips. */
export function pickBourrePrivatePunishmentAsset(
  random = Math.random(),
): BourrePrivatePunishmentAsset {
  return random < 0.5 ? "fahhh" : "fahhhh";
}

export function tryConsumeBourrePrivatePunishment(dedupeKey: string): {
  ok: boolean;
  reason?: BourrePrivateSkipReason;
} {
  if (lastBourrePrivateKey === dedupeKey) {
    return { ok: false, reason: "duplicate" };
  }
  lastBourrePrivateKey = dedupeKey;
  return { ok: true };
}

/** @internal test helper */
export function _resetBourrePrivateAudioForTests(): void {
  lastBourrePrivateKey = null;
}
