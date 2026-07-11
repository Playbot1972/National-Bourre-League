import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCardPlayedPayload,
  buildLeadChangePayload,
  buildTrickWonPayload,
  cardAudioDedupeKey,
  deriveIntensityTier,
} from "./audioEvents";
import {
  clearCardAudioDedupe,
  hasCardAudioPlayed,
  markCardAudioPlayed,
} from "./AudioManager";

describe("deriveIntensityTier", () => {
  it("stays subtle for early trick positions", () => {
    assert.equal(deriveIntensityTier(2, 1), 0);
    assert.equal(deriveIntensityTier(4, 2), 0);
  });

  it("escalates slightly for larger tables and later positions", () => {
    assert.equal(deriveIntensityTier(8, 5), 2);
    assert.equal(deriveIntensityTier(6, 3), 1);
  });

  it("caps at tier 2", () => {
    assert.equal(deriveIntensityTier(8, 8), 2);
  });
});

describe("cardAudioDedupeKey", () => {
  it("builds stable keys per trick, card, and event", () => {
    assert.equal(
      cardAudioDedupeKey("card:played", 3, "p1:A-hearts"),
      "card:played:3:p1:A-hearts",
    );
    assert.equal(
      cardAudioDedupeKey("trick:won", 3, "p2:trick:won"),
      "trick:won:3:p2:trick:won",
    );
  });
});

describe("card audio payloads", () => {
  it("card:played carries trick and position context", () => {
    const payload = buildCardPlayedPayload({
      trickId: 2,
      cardId: "p1:K-spades",
      playerId: "p1",
      cardIndex: 1,
      playerCount: 4,
      cardsInTrick: 2,
      takesLead: true,
      isLocalPlayer: false,
    });
    assert.equal(payload.type, "card:played");
    assert.equal(payload.intensityTier, deriveIntensityTier(4, 2));
  });

  it("trick:won reserves highest intensity tier", () => {
    const payload = buildTrickWonPayload({
      trickId: 1,
      winningSeat: "p3",
      playerCount: 6,
      isLocalPlayer: true,
    });
    assert.equal(payload.type, "trick:won");
    assert.equal(payload.intensityTier, 2);
    assert.equal(payload.isLocalPlayer, true);
  });

  it("lead-change only when takesLead is true in builder input", () => {
    const payload = buildLeadChangePayload({
      trickId: 1,
      cardId: "p2:Q-hearts",
      playerId: "p2",
      cardIndex: 2,
      playerCount: 5,
      cardsInTrick: 3,
      takesLead: true,
      isLocalPlayer: true,
    });
    assert.equal(payload.type, "card:lead-change");
    assert.equal(payload.takesLead, true);
  });
});

describe("AudioManager dedupe", () => {
  it("tracks played keys and clears on demand", () => {
    clearCardAudioDedupe();
    const key = cardAudioDedupeKey("card:played", 1, "p1:A-clubs");
    assert.equal(hasCardAudioPlayed(key), false);
    markCardAudioPlayed(key);
    assert.equal(hasCardAudioPlayed(key), true);
    clearCardAudioDedupe();
    assert.equal(hasCardAudioPlayed(key), false);
  });
});
