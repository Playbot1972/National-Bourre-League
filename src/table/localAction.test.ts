import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isLocalActionRequiredNow, isHeroDrawOrPlayTurn, localActionActivityKey } from "./localAction";
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
