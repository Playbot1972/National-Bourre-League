import type { TrickPresentation } from "./hooks/useTrickPresentation";

export type TrickPresentationSnapshot = TrickPresentation;

let snapshot: TrickPresentationSnapshot | null = null;
const listeners = new Set<() => void>();

function playsSignature(plays: TrickPresentationSnapshot["displayPlays"]): string {
  return plays.map((p) => `${p.playerId}:${p.card.rank}:${p.card.suit}`).join("|");
}

function tricksSignature(tricks: Record<string, number>): string {
  return Object.entries(tricks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, n]) => `${id}:${n}`)
    .join("|");
}

/** Avoid notifying subscribers when nothing material changed. */
export function trickPresentationChanged(
  prev: TrickPresentationSnapshot | null,
  next: TrickPresentationSnapshot,
): boolean {
  if (!prev) return true;
  return (
    prev.phase !== next.phase ||
    prev.revealedCount !== next.revealedCount ||
    prev.revealTarget !== next.revealTarget ||
    prev.peakPlayCount !== next.peakPlayCount ||
    prev.winnerPlayerId !== next.winnerPlayerId ||
    prev.showWinnerTag !== next.showWinnerTag ||
    prev.trickWinnerSeatId !== next.trickWinnerSeatId ||
    prev.suppressTurnPlayerId !== next.suppressTurnPlayerId ||
    prev.isPipelineActive !== next.isPipelineActive ||
    prev.isResolving !== next.isResolving ||
    prev.showFinalTrickEcho !== next.showFinalTrickEcho ||
    prev.trickEchoWinnerId !== next.trickEchoWinnerId ||
    prev.trickEchoPhase !== next.trickEchoPhase ||
    playsSignature(prev.displayPlays) !== playsSignature(next.displayPlays) ||
    playsSignature(prev.trickEchoPlays) !== playsSignature(next.trickEchoPlays) ||
    tricksSignature(prev.displayTricksByPlayer) !== tricksSignature(next.displayTricksByPlayer) ||
    prev.frozenTrick?.trickNumber !== next.frozenTrick?.trickNumber ||
    prev.frozenTrick?.winnerId !== next.frozenTrick?.winnerId ||
    (prev.frozenTrick?.plays.length ?? 0) !== (next.frozenTrick?.plays.length ?? 0)
  );
}

export function publishTrickPresentation(next: TrickPresentationSnapshot): void {
  if (snapshot && !trickPresentationChanged(snapshot, next)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function subscribeTrickPresentation(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTrickPresentationSnapshot(): TrickPresentationSnapshot | null {
  return snapshot;
}

export function disposeTrickPresentationStore(): void {
  snapshot = null;
  listeners.forEach((listener) => listener());
}
