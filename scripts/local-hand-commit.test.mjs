import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LOCAL_HAND_ACTION,
  applyLocalCommitToEnrollment,
  applyLocalCommitToPlayerFlags,
  createLocalHandCommit,
  reconcileLocalCommit,
} from "../docs/local-hand-commit.js";

const baseCtx = {
  sessionId: "s1",
  handNumber: 2,
  myUid: "p0",
  enrollment: {
    active: true,
    orderedPlayerIds: ["p0", "p1"],
    currentIndex: 0,
    enrolledIds: [],
    declinedIds: [],
  },
  handPhase: "decision",
  currentHand: { handDecision: { plannedDiscards: {} }, drawCompletedIds: [] },
};

describe("local-hand-commit", () => {
  it("reconciles play commit once server enrolls the player", () => {
    const commit = createLocalHandCommit({
      sessionId: "s1",
      handNumber: 2,
      playerId: "p0",
      kind: LOCAL_HAND_ACTION.DECISION_PLAY,
      discardCount: 2,
    });
    assert.ok(reconcileLocalCommit(commit, baseCtx));
    const absorbed = reconcileLocalCommit(commit, {
      ...baseCtx,
      enrollment: { ...baseCtx.enrollment, enrolledIds: ["p0"] },
      currentHand: { handDecision: { plannedDiscards: { p0: 2 } } },
    });
    assert.equal(absorbed, null);
  });

  it("applies enrollment overlay so CTAs hide immediately", () => {
    const commit = createLocalHandCommit({
      sessionId: "s1",
      handNumber: 2,
      playerId: "p0",
      kind: LOCAL_HAND_ACTION.ENROLL_PLAY,
    });
    const enrollment = applyLocalCommitToEnrollment(commit, baseCtx.enrollment, "p0");
    assert.deepEqual(enrollment.enrolledIds, ["p0"]);
    assert.equal(enrollment.currentIndex, 1);

    const flags = applyLocalCommitToPlayerFlags(
      commit,
      {
        canToggleInHand: true,
        canPassEnrollment: true,
        enrollmentJoined: false,
        inHand: false,
      },
      "p0",
    );
    assert.equal(flags.canToggleInHand, false);
    assert.equal(flags.enrollmentJoined, true);
    assert.equal(flags.inHand, true);
  });

  it("applies pass overlay", () => {
    const commit = createLocalHandCommit({
      sessionId: "s1",
      handNumber: 2,
      playerId: "p0",
      kind: LOCAL_HAND_ACTION.ENROLL_PASS,
    });
    const flags = applyLocalCommitToPlayerFlags(
      commit,
      { canToggleInHand: true, canPassEnrollment: true },
      "p0",
    );
    assert.equal(flags.canToggleInHand, false);
    assert.equal(flags.enrollmentSatOut, true);
  });
});
