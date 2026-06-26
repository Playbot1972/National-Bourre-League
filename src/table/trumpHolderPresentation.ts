import type { SerializedCard } from "./types";

export interface TrumpHolderPresentationInput {
  trumpHolderId: string | null;
  trumpUpcard: SerializedCard | null;
  trumpSuit: string | null;
  phase: string | null;
  handPresentation: {
    trumpRevealActive: boolean;
    trumpMergeActive: boolean;
    trumpMergedIntoHand: boolean;
  };
}

export interface TrumpHolderPresentation {
  trumpHolderId: string | null;
  hasTrumpOnTable: boolean;
  hideCenterTrump: boolean;
  showTrumpSuitReminder: boolean;
  showRevealedTrumpAtHolder: boolean;
  trumpMergeActive: boolean;
  trumpMergedIntoHand: boolean;
}

export interface SeatTrumpDisplay {
  revealedTrumpUpcard: SerializedCard | null;
  revealedTrumpIndex: number | null;
  seatTrumpMergeActive: boolean;
}

/** Shared trump reveal/merge timing for hero hand, opponent seats, and pot center. */
export function resolveTrumpHolderPresentation(
  input: TrumpHolderPresentationInput,
): TrumpHolderPresentation {
  const trumpHolderId = input.trumpHolderId;
  const hasTrumpOnTable = Boolean(input.trumpUpcard);
  const { trumpRevealActive, trumpMergeActive, trumpMergedIntoHand } =
    input.handPresentation;

  const holderPresentationActive =
    hasTrumpOnTable &&
    Boolean(trumpHolderId) &&
    (trumpRevealActive || trumpMergeActive);

  return {
    trumpHolderId,
    hasTrumpOnTable,
    hideCenterTrump: holderPresentationActive,
    showRevealedTrumpAtHolder: holderPresentationActive,
    showTrumpSuitReminder:
      trumpMergedIntoHand &&
      Boolean(input.trumpSuit) &&
      !input.trumpUpcard &&
      (input.phase === "decision" ||
        input.phase === "draw" ||
        input.phase === "play"),
    trumpMergeActive,
    trumpMergedIntoHand,
  };
}

/** Last dealt card index in a seat hole fan — dealer trump is the fifth card. */
export function trumpHolderSeatIndex(holeCardCount: number): number | null {
  if (holeCardCount <= 0) return null;
  return holeCardCount - 1;
}

/** Opponent/bot trump holder: face-up trump lives on the seat fan, not in pot center. */
export function resolveSeatTrumpDisplay(
  playerId: string,
  presentation: TrumpHolderPresentation,
  trumpUpcard: SerializedCard | null,
  holeCardCount: number,
  isSelf: boolean,
): SeatTrumpDisplay {
  if (
    isSelf ||
    !presentation.trumpHolderId ||
    playerId !== presentation.trumpHolderId ||
    holeCardCount <= 0
  ) {
    return {
      revealedTrumpUpcard: null,
      revealedTrumpIndex: null,
      seatTrumpMergeActive: false,
    };
  }

  const revealedTrumpIndex = presentation.showRevealedTrumpAtHolder
    ? trumpHolderSeatIndex(holeCardCount)
    : null;

  return {
    revealedTrumpUpcard: presentation.showRevealedTrumpAtHolder ? trumpUpcard : null,
    revealedTrumpIndex,
    seatTrumpMergeActive: presentation.trumpMergeActive,
  };
}
