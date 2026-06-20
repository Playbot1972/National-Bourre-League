import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeTableStartup,
  authoritativeCurrentHand,
  shouldClearOrphanLiveEnrollment,
  tableStartupUserMessage,
} from "./tableStartup";

describe("tableStartup", () => {
  it("ignores orphan liveEnrollment deal when currentHand is cleared between hands", () => {
    const session = {
      status: "in_progress",
      handEnrollment: null,
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: { phase: "draw", participantIds: ["a", "b"], tricksByPlayer: {} },
        },
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(shouldClearOrphanLiveEnrollment(session), true);
    assert.equal(authoritativeCurrentHand(session).phase, undefined);
    const analysis = analyzeTableStartup(session, 4);
    assert.equal(analysis.kind, "stale_live_deal");
    assert.equal(analysis.needsEnrollment, true);
    assert.equal(analysis.shouldRepair, true);
  });

  it("resumes mid-hand draw on currentHand without requiring enrollment", () => {
    const session = {
      status: "in_progress",
      currentHand: {
        phase: "draw",
        participantIds: ["a", "b"],
        tricksByPlayer: {},
      },
      liveEnrollment: { active: false },
    };
    const analysis = analyzeTableStartup(session, 2);
    assert.equal(analysis.kind, "ready_mid_hand");
    assert.equal(analysis.canOpenTable, true);
    assert.equal(analysis.needsEnrollment, false);
  });

  it("does not reopen enrollment during Pagat reveal or decision", () => {
    for (const phase of ["reveal", "decision"] as const) {
      const analysis = analyzeTableStartup(
        {
          status: "in_progress",
          currentHand: {
            phase,
            participantIds: ["a", "b"],
            tricksByPlayer: {},
            handDecision: { active: phase === "decision" },
          },
        },
        2,
      );
      assert.equal(analysis.kind, "ready_mid_hand");
      assert.equal(analysis.needsEnrollment, false);
    }
  });

  it("resumes in-progress live deal snapshot when participants remain", () => {
    const session = {
      status: "in_progress",
      currentHand: { tricksByPlayer: {}, participantIds: [] },
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "play",
            participantIds: ["a", "b"],
            tricksByPlayer: { a: 1, b: 0 },
          },
        },
      },
    };
    assert.equal(authoritativeCurrentHand(session).phase, "play");
    const analysis = analyzeTableStartup(session, 2);
    assert.equal(analysis.kind, "ready_mid_hand");
    assert.equal(analysis.needsEnrollment, false);
  });

  it("provides actionable copy for stale deal recovery", () => {
    const analysis = analyzeTableStartup(
      {
        status: "in_progress",
        liveEnrollment: {
          active: false,
          deal: { publicHand: { phase: "play", participantIds: ["a"], tricksByPlayer: { a: 5 } } },
        },
        currentHand: { tricksByPlayer: {}, participantIds: [] },
      },
      2,
    );
    assert.match(tableStartupUserMessage(analysis), /older version|Refresh/i);
  });

  it("blocks finished sessions with clear guidance", () => {
    const analysis = analyzeTableStartup({ status: "final" }, 4);
    assert.equal(analysis.canOpenTable, false);
    assert.match(tableStartupUserMessage(analysis), /finished/i);
  });
});
