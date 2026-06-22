import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dealInitialHand } from "./deal";
import { revealToDraw } from "./draw";
import { botDrawDiscardIndices } from "./play";
import { maxDrawDiscards } from "./drawLimit";
import { effectivePlayerHand } from "./invariants";
import { serializePagatRevealHand } from "./serialize";
import { shuffledDeckFromSeed, remainingDeckCount } from "./deckState";
import { applyPlayerDraw, advanceAfterDraw } from "./draw";
import { playerOrderFromDealer } from "./playerOrder";

describe("8-seat draw round deck remainder", () => {
  const ids = Array.from({ length: 8 }, (_, i) => `p${i + 1}`);

  it("caps bot discards when the stub deck cannot replace all seats at max draw", () => {
    const deal = dealInitialHand({
      dealerId: ids[0],
      participantIds: ids,
      sortedPlayerIds: ids,
      seed: 42,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: ids[0],
      actionOrder: deal.dealOrder,
      seatedIds: ids,
    });
    const drawHand = revealToDraw(bundle.publicHand, null);
    const deck = shuffledDeckFromSeed(deal.deckSeed);
    let deckNextIndex = drawHand.deckNextIndex ?? deal.deckNextIndex;
    const order = playerOrderFromDealer(drawHand.dealerId, drawHand.participantIds);
    const maxDraw = maxDrawDiscards(ids.length);

    for (const playerId of order) {
      const remaining = remainingDeckCount(deck, deckNextIndex);
      const privateHand = deal.privateHands[playerId];
      const effective = effectivePlayerHand(playerId, privateHand, drawHand);
      const indices = botDrawDiscardIndices(effective, drawHand.trumpSuit, maxDraw, remaining);
      assert.ok(indices.length <= remaining, `player ${playerId} drew more than deck allows`);
      const result = applyPlayerDraw({
        playerId,
        privateHand,
        publicHand: drawHand,
        discardIndices: indices,
        deck,
        deckNextIndex,
        maxDiscards: maxDraw,
      });
      deckNextIndex = result.deckNextIndex;
      const next = advanceAfterDraw(result.publicHand, order, playerId);
      Object.assign(drawHand, next);
    }
  });
});
