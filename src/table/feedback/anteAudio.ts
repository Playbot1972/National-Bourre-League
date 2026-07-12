/**
 * Per-player ante chip audio — staggered to match `.bpot__ante-chip` CSS (80ms).
 */

/** Matches `animation-delay: calc(var(--ante-i) * 80ms)` in table.css */
export const ANTE_CHIP_SOUND_STAGGER_MS = 80;

const MAX_ANTE_CHIP_PLAYERS = 8;

let lastAnteSequenceKey: string | null = null;
let pendingAnteTimers: number[] = [];

export function anteAudioDedupeKey(handNumber: number): string {
  return `${handNumber}:ante`;
}

export function clearAnteAudioTimers(): void {
  for (const id of pendingAnteTimers) {
    window.clearTimeout(id);
  }
  pendingAnteTimers = [];
}

/**
 * Schedule one coin chime per player ante. Returns false when this hand's ante
 * sequence was already scheduled (reconnect / re-render guard).
 */
export function scheduleAnteChipSounds(
  handNumber: number,
  playerCount: number,
  playChip: (playerIndex: number) => void,
  options?: { staggerMs?: number },
): boolean {
  const key = anteAudioDedupeKey(handNumber);
  if (lastAnteSequenceKey === key) return false;
  lastAnteSequenceKey = key;

  clearAnteAudioTimers();
  const count = Math.min(Math.max(1, playerCount), MAX_ANTE_CHIP_PLAYERS);
  const staggerMs = options?.staggerMs ?? ANTE_CHIP_SOUND_STAGGER_MS;

  for (let i = 0; i < count; i++) {
    const playerIndex = i;
    const delayMs = playerIndex * staggerMs;
    if (delayMs <= 0) {
      playChip(playerIndex);
      continue;
    }
    pendingAnteTimers.push(
      window.setTimeout(() => {
        playChip(playerIndex);
      }, delayMs),
    );
  }
  return true;
}

/** @internal test helper */
export function _resetAnteAudioForTests(): void {
  lastAnteSequenceKey = null;
  clearAnteAudioTimers();
}
