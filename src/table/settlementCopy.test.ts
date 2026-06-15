import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bourrePlayerIds,
  buildCoWinSettlementView,
  buildHandOutcomeView,
  formatHandHistoryPublicLine,
  formatVoteRecordedMessage,
} from "./settlementCopy";

const players = [
  { playerId: "p1", displayName: "Alice" },
  { playerId: "p2", displayName: "Bob" },
  { playerId: "p3", displayName: "Carol" },
];

describe("settlement copy — co-win vote panel", () => {
  it("buildCoWinSettlementView names tie, winners, bourré, pot, and carry rules", () => {
    const view = buildCoWinSettlementView({
      tricksByPlayer: { p1: 3, p2: 3, p3: 0 },
      participantIds: ["p1", "p2", "p3"],
      players,
      pot: {
        currentPot: 12,
        maxWinThisHand: 10,
        carryIn: 4,
        limEnabled: false,
        overflow: 0,
      },
      splitSharePerWinner: 5,
      currentUserId: "p1",
      winnerIds: ["p1", "p2"],
      maxTricks: 3,
    });

    assert.match(view.headline, /Tie — Alice & Bob \(3 tricks each\)/);
    assert.match(view.subhead, /Co-winners must vote/);
    assert.deepEqual(view.winnerLines, ["Alice — 3 tricks", "Bob — 3 tricks"]);
    assert.match(view.bourreLine!, /Bourré: Carol took 0 tricks/);
    assert.match(view.potLine, /\$12.*max win \$10.*\$4 carried in/);
    assert.match(view.splitPreviewLine!, /\$10 → \$5 each/);
    assert.match(view.carryoverIfPushLine, /carries to the next hand/);
    assert.match(view.carryoverIfSplitLine!, /no carryover/);
    assert.equal(view.voteLines.length, 2);
    assert.match(view.voterHint!, /cast your vote/);
    assert.equal(view.observerHint, null);
  });

  it("shows observer hint for non co-winners", () => {
    const view = buildCoWinSettlementView({
      tricksByPlayer: { p1: 2, p2: 2, p3: 1 },
      participantIds: ["p1", "p2", "p3"],
      players,
      pot: {
        currentPot: 6,
        maxWinThisHand: 6,
        carryIn: 0,
        limEnabled: false,
        overflow: 0,
      },
      splitSharePerWinner: 3,
      currentUserId: "p3",
      winnerIds: ["p1", "p2"],
    });

    assert.match(view.observerHint!, /not a co-winner/);
    assert.equal(view.voterHint, null);
    assert.equal(view.bourreLine, null);
  });

  it("reflects pending votes in vote lines", () => {
    const view = buildCoWinSettlementView({
      tricksByPlayer: { p1: 2, p2: 2 },
      participantIds: ["p1", "p2"],
      players: players.slice(0, 2),
      pot: {
        currentPot: 4,
        maxWinThisHand: 4,
        carryIn: 0,
        limEnabled: false,
        overflow: 0,
      },
      pendingVotes: { p1: "split", p2: "push" },
      splitSharePerWinner: 2,
      currentUserId: "p1",
      winnerIds: ["p1", "p2"],
    });

    assert.match(view.voteLines[0], /Alice: Agreed to split/);
    assert.match(view.voteLines[1], /Bob: Declined split/);
  });
});

describe("settlement copy — hand outcomes", () => {
  it("buildHandOutcomeView for single winner with bourré", () => {
    const view = buildHandOutcomeView({
      settlement: "win",
      winnerIds: ["p1"],
      participantIds: ["p1", "p2", "p3"],
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      players,
      potMaxWin: 9,
      carryOverPot: 0,
    });

    assert.match(view.headline, /Alice wins \$9/);
    assert.match(view.detailLines[0], /Alice wins the pot/);
    assert.match(view.detailLines[1], /Bourré: Carol/);
  });

  it("buildHandOutcomeView for split agreement", () => {
    const view = buildHandOutcomeView({
      settlement: "split",
      winnerIds: ["p1", "p2"],
      participantIds: ["p1", "p2", "p3"],
      tricksByPlayer: { p1: 2, p2: 2, p3: 1 },
      players,
      potMaxWin: 8,
      carryOverPot: 0,
    });

    assert.match(view.headline, /Pot split — Alice & Bob/);
    assert.match(view.detailLines[0], /\$4 each/);
    assert.equal(view.carryoverLine, null);
  });

  it("buildHandOutcomeView for push with carryover", () => {
    const view = buildHandOutcomeView({
      settlement: "non_winner_ante_up",
      winnerIds: ["p1", "p2"],
      participantIds: ["p1", "p2", "p3"],
      tricksByPlayer: { p1: 2, p2: 2, p3: 1 },
      players,
      potMaxWin: 10,
      carryOverPot: 10,
    });

    assert.match(view.headline, /No split agreement — pot pushed/);
    assert.match(view.detailLines[1], /carries to the next hand/);
    assert.match(view.carryoverLine!, /Next hand starts with \$10/);
  });
});

describe("settlement copy — vote feedback and history", () => {
  it("formatVoteRecordedMessage covers pending and settled paths", () => {
    assert.match(
      formatVoteRecordedMessage("split", { status: "pending" }),
      /agreed to split/,
    );
    assert.match(
      formatVoteRecordedMessage("push", { status: "pending" }),
      /waiting for other co-winner/,
    );
    assert.match(
      formatVoteRecordedMessage("split", { status: "done", settlement: "split" }),
      /pot split evenly/,
    );
    assert.match(
      formatVoteRecordedMessage("push", { status: "done", settlement: "non_winner_ante_up" }),
      /carries to the next hand/,
    );
  });

  it("formatHandHistoryPublicLine uses outcome headline", () => {
    const line = formatHandHistoryPublicLine({
      handNumber: 4,
      settlement: "split",
      winnerIds: ["p1", "p2"],
      participantIds: ["p1", "p2", "p3"],
      tricksByPlayer: { p1: 2, p2: 2, p3: 1 },
      players,
      potMaxWin: 8,
      cappedPot: 8,
    });
    assert.match(line, /^#4 Pot split — Alice & Bob/);
    assert.match(line, /3 players$/);
  });

  it("bourrePlayerIds finds zero-trick participants", () => {
    assert.deepEqual(
      bourrePlayerIds({ p1: 3, p2: 2, p3: 0 }, ["p1", "p2", "p3"]),
      ["p3"],
    );
  });
});
