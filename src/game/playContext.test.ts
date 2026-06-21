import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPlayValidationState,
  canPlayCard,
  normalizeTrickForPlay,
} from "./playContext";
import type { Card } from "../types";
import type { PublicHandState } from "./types";
import { HAND_PHASE } from "./types";

const c = (rank: string, suit: string): Card => ({ rank, suit }) as Card;

function baseHand(overrides: Partial<PublicHandState> = {}): PublicHandState {
  return {
    phase: HAND_PHASE.PLAY,
    participantIds: ["p1", "p2"],
    dealerId: "p1",
    trumpHolderId: "p1",
    trumpSuit: "hearts",
    trumpUpcard: null,
    remainingDeckCount: 10,
    currentTrick: {
      trickNumber: 2,
      leadPlayerId: "p2",
      leadSuit: "clubs",
      plays: [],
    },
    leadSuit: "clubs",
    playedCards: [],
    turnPlayerId: "p2",
    tricksByPlayer: { p1: 1, p2: 0 },
    deckSeed: 1,
    deckNextIndex: 20,
    actionOrder: ["p2", "p3", "p1"],
    drawCompletedIds: ["p1", "p2"],
    maxDrawDiscards: 4,
    ...overrides,
  };
}

describe("playContext", () => {
  it("ignores stale leadSuit when trick plays are empty", () => {
    const normalized = normalizeTrickForPlay(baseHand());
    assert.equal(normalized.trickPlays.length, 0);
    assert.equal(normalized.isLeading, true);
    assert.equal(normalized.leadSuit, null);
  });

  it("allows trump lead on empty trick even with stale session leadSuit", () => {
    const hand = [c("K", "hearts"), c("2", "clubs")];
    const state = buildPlayValidationState({
      hand,
      publicHand: baseHand(),
    });
    const result = canPlayCard(state, 0);
    assert.equal(result.allowed, true);
  });

  it("enforces follow suit after a lead exists", () => {
    const hand = [c("2", "clubs"), c("K", "hearts")];
    const state = buildPlayValidationState({
      hand,
      publicHand: baseHand({
        currentTrick: {
          trickNumber: 1,
          leadPlayerId: "p2",
          leadSuit: "clubs",
          plays: [{ playerId: "p2", card: { rank: "5", suit: "clubs" } }],
        },
        leadSuit: "clubs",
      }),
    });
    assert.equal(canPlayCard(state, 0).allowed, true);
    assert.equal(canPlayCard(state, 1).allowed, false);
  });

  it("resets lead context between tricks via empty plays", () => {
    const afterTrick = normalizeTrickForPlay(
      baseHand({
        leadSuit: "diamonds",
        currentTrick: {
          trickNumber: 3,
          leadPlayerId: "p1",
          leadSuit: null,
          plays: [],
        },
      }),
    );
    assert.equal(afterTrick.isLeading, true);
    assert.equal(afterTrick.leadSuit, null);
  });
});
