import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HAND_FLOW_PHASE,
  HAND_FLOW_TRANSITIONS,
  buildHandFlowSnapshot,
  canSubmitHandAction,
  deriveHandFlowPhase,
  isHandFlowTransitionAllowed,
  nextHandFlowPhase,
  resolveBotAdvanceHint,
  resolveBotAdvanceEmptyReason,
  resolveHandFlowTurnPlayerId,
  type HandFlowPhase,
} from "./handPhaseMachine";

describe("handPhaseMachine — deriveHandFlowPhase", () => {
  it("maps cleared session to waiting before first hand", () => {
    assert.equal(
      deriveHandFlowPhase({
        handPhase: null,
        participantIds: [],
        handCount: 0,
        clearedHand: true,
      }),
      HAND_FLOW_PHASE.WAITING,
    );
  });

  it("maps post-settle cleared hand to next-hand-prep", () => {
    assert.equal(
      deriveHandFlowPhase({
        handPhase: null,
        participantIds: [],
        handCount: 3,
        clearedHand: true,
        enrollmentActive: false,
      }),
      HAND_FLOW_PHASE.NEXT_HAND_PREP,
    );
  });

  it("maps active enrollment to enrollment phase", () => {
    assert.equal(
      deriveHandFlowPhase({
        enrollmentActive: true,
        handPhase: null,
        participantIds: [],
      }),
      HAND_FLOW_PHASE.ENROLLMENT,
    );
  });

  it("maps reveal to deal", () => {
    assert.equal(
      deriveHandFlowPhase({ handPhase: "reveal", participantIds: ["p1", "p2"] }),
      HAND_FLOW_PHASE.DEAL,
    );
  });

  it("maps draw to draw", () => {
    assert.equal(
      deriveHandFlowPhase({ handPhase: "draw", participantIds: ["p1", "p2"] }),
      HAND_FLOW_PHASE.DRAW,
    );
  });

  it("maps incomplete play to play", () => {
    assert.equal(
      deriveHandFlowPhase({
        handPhase: "play",
        participantIds: ["p1", "p2"],
        trickCount: 3,
        handComplete: false,
      }),
      HAND_FLOW_PHASE.PLAY,
    );
  });

  it("maps completed play to settle", () => {
    assert.equal(
      deriveHandFlowPhase({
        handPhase: "play",
        participantIds: ["p1", "p2"],
        trickCount: 5,
        handComplete: true,
      }),
      HAND_FLOW_PHASE.SETTLE,
    );
  });

  it("maps pending co-win to settle", () => {
    assert.equal(
      deriveHandFlowPhase({
        pendingCoWin: true,
        handPhase: "play",
        participantIds: ["p1", "p2"],
      }),
      HAND_FLOW_PHASE.SETTLE,
    );
  });
});

describe("handPhaseMachine — transition table", () => {
  it("allows enrollment → deal on enrollment_complete", () => {
    assert.equal(
      isHandFlowTransitionAllowed(HAND_FLOW_PHASE.ENROLLMENT, "enrollment_complete"),
      true,
    );
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.ENROLLMENT, "enrollment_complete"),
      HAND_FLOW_PHASE.DEAL,
    );
  });

  it("allows deal → draw on advance_reveal", () => {
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.DEAL, "advance_reveal"),
      HAND_FLOW_PHASE.DRAW,
    );
  });

  it("allows draw → play on draw_complete", () => {
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.DRAW, "draw_complete"),
      HAND_FLOW_PHASE.PLAY,
    );
  });

  it("allows play → settle on hand_complete", () => {
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.PLAY, "hand_complete"),
      HAND_FLOW_PHASE.SETTLE,
    );
  });

  it("allows settle → next-hand-prep on record_hand", () => {
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.SETTLE, "record_hand"),
      HAND_FLOW_PHASE.NEXT_HAND_PREP,
    );
  });

  it("rejects invalid transitions", () => {
    assert.equal(isHandFlowTransitionAllowed(HAND_FLOW_PHASE.WAITING, "play_card"), false);
    assert.equal(isHandFlowTransitionAllowed(HAND_FLOW_PHASE.PLAY, "open_enrollment"), false);
    assert.equal(isHandFlowTransitionAllowed(HAND_FLOW_PHASE.DEAL, "hand_complete"), false);
    assert.equal(nextHandFlowPhase(HAND_FLOW_PHASE.DRAW, "record_hand"), null);
  });

  it("rejects duplicate transition attempts (already past target phase)", () => {
    // Already in play — cannot re-apply draw_complete
    assert.equal(
      isHandFlowTransitionAllowed(HAND_FLOW_PHASE.PLAY, "draw_complete"),
      false,
    );
    // Already in settle — cannot re-apply hand_complete
    assert.equal(
      isHandFlowTransitionAllowed(HAND_FLOW_PHASE.SETTLE, "hand_complete"),
      false,
    );
    // Already in deal — cannot re-open enrollment without going through prep
    assert.equal(
      isHandFlowTransitionAllowed(HAND_FLOW_PHASE.DEAL, "open_enrollment"),
      false,
    );
    // Duplicate record_hand from next-hand-prep is not in the table
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.NEXT_HAND_PREP, "record_hand"),
      null,
    );
  });

  it("allows self-loop transitions only where explicitly defined", () => {
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.ENROLLMENT, "enrollment_step"),
      HAND_FLOW_PHASE.ENROLLMENT,
    );
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.DRAW, "submit_draw"),
      HAND_FLOW_PHASE.DRAW,
    );
    assert.equal(
      nextHandFlowPhase(HAND_FLOW_PHASE.PLAY, "play_card"),
      HAND_FLOW_PHASE.PLAY,
    );
    // play_card does not loop from draw
    assert.equal(nextHandFlowPhase(HAND_FLOW_PHASE.DRAW, "play_card"), null);
  });

  it("every transition row resolves via lookup", () => {
    for (const row of HAND_FLOW_TRANSITIONS) {
      assert.equal(
        nextHandFlowPhase(row.from, row.event),
        row.to,
        `${row.from} + ${row.event}`,
      );
    }
  });
});

