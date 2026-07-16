import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTableActiveActorId } from "./turnCountdown";
import { turnIndicatorLabel } from "./handUi";
import { trickSlotAwaitingFly } from "./trickPlaySlotFlyState";

describe("table presentation consistency", () => {
  it("turn label uses the same active actor as the countdown ring", () => {
    const players = [
      { playerId: "p0", displayName: "Hero", isSelf: true },
      { playerId: "p5", displayName: "Seat Five", isSelf: false },
    ];
    const activeActorId = resolveTableActiveActorId({
      session: {
        phase: "play",
        turnPlayerId: "p5",
        participantIds: ["p0", "p5"],
        tricksByPlayer: {},
        handNumber: 1,
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(activeActorId, "p5");
    assert.equal(turnIndicatorLabel(activeActorId, players), "Seat Five's turn");
  });

  it("enrollment actor resolves for turn label", () => {
    const players = [{ playerId: "p5", displayName: "Bot Five", isSelf: false }];
    const activeActorId = resolveTableActiveActorId({
      session: {
        phase: null,
        turnPlayerId: null,
        participantIds: [],
        tricksByPlayer: {},
        handNumber: 1,
        handEnrollment: {
          active: true,
          orderedPlayerIds: ["p0", "p5"],
          currentIndex: 1,
          turnDeadlineMs: Date.now() + 10_000,
        },
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(activeActorId, "p5");
    assert.equal(turnIndicatorLabel(activeActorId, players), "Bot Five's turn");
  });

  it("hero trick slot primes before travel (no pop-in)", () => {
    assert.equal(
      trickSlotAwaitingFly({ isLivePhase: true, hasLanded: false, flyMode: "pending" }),
      true,
    );
    assert.equal(
      trickSlotAwaitingFly({ isLivePhase: true, hasLanded: false, flyMode: "travel" }),
      false,
    );
  });
});
