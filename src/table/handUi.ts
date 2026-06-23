import type { Rank, Suit } from "../types";
import type { SerializedCard } from "./types";

export const HOLE_CARDS_PER_PLAYER = 5;

export function serializedToCard(c: SerializedCard): { rank: Rank; suit: Suit } {
  return { rank: c.rank as Rank, suit: c.suit as Suit };
}

export function formatHandPhase(
  phase: string | null | undefined,
  enrollmentActive: boolean,
): string {
  if (enrollmentActive) return "Choosing";
  switch (phase) {
    case "reveal":
      return "Dealing";
    case "decision":
      return "Choosing";
    case "draw":
      return "Drawing";
    case "play":
      return "Playing";
    default:
      return "Waiting to deal";
  }
}

/** Short cue for the local human when they must act (visual only). */
export function formatLocalActionCue(
  phase: string | null | undefined,
  enrollmentActive: boolean,
): string | null {
  if (enrollmentActive || phase === "decision") {
    return "Tap I'm in or Pass on your seat";
  }
  if (phase === "draw") return "Draw, Stand pat, or I'm Out";
  if (phase === "play") return "Tap a legal card to play";
  return null;
}

export function formatTrumpSuit(suit: string | null | undefined): string {
  const labels: Record<string, string> = {
    spades: "Spades",
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
  };
  return labels[suit ?? ""] ?? suit ?? "—";
}

export function isCardsDealtPhase(phase: string | null | undefined): boolean {
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}

export function isDecisionPhase(phase: string | null | undefined): boolean {
  return phase === "decision";
}

export function isRevealPhase(phase: string | null | undefined): boolean {
  return phase === "reveal";
}

export function turnIndicatorLabel(
  turnPlayerId: string | null | undefined,
  players: Array<{ playerId: string; displayName: string; isSelf?: boolean }>,
): string | null {
  if (!turnPlayerId) return null;
  const p = players.find((x) => x.playerId === turnPlayerId);
  if (!p) return null;
  return p.isSelf ? "Your turn" : `${p.displayName}'s turn`;
}