describe("handPhaseMachine — turn and action guards", () => {
  const playSnapshot = {
    phase: HAND_FLOW_PHASE.PLAY,
    handPhase: "play",
    enrollmentActive: false,
    pagatDecisionActive: false,
    participantIds: ["human", "bot_1"],
    turnPlayerId: "human",
    handComplete: false,
    pendingCoWin: false,
    trickCount: 2,
  };

  it("resolveHandFlowTurnPlayerId returns turnPlayerId during play", () => {
    assert.equal(
      resolveHandFlowTurnPlayerId({
        phase: HAND_FLOW_PHASE.PLAY,
        handPhase: "play",
        hand: { turnPlayerId: "p2", participantIds: ["p1", "p2"] },
        enrollment: null,
        pagatDecisionActive: false,
        legacyEnrollmentActive: false,
      }),
      "p2",
    );
  });

  it("allows play_card on turn for owner", () => {
    const result = canSubmitHandAction({
      snapshot: playSnapshot,
      action: "play_card",
      playerId: "human",
      actorId: "human",
    });
    assert.equal(result.ok, true);
  });

  it("blocks play_card when not on turn", () => {
    const result = canSubmitHandAction({
      snapshot: { ...playSnapshot, turnPlayerId: "bot_1" },
      action: "play_card",
      playerId: "human",
      actorId: "human",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "not_your_turn");
  });

  it("allows bot actor to submit for bot seat", () => {
    const result = canSubmitHandAction({
      snapshot: { ...playSnapshot, turnPlayerId: "bot_1" },
      action: "play_card",
      playerId: "bot_1",
      actorId: "human",
    });
    assert.equal(result.ok, true);
  });

  it("blocks draw when already completed for player", () => {
    const result = canSubmitHandAction({
      snapshot: {
        ...playSnapshot,
        phase: HAND_FLOW_PHASE.DRAW,
        handPhase: "draw",
        turnPlayerId: "human",
      },
      action: "submit_draw",
      playerId: "human",
      actorId: "human",
      drawCompletedIds: ["human"],
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "draw_already_complete");
  });

  it("blocks play_card when hand already complete", () => {
    const result = canSubmitHandAction({
      snapshot: { ...playSnapshot, handComplete: true, trickCount: 5 },
      action: "play_card",
      playerId: "human",
      actorId: "human",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "hand_complete");
  });

  it("blocks record_hand before hand is ready to settle", () => {
    const result = canSubmitHandAction({
      snapshot: playSnapshot,
      action: "record_hand",
      playerId: "human",
      actorId: "human",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "hand_not_ready_to_settle");
  });

  it("allows record_hand in settle phase", () => {
    const result = canSubmitHandAction({
      snapshot: {
        ...playSnapshot,
        phase: HAND_FLOW_PHASE.SETTLE,
        handComplete: true,
        trickCount: 5,
      },
      action: "record_hand",
      playerId: "human",
      actorId: "human",
    });
    assert.equal(result.ok, true);
  });
});

describe("handPhaseMachine — bot advance", () => {
  it("hints enrollment bot join before deadline", () => {
    const session = {
      handEnrollment: {
        active: true,
        orderedPlayerIds: ["bot_1", "p2"],
        currentIndex: 0,
        turnDeadlineMs: Date.now() + 60_000,
        enrolledIds: [],
        declinedIds: [],
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    const snap = buildHandFlowSnapshot({ session });
    const hint = resolveBotAdvanceHint({
      snapshot: snap,
      session,
      nowMs: Date.now(),
    });
    assert.equal(hint?.kind, "enrollment");
    assert.equal(hint?.turnPlayerId, "bot_1");
  });

  it("hints enrollment timeout after deadline", () => {
    const session = {
      handEnrollment: {
        active: true,
        orderedPlayerIds: ["p1", "p2"],
        currentIndex: 0,
        turnDeadlineMs: Date.now() - 1,
        enrolledIds: [],
        declinedIds: [],
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    const snap = buildHandFlowSnapshot({ session });
    const hint = resolveBotAdvanceHint({
      snapshot: snap,
      session,
      nowMs: Date.now(),
    });
    assert.equal(hint?.kind, "enrollment_timeout");
  });

  it("hints draw bot when on turn", () => {
    const session = {
      currentHand: {
        phase: "draw",
        participantIds: ["bot_1", "p2"],
        turnPlayerId: "bot_1",
        drawCompletedIds: [],
        tricksByPlayer: { bot_1: 0, p2: 0 },
      },
    };
    const snap = buildHandFlowSnapshot({ session });
    const hint = resolveBotAdvanceHint({
      snapshot: snap,
      session,
      nowMs: Date.now(),
    });
    assert.equal(hint?.kind, "draw");
    assert.equal(hint?.turnPlayerId, "bot_1");
  });

  it("hints advance_reveal during deal (card phase reveal)", () => {
    const session = {
      currentHand: {
        phase: "reveal",
        participantIds: ["bot_1", "p2"],
        turnPlayerId: "bot_1",
        tricksByPlayer: { bot_1: 0, p2: 0 },
        trumpSuit: "hearts",
      },
    };
    const snap = buildHandFlowSnapshot({ session });
    const hint = resolveBotAdvanceHint({
      snapshot: snap,
      session,
      nowMs: Date.now(),
    });
    assert.equal(hint?.kind, "advance_reveal");
    assert.equal(hint?.turnPlayerId, "bot_1");
  });

  it("after reveal hint, draw bot is eligible when on turn", () => {
    const revealSession = {
      currentHand: {
        phase: "reveal",
        participantIds: ["bot_uxdncok6", "p2"],
        turnPlayerId: "bot_uxdncok6",
        tricksByPlayer: { bot_uxdncok6: 0, p2: 0 },
        trumpUpcard: true,
        trumpSuit: "hearts",
      },
    };
    const revealSnap = buildHandFlowSnapshot({ session: revealSession });
    assert.equal(
      resolveBotAdvanceHint({
        snapshot: revealSnap,
        session: revealSession,
        nowMs: Date.now(),
      })?.kind,
      "advance_reveal",
    );

    const drawSession = {
      currentHand: {
        phase: "draw",
        participantIds: ["bot_uxdncok6", "p2"],
        turnPlayerId: "bot_uxdncok6",
        drawCompletedIds: [],
        tricksByPlayer: { bot_uxdncok6: 0, p2: 0 },
      },
    };
    const drawSnap = buildHandFlowSnapshot({ session: drawSession });
    const drawHint = resolveBotAdvanceHint({
      snapshot: drawSnap,
      session: drawSession,
      nowMs: Date.now(),
    });
    assert.equal(drawHint?.kind, "draw");
    assert.equal(drawHint?.turnPlayerId, "bot_uxdncok6");
  });

  it("reports structured empty reason for human draw turn", () => {
    const session = {
      currentHand: {
        phase: "draw",
        participantIds: ["bot_1", "human"],
        turnPlayerId: "human",
        drawCompletedIds: [],
        tricksByPlayer: { bot_1: 0, human: 0 },
      },
    };
    const snap = buildHandFlowSnapshot({ session });
    assert.equal(
      resolveBotAdvanceEmptyReason({ snapshot: snap, session, nowMs: Date.now() }),
      "draw_human_turn",
    );
    assert.equal(
      resolveBotAdvanceHint({ snapshot: snap, session, nowMs: Date.now() }),
      null,
    );
  });
});

describe("handPhaseMachine — expected path waiting → next hand", () => {
  const path: Array<{ event: Parameters<typeof nextHandFlowPhase>[1]; to: HandFlowPhase }> = [
    { event: "open_enrollment", to: HAND_FLOW_PHASE.ENROLLMENT },
    { event: "enrollment_complete", to: HAND_FLOW_PHASE.DEAL },
    { event: "advance_reveal", to: HAND_FLOW_PHASE.DRAW },
    { event: "draw_complete", to: HAND_FLOW_PHASE.PLAY },
    { event: "hand_complete", to: HAND_FLOW_PHASE.SETTLE },
    { event: "record_hand", to: HAND_FLOW_PHASE.NEXT_HAND_PREP },
    { event: "open_enrollment", to: HAND_FLOW_PHASE.ENROLLMENT },
  ];

  it("walks the happy-path transition chain", () => {
    let phase: HandFlowPhase = HAND_FLOW_PHASE.WAITING;
    for (const step of path) {
      const next = nextHandFlowPhase(phase, step.event);
      assert.equal(next, step.to, `from ${phase} on ${step.event}`);
      phase = next!;
    }
  });
});
