/**
 * Pure table presentation helpers — map session/hand state to view data.
 * No Firestore writes, timers, or orchestration.
 */

import {
  deserializeCards,
  effectivePlayerHand,
  serializeCards,
  getLegalPlayIndices,
  buildPlayValidationState,
} from "./game-engine.js";
import {
  deriveWinnersFromTricks,
  isHandComplete,
  tricksForPlayer,
  getSessionCurrentHand,
} from "./firestore.js";

export function cardKeyFromSerialized(card) {
  if (!card?.rank || !card?.suit) return null;
  return `${card.rank}-${card.suit}`;
}

/** Snapshot for sound/haptic diffing (feedback-only). */
export function buildTableFeedbackSnapshot(sessionObj, { myUid, privateHandCards = [] }) {
  const currentHand = getSessionCurrentHand(sessionObj) ?? {};
  const participantIds = currentHand.participantIds ?? [];
  const tricks = currentHand.tricksByPlayer ?? {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricks, participantIds);
  const handComplete = isHandComplete(tricks, participantIds);
  return {
    sessionId: sessionObj?.id ?? null,
    phase: currentHand.phase ?? null,
    trumpKey: cardKeyFromSerialized(currentHand.trumpUpcard),
    drawCompletedIds: [...(currentHand.drawCompletedIds ?? [])],
    myTricks: myUid ? tricksForPlayer(tricks, myUid) : 0,
    handComplete,
    myIsWinner: myUid != null && handComplete && ready && winnerIds.includes(myUid),
    heroCardKeys: (privateHandCards ?? [])
      .map(cardKeyFromSerialized)
      .filter(Boolean)
      .sort()
      .join(","),
  };
}

export function buildHeroCardsForTable(currentHand, privateCardList, playerId, handPhase) {
  const privateCards = privateCardList ?? [];
  if ((handPhase !== "draw" && handPhase !== "play") || !currentHand || !playerId) {
    return privateCards;
  }
  const effective = effectivePlayerHand(
    playerId,
    deserializeCards(privateCards),
    currentHand,
  );
  return serializeCards(effective);
}

export function computeLegalPlayIndices(currentHand, heroCards, playerId) {
  if (!currentHand || currentHand.phase !== "play" || !heroCards?.length || !playerId) {
    return null;
  }
  const privateHand = deserializeCards(heroCards);
  const hand = effectivePlayerHand(playerId, privateHand, currentHand);
  const ctx = buildPlayValidationState({ hand, publicHand: currentHand });
  return getLegalPlayIndices(ctx, {
    dealerSeat: currentHand.dealerId ?? null,
    leaderSeat: currentHand.currentTrick?.leadPlayerId ?? null,
    currentTurnSeat: currentHand.turnPlayerId ?? null,
    trickIndex: currentHand.currentTrick?.trickNumber ?? 0,
  });
}
