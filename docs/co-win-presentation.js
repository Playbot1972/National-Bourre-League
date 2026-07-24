/**
 * Co-win settlement presentation — pure view-model helper (no Firestore imports).
 */

export function resolveCoWinPresentation({
  handComplete,
  handReady,
  derivedWinnerIds,
  pendingCoWinSettlement,
  maxWinThisHand,
}) {
  const pendingWinners = pendingCoWinSettlement?.winnerIds;
  const activeWinnerIds =
    handReady && derivedWinnerIds.length > 0
      ? derivedWinnerIds
      : pendingWinners?.length
        ? pendingWinners
        : [];

  const showCoWinSettlement =
    handComplete &&
    ((handReady && derivedWinnerIds.length >= 2) ||
      (pendingCoWinSettlement?.winnerIds?.length >= 2 && activeWinnerIds.length >= 2));
  const coWinnerCount = showCoWinSettlement ? activeWinnerIds.length : 0;
  const splitSharePerWinner =
    coWinnerCount >= 2 ? maxWinThisHand / coWinnerCount : 0;

  return { activeWinnerIds, showCoWinSettlement, splitSharePerWinner };
}
