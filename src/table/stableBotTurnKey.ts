/** Stable bot play turn identity — avoids trickNumber 0 flicker when currentTrick is briefly null. */

export interface BotTurnIdentity {
  handNumber: number;
  trickNumber: number;
  turnPlayerId: string;
}

export function stablePlayTrickNumber(
  phase: string | null | undefined,
  handNumber: number,
  currentTrickNumber: number | null | undefined,
  lastTrickRef: { current: number },
  lastHandRef: { current: number },
): number {
  if (handNumber !== lastHandRef.current) {
    lastHandRef.current = handNumber;
    lastTrickRef.current = 0;
  }
  if (phase !== "play") {
    lastTrickRef.current = 0;
    return 0;
  }
  if (currentTrickNumber != null && currentTrickNumber > 0) {
    lastTrickRef.current = currentTrickNumber;
  }
  return lastTrickRef.current;
}

/** True only on a real turn exit — not a transient currentTrick null flicker. */
export function isDurableBotTurnExit(
  prev: BotTurnIdentity | null,
  next: BotTurnIdentity | null,
): boolean {
  if (!prev || !next) return false;
  if (prev.handNumber !== next.handNumber) return true;
  if (prev.turnPlayerId !== next.turnPlayerId) return true;
  if (next.trickNumber > 0 && prev.trickNumber > 0 && prev.trickNumber !== next.trickNumber) {
    return true;
  }
  return false;
}

export function parseBotPlayTurnKey(turnKey: string): BotTurnIdentity | null {
  const [hand, trick, player] = turnKey.split(":");
  if (!player) return null;
  return {
    handNumber: Number(hand) || 0,
    trickNumber: Number(trick) || 0,
    turnPlayerId: player,
  };
}

/** Same live bot turn when trick number flickers (0 vs N) on the same hand/player. */
export function isSameDurableBotPlayTurn(prevKey: string | null, nextKey: string | null): boolean {
  if (!prevKey || !nextKey) return false;
  if (prevKey === nextKey) return true;
  const prev = parseBotPlayTurnKey(prevKey);
  const next = parseBotPlayTurnKey(nextKey);
  if (!prev || !next) return false;
  if (prev.handNumber !== next.handNumber || prev.turnPlayerId !== next.turnPlayerId) return false;
  if (prev.trickNumber === next.trickNumber) return true;
  if (prev.trickNumber === 0 || next.trickNumber === 0) return true;
  return false;
}
