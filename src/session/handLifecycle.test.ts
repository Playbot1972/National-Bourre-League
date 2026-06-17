import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextDealerId } from "./logic";
import {
  deriveHandLifecyclePhase,
  formatLifecycleLog,
  handLifecycleWatchdogFired,
  HAND_LIFECYCLE_WATCHDOG_MS,
  nextLifecycleAfterSettle,
  shouldAutoOpenNextHand,
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

  it("requires Go to Table before enrollment after settlement clears the hand", () => {
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

  it("plans handoff until Go to Table after settle when table is closed", () => {
    const t = nextLifecycleAfterSettle({
      enrollmentActive: false,
      handPhase: null,
      participantCount: 0,
      tablePlayOpen: false,
    });
    assert.equal(t.to, "handoffToNextDeal");
    assert.match(formatLifecycleLog(t), /Go to Table/);
  });

  it("auto-opens the next join window when the live table is open after settle", () => {
    assert.equal(
      shouldAutoOpenNextHand({
        sessionStatus: "in_progress",
        enrollmentActive: false,
        handPhase: null,
        participantCount: 0,
        pendingCoWin: false,
        tablePlayOpen: true,
      }),
      true,
    );
    const t = nextLifecycleAfterSettle({
      enrollmentActive: false,
      handPhase: null,
      participantCount: 0,
      tablePlayOpen: true,
    });
    assert.equal(t.to, "opening");
    assert.match(formatLifecycleLog(t), /auto-opening join window on live table/);
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

  it("maps deal and draw phases", () => {
    assert.equal(
      deriveHandLifecyclePhase({ handPhase: "draw", participantCount: 4 }),
      "draw",
    );
    assert.equal(
      deriveHandLifecyclePhase({ handPhase: "play", participantCount: 4, trickCount: 2 }),
      "play",
    );
  });

  it("loops split-pot carry-over into handoff until Go to Table", () => {
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
    const t = nextLifecycleAfterSettle({
      enrollmentActive: false,
      handPhase: null,
      participantCount: 0,
      tablePlayOpen: false,
    });
    assert.equal(t.to, "handoffToNextDeal");
  });

  it("advances dealer each hand in a multi-hand loop", () => {
    const seats = ["p1", "p2", "p3"];
    let dealer: string | null = "p1";
    const phases: string[] = [];
    for (let hand = 0; hand < 3; hand += 1) {
      phases.push(deriveHandLifecyclePhase({ handPhase: "play", participantCount: 3, trickCount: 5, handComplete: true }));
      const afterSettleClosed = nextLifecycleAfterSettle({
        enrollmentActive: false,
        handPhase: null,
        participantCount: 0,
        tablePlayOpen: false,
      });
      assert.equal(afterSettleClosed.to, "handoffToNextDeal");
      const afterSettleLive = nextLifecycleAfterSettle({
        enrollmentActive: false,
        handPhase: null,
        participantCount: 0,
        tablePlayOpen: true,
      });
      assert.equal(afterSettleLive.to, "opening");
      const afterTable = nextLifecycleAfterSettle({
        enrollmentActive: true,
        handPhase: null,
        participantCount: 0,
      });
      assert.equal(afterTable.to, "opening");
      dealer = nextDealerId(seats, dealer);
    }
    assert.deepEqual(phases, ["settle", "settle", "settle"]);
    assert.equal(dealer, "p1");
  });

  it("watchdog fires so animation failure cannot block forever", () => {
    assert.equal(handLifecycleWatchdogFired(HAND_LIFECYCLE_WATCHDOG_MS - 1), false);
    assert.equal(handLifecycleWatchdogFired(HAND_LIFECYCLE_WATCHDOG_MS), true);
  });
});
