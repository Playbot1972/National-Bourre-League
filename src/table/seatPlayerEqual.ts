import type { TablePlayer } from "./types";

function cardEqual(
  a: TablePlayer["revealedTrumpUpcard"],
  b: TablePlayer["revealedTrumpUpcard"],
): boolean {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  return a.rank === b.rank && a.suit === b.suit;
}

/** Shallow compare for memoized seat renders — excludes turn countdown (isolated ring). */
export function seatPlayerVisualEqual(a: TablePlayer, b: TablePlayer): boolean {
  return (
    a.playerId === b.playerId &&
    a.displayName === b.displayName &&
    a.photoURL === b.photoURL &&
    a.bankroll === b.bankroll &&
    a.isOut === b.isOut &&
    a.bankrollTick === b.bankrollTick &&
    a.bourreAlert === b.bourreAlert &&
    a.bourrePressure === b.bourrePressure &&
    a.inHand === b.inHand &&
    a.tricksThisHand === b.tricksThisHand &&
    a.isSelf === b.isSelf &&
    a.isDealer === b.isDealer &&
    a.isLeading === b.isLeading &&
    a.isWinner === b.isWinner &&
    a.enrollmentSatOut === b.enrollmentSatOut &&
    a.enrollmentJoined === b.enrollmentJoined &&
    a.canToggleInHand === b.canToggleInHand &&
    a.canPassEnrollment === b.canPassEnrollment &&
    a.decisionPlannedDiscards === b.decisionPlannedDiscards &&
    a.canEditTricks === b.canEditTricks &&
    a.showHoleCards === b.showHoleCards &&
    a.holeCardCount === b.holeCardCount &&
    a.revealedTrumpIndex === b.revealedTrumpIndex &&
    a.seatTrumpMergeActive === b.seatTrumpMergeActive &&
    cardEqual(a.revealedTrumpUpcard, b.revealedTrumpUpcard) &&
    a.isOnTurn === b.isOnTurn &&
    a.isActiveActor === b.isActiveActor &&
    a.isTrickCapture === b.isTrickCapture &&
    a.enrollmentPulse === b.enrollmentPulse &&
    a.drawAnimSubPhase === b.drawAnimSubPhase &&
    a.drawDiscardCount === b.drawDiscardCount &&
    a.drawReplaceCount === b.drawReplaceCount &&
    a.apeScore === b.apeScore &&
    a.apeClass === b.apeClass &&
    a.apeStatus === b.apeStatus &&
    a.sessionStreak === b.sessionStreak &&
    a.dealerMoved === b.dealerMoved &&
    a.trumpMerging === b.trumpMerging &&
    a.winnerFlash === b.winnerFlash
  );
}
