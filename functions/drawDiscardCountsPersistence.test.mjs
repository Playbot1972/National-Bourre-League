/**
 * Regression: drawDiscardCountsByPlayer on currentHand after server draw mutations.
 * Mirrors runSubmitDrawTransaction / applyDrawFold in gameHandlers.js (no Firestore).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dealInitialHand,
  serializeHandState,
  revealToDraw,
  applyPlayerDraw,
  advanceAfterDraw,
  applyDrawFold,
  resolveActionOrder,
  maxDrawDiscards,
  deserializeCards,
  serializeCards,
  shuffledDeckFromSeed,
  HAND_PHASE,
} from "./vendor/game-engine.js";

function buildDrawPhase({ playerIds, seed = 424242 }) {
  const dealerId = playerIds[0];
  const deal = dealInitialHand({
    dealerId,
    participantIds: playerIds,
    sortedPlayerIds: playerIds,
    seed,
  });
  const bundle = serializeHandState(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    maxDrawDiscards: maxDrawDiscards(playerIds.length),
  });
  const publicHand = revealToDraw(bundle.publicHand, null);
  const privateHands = Object.fromEntries(
    Object.entries(deal.privateHands).map(([id, cards]) => [id, serializeCards(cards)]),
  );
  return { publicHand, privateHands, sortedPlayerIds: playerIds };
}

/** Same mutation chain as runSubmitDrawTransaction in gameHandlers.js */
function serverSubmitDrawMutation({
  currentHand,
  privateHandSerialized,
  playerId,
  discardIndices,
  sortedPlayerIds,
}) {
  const hand = deserializeCards(privateHandSerialized);
  const deck = shuffledDeckFromSeed(currentHand.deckSeed);
  const maxDraw =
    currentHand.maxDrawDiscards ?? maxDrawDiscards(currentHand.participantIds?.length ?? 2);
  const drawResult = applyPlayerDraw({
    playerId,
    privateHand: hand,
    publicHand: currentHand,
    discardIndices: discardIndices ?? [],
    deck,
    maxDiscards: maxDraw,
  });
  return advanceAfterDraw(
    drawResult.publicHand,
    resolveActionOrder(currentHand, sortedPlayerIds),
    playerId,
    drawResult.discarded,
  );
}

describe("drawDiscardCountsByPlayer — server currentHand persistence pipeline", () => {
  it("human draw persists exact discard count on currentHand", () => {
    const human = "human_a";
    const bot = "bot_draw_1";
    const { publicHand, privateHands, sortedPlayerIds } = buildDrawPhase({
      playerIds: [human, bot],
    });
    const nextPublic = serverSubmitDrawMutation({
      currentHand: publicHand,
      privateHandSerialized: privateHands[human],
      playerId: human,
      discardIndices: [0, 1],
      sortedPlayerIds,
    });
    assert.equal(nextPublic.drawDiscardCountsByPlayer?.[human], 2);
    assert.equal(nextPublic.phase, HAND_PHASE.DRAW);
  });

  it("bot draw persists exact discard count on currentHand", () => {
    const human = "human_a";
    const bot = "bot_draw_2";
    const { publicHand, privateHands, sortedPlayerIds } = buildDrawPhase({
      playerIds: [human, bot],
      seed: 515151,
    });
    const afterHuman = serverSubmitDrawMutation({
      currentHand: publicHand,
      privateHandSerialized: privateHands[human],
      playerId: human,
      discardIndices: [],
      sortedPlayerIds,
    });
    const nextPublic = serverSubmitDrawMutation({
      currentHand: afterHuman,
      privateHandSerialized: privateHands[bot],
      playerId: bot,
      discardIndices: [0, 1, 2],
      sortedPlayerIds,
    });
    assert.equal(nextPublic.drawDiscardCountsByPlayer?.[bot], 3);
    assert.equal(nextPublic.drawDiscardCountsByPlayer?.[human], 0);
  });

  it("stand pat (N=0) persists zero on currentHand", () => {
    const human = "human_a";
    const bot = "bot_draw_3";
    const { publicHand, privateHands, sortedPlayerIds } = buildDrawPhase({
      playerIds: [human, bot],
      seed: 616161,
    });
    const nextPublic = serverSubmitDrawMutation({
      currentHand: publicHand,
      privateHandSerialized: privateHands[human],
      playerId: human,
      discardIndices: [],
      sortedPlayerIds,
    });
    assert.equal(nextPublic.drawDiscardCountsByPlayer?.[human], 0);
  });

  it("fold during draw persists zero on currentHand", () => {
    const human = "human_a";
    const bot1 = "bot_draw_4";
    const bot2 = "bot_draw_5";
    const { publicHand, sortedPlayerIds } = buildDrawPhase({
      playerIds: [human, bot1, bot2],
      seed: 717171,
    });
    const foldResult = applyDrawFold(
      publicHand,
      resolveActionOrder(publicHand, sortedPlayerIds),
      human,
    );
    assert.equal(foldResult.kind, "continue");
    assert.equal(foldResult.publicHand.drawDiscardCountsByPlayer?.[human], 0);
  });
});
