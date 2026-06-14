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
  if (enrollmentActive) return "Join window";
  switch (phase) {
    case "draw":
      return "Draw round";
    case "play":
      return "Trick play";
    default:
      return "Waiting to deal";
  }
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
  return phase === "draw" || phase === "play";
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
