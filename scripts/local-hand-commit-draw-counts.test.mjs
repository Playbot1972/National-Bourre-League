import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LOCAL_HAND_ACTION,
  applyLocalCommitDrawDiscardCounts,
  createLocalHandCommit,
} from "../docs/local-hand-commit.js";

describe("local-hand-commit draw discard counts", () => {
  it("overlays optimistic discard count for local draw commit", () => {
    const commit = createLocalHandCommit({
      sessionId: "s1",
      handNumber: 2,
      playerId: "p0",
      kind: LOCAL_HAND_ACTION.DRAW,
      discardCount: 4,
    });
    const merged = applyLocalCommitDrawDiscardCounts(commit, { bot_a: 2 }, "p0");
    assert.deepEqual(merged, { bot_a: 2, p0: 4 });
  });
});
