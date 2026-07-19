import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isLocalActionRequiredNow, isHeroDrawOrPlayTurn, localActionActivityKey, resolveSuppressTurnForBot, resolveSuppressTurnForHero } from "./localAction";
import { handPresentingBlocksBots } from "./trickAnimationBridge";
import type { TablePlayer } from "./types";

const self: TablePlayer = {
  playerId: "me",
  displayName: "Me",
  handsWon: 0,
  inHand: true,
  tricksThisHand: 0,
  isSelf: true,
  isDealer: false,
  isWinner: false,
  canToggleInHand: false,
  canEditTricks: false,
};

describe("isLocalActionRequiredNow", () => {
  it("requires action during enrollment when local seat is on the clock", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: true,
        selfPlayer: { ...self, canToggleInHand: true },
        session: { phase: null },
        suppressTurn: false,
        handComplete: false,
      }),
      true,
    );
  });

  it("requires action during draw when it is the local draw turn", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "draw",
          turnPlayerId: "me",
          drawCompletedIds: [],
          participantIds: ["me", "p2"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      true,
    );
  });

  it("does not require action after local draw is declared", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: { ...self, actionDeclared: true },
        session: {
          phase: "draw",
          turnPlayerId: "me",
          drawCompletedIds: [],
          participantIds: ["me", "p2"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      false,
    );
  });

  it("does not require action after local draw is complete", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "draw",
          turnPlayerId: "me",
          drawCompletedIds: ["me"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      false,
    );
  });

  it("isHeroDrawOrPlayTurn is false when draw already completed even if turn id matches", () => {
    assert.equal(
      isHeroDrawOrPlayTurn({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "draw",
          turnPlayerId: "me",
          drawCompletedIds: ["me"],
          participantIds: ["me", "p2"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      false,
    );
  });

  it("isHeroDrawOrPlayTurn is false when it is not the local draw turn", () => {
    assert.equal(
      isHeroDrawOrPlayTurn({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "draw",
          turnPlayerId: "p2",
          drawCompletedIds: [],
          participantIds: ["me", "p2"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      false,
    );
  });

  it("requires action during play on local trick turn", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: { phase: "play", turnPlayerId: "me", participantIds: ["me", "p2"] },
        suppressTurn: false,
        handComplete: false,
      }),
      true,
    );
  });

  it("ignores broke/out local players between hands", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: true,
        selfPlayer: { ...self, isOut: true, canToggleInHand: true },
        session: { phase: null, participantIds: [] },
        suppressTurn: false,
        handComplete: false,
      }),
      false,
    );
  });

  it("still requires action when marked out but locked in live hand", () => {
    assert.equal(
      isLocalActionRequiredNow({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: { ...self, isOut: true },
        session: {
          phase: "play",
          turnPlayerId: "me",
          participantIds: ["me", "p2"],
        },
        suppressTurn: false,
        handComplete: false,
      }),
      true,
    );
  });

  it("allows hero play turn when presentation suppress is active", () => {
    const input = {
      currentUserId: "me",
      enrollmentActive: false,
      selfPlayer: self,
      session: {
        phase: "play" as const,
        turnPlayerId: "me",
        participantIds: ["me", "p2"],
      },
      suppressTurn: true,
      handComplete: false,
    };
    assert.equal(resolveSuppressTurnForHero(input), false);
    assert.equal(isHeroDrawOrPlayTurn(input), true);
    assert.equal(isLocalActionRequiredNow(input), true);
  });

  it("keeps bot play ring actor visible when server turn is bot during presentation lag", () => {
    assert.equal(
      resolveSuppressTurnForBot({
        suppressTurn: true,
        session: { phase: "play", turnPlayerId: "bot_1" },
      }),
      false,
    );
    assert.equal(
      resolveSuppressTurnForBot({
        suppressTurn: true,
        session: { phase: "play", turnPlayerId: "p2" },
      }),
      true,
    );
    assert.equal(
      resolveSuppressTurnForBot({
        suppressTurn: true,
        session: { phase: "draw", turnPlayerId: "bot_1" },
      }),
      true,
    );
  });

  it("still suppresses hero draw during presentation animations", () => {
    const input = {
      currentUserId: "me",
      enrollmentActive: false,
      selfPlayer: self,
      session: {
        phase: "draw" as const,
        turnPlayerId: "me",
        drawCompletedIds: [] as string[],
        participantIds: ["me", "p2"],
      },
      suppressTurn: true,
      handComplete: false,
    };
    assert.equal(resolveSuppressTurnForHero(input), true);
    assert.equal(isHeroDrawOrPlayTurn(input), false);
  });

  it("does not enable hero play when presentation suppress is active but turn belongs to opponent", () => {
    assert.equal(
      isHeroDrawOrPlayTurn({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "play",
          turnPlayerId: "p2",
          participantIds: ["me", "p2"],
        },
        suppressTurn: true,
        handComplete: false,
      }),
      false,
    );
  });

  it("hero play turn does not wait on bot presentation gate", () => {
    assert.equal(handPresentingBlocksBots(true, "trumpReveal", "play"), false);
    assert.equal(
      isHeroDrawOrPlayTurn({
        currentUserId: "me",
        enrollmentActive: false,
        selfPlayer: self,
        session: {
          phase: "play",
          turnPlayerId: "me",
          participantIds: ["me", "p2"],
        },
        suppressTurn: true,
        handComplete: false,
      }),
      true,
    );
  });
});

describe("localActionActivityKey", () => {
  it("changes when enrollment index advances", () => {
    const base = {
      currentUserId: "me",
      enrollmentActive: true,
      selfPlayer: { ...self, canToggleInHand: true },
      session: {
        phase: null,
        handEnrollment: { active: true, currentIndex: 0, turnDeadlineMs: 1000 },
      },
      suppressTurn: false,
      handComplete: false,
    };
    const a = localActionActivityKey(base);
    const b = localActionActivityKey({
      ...base,
      session: {
        ...base.session,
        handEnrollment: { active: true, currentIndex: 1, turnDeadlineMs: 2000 },
      },
    });
    assert.notEqual(a, b);
  });
});
