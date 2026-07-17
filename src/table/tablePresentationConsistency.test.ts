import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveHandPlayCardInteraction } from "../components/handPlayInteraction";
import { resolveTableActiveActorId } from "./turnCountdown";
import { turnIndicatorLabel } from "./handUi";
import { trickSlotAwaitingFly } from "./trickPlaySlotFlyState";
import { isHeroDrawOrPlayTurn, resolveSuppressTurnForHero } from "./localAction";

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

  it("hero play turn stays interactive when trick presentation still suppresses turn UI", () => {
    const session = {
      phase: "play" as const,
      turnPlayerId: "p0",
      participantIds: ["p0", "p5"],
      tricksByPlayer: {},
      handNumber: 1,
    };
    const heroInput = {
      currentUserId: "p0",
      enrollmentActive: false,
      selfPlayer: {
        playerId: "p0",
        displayName: "Hero",
        handsWon: 0,
        inHand: true,
        tricksThisHand: 0,
        isSelf: true,
        isDealer: false,
        isWinner: false,
        canToggleInHand: false,
        canEditTricks: false,
      },
      session,
      suppressTurn: true,
      handComplete: false,
    };
    const effectiveSuppress = resolveSuppressTurnForHero(heroInput);
    const activeActorId = resolveTableActiveActorId({
      session,
      suppressTurn: effectiveSuppress,
      handComplete: false,
    });
    assert.equal(effectiveSuppress, false);
    assert.equal(activeActorId, "p0");
    assert.equal(isHeroDrawOrPlayTurn(heroInput), true);
    const playCard = resolveHandPlayCardInteraction({
      isPlayMode: true,
      isMyTurn: true,
      legalPlay: true,
      busy: false,
      allowPlayPreselect: true,
      showPlayableHint: true,
      cardState: "default",
      index: 0,
    });
    assert.equal(playCard.playInteractive, true);
  });
});
