import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveHandLifecyclePhase,
  formatLifecycleLog,
  nextLifecycleAfterSettle,
  shouldOpenEnrollmentAfterSettle,
} from "./handLifecycle";

describe("handLifecycle", () => {
  it("maps enrollment to opening", () => {
    assert.equal(
      deriveHandLifecyclePhase({ enrollmentActive: true, handPhase: null, participantCount: 0 }),
      "opening",
    );
  });

  it("maps completed play hand to settle", () => {
    assert.equal(
      deriveHandLifecyclePhase({
        handPhase: "play",
        handComplete: true,
        participantCount: 4,
        trickCount: 5,
      }),
      "settle",
    );
  });

  it("requires enrollment after settlement clears the hand", () => {
    assert.equal(
      shouldOpenEnrollmentAfterSettle({
        sessionStatus: "in_progress",
        enrollmentActive: false,
        handPhase: null,
        participantCount: 0,
        pendingCoWin: false,
      }),
      true,
    );
  });

  it("does not open enrollment while co-win vote pending", () => {
    assert.equal(
      shouldOpenEnrollmentAfterSettle({
        enrollmentActive: false,
        handPhase: "play",
        participantCount: 4,
        pendingCoWin: true,
      }),
      false,
    );
  });

  it("plans opening transition after settle", () => {
    const t = nextLifecycleAfterSettle({
      enrollmentActive: false,
      handPhase: null,
      participantCount: 0,
    });
    assert.equal(t.to, "opening");
    assert.match(formatLifecycleLog(t), /opening enrollment/);
  });

  it("blocks handoff when stale participants remain", () => {
    const t = nextLifecycleAfterSettle({
      enrollmentActive: false,
      handPhase: null,
      participantCount: 2,
    });
    assert.equal(t.to, "handoffToNextDeal");
    assert.equal(t.blockedBy, "stale_participants_in_hand");
  });
});
