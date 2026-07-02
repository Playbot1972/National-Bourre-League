import type { TrickPresentationPhase } from "./trickTiming";

export interface TrickPlayHighlightInput {
  presentationPhase: TrickPresentationPhase;
  leaderPlayerId: string | null;
  winnerPlayerId: string | null;
  playPlayerId: string;
}

export interface TrickPlayHighlightResult {
  /** Green border on current trick leader during live resolution. */
  showLiveLeaderHighlight: boolean;
  /** Green border on resolved trick winner after commit. */
  showResolvedWinnerHighlight: boolean;
  showWinnerCard: boolean;
  showLeadingClass: boolean;
  showWinnerClass: boolean;
  cardState: "winner" | "default";
}

/**
 * Pure winner/leader highlight policy for TrickPlaySlot.
 * Preserve this contract when extending presentation — do not replace with a generic effect.
 */
export function resolveTrickPlayHighlight(
  input: TrickPlayHighlightInput,
): TrickPlayHighlightResult {
  const isLeading =
    input.leaderPlayerId != null && input.playPlayerId === input.leaderPlayerId;
  const isWinner =
    input.winnerPlayerId != null && input.playPlayerId === input.winnerPlayerId;

  const showLiveLeaderHighlight =
    isLeading &&
    (input.presentationPhase === "live" || input.presentationPhase === "trickComplete");

  const showResolvedWinnerHighlight =
    isWinner &&
    input.presentationPhase !== "live" &&
    input.presentationPhase !== "trickComplete";

  const showWinnerCard = showLiveLeaderHighlight || showResolvedWinnerHighlight;

  return {
    showLiveLeaderHighlight,
    showResolvedWinnerHighlight,
    showWinnerCard,
    showLeadingClass: showLiveLeaderHighlight,
    showWinnerClass: showWinnerCard,
    cardState: showWinnerCard ? "winner" : "default",
  };
}
