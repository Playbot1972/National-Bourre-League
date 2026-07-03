import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTrickPlayHighlight } from "./trickPlayHighlight";
import type { TrickPresentationPhase } from "./trickTiming";

const PHASES: TrickPresentationPhase[] = [
  "live",
  "trickComplete",
  "winnerReveal",
  "collectTrick",
  "nextLeadReady",
];

describe("resolveTrickPlayHighlight", () => {
  const leader = "p-lead";
  const winner = "p-win";
  const other = "p-other";

  it("highlights trick leader in green during live and trickComplete only", () => {
    for (const phase of ["live", "trickComplete"] as const) {
      const lead = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: leader,
        winnerPlayerId: winner,
        playPlayerId: leader,
      });
      assert.equal(lead.showLiveLeaderHighlight, true, phase);
      assert.equal(lead.showWinnerCard, true, phase);
      assert.equal(lead.cardState, "winner", phase);
      assert.equal(lead.showLeadingClass, true, phase);

      const nonLead = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: leader,
        winnerPlayerId: winner,
        playPlayerId: other,
      });
      assert.equal(nonLead.showWinnerCard, false, phase);
      assert.equal(nonLead.cardState, "default", phase);
    }
  });

  it("does not show resolved winner highlight during live or trickComplete", () => {
    for (const phase of ["live", "trickComplete"] as const) {
      const resolved = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: leader,
        winnerPlayerId: winner,
        playPlayerId: winner,
      });
      assert.equal(resolved.showResolvedWinnerHighlight, false, phase);
      if (phase === "trickComplete") {
        assert.equal(resolved.showLiveLeaderHighlight, winner === leader);
      }
    }
  });

  it("highlights resolved winner in green from winnerReveal through nextLeadReady", () => {
    for (const phase of ["winnerReveal", "collectTrick", "nextLeadReady"] as const) {
      const win = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: leader,
        winnerPlayerId: winner,
        playPlayerId: winner,
      });
      assert.equal(win.showResolvedWinnerHighlight, true, phase);
      assert.equal(win.showWinnerCard, true, phase);
      assert.equal(win.showWinnerClass, true, phase);
      assert.equal(win.cardState, "winner", phase);
      assert.equal(win.showLiveLeaderHighlight, false, phase);

      const nonWin = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: leader,
        winnerPlayerId: winner,
        playPlayerId: other,
      });
      assert.equal(nonWin.showWinnerCard, false, phase);
    }
  });

  it("never highlights when leader and winner ids are null", () => {
    for (const phase of PHASES) {
      const result = resolveTrickPlayHighlight({
        presentationPhase: phase,
        leaderPlayerId: null,
        winnerPlayerId: null,
        playPlayerId: leader,
      });
      assert.equal(result.showWinnerCard, false, phase);
      assert.equal(result.cardState, "default", phase);
    }
  });

  it("leader and winner can differ — leader during live, winner after reveal", () => {
    const liveLeader = resolveTrickPlayHighlight({
      presentationPhase: "live",
      leaderPlayerId: leader,
      winnerPlayerId: winner,
      playPlayerId: leader,
    });
    assert.equal(liveLeader.showLiveLeaderHighlight, true);

    const postRevealWinner = resolveTrickPlayHighlight({
      presentationPhase: "winnerReveal",
      leaderPlayerId: leader,
      winnerPlayerId: winner,
      playPlayerId: winner,
    });
    assert.equal(postRevealWinner.showResolvedWinnerHighlight, true);

    const postRevealLeader = resolveTrickPlayHighlight({
      presentationPhase: "winnerReveal",
      leaderPlayerId: leader,
      winnerPlayerId: winner,
      playPlayerId: leader,
    });
    assert.equal(postRevealLeader.showWinnerCard, false);
  });
});
