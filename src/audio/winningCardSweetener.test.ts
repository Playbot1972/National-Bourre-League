import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  incrementWinningCardSequenceCount,
  resetWinningCardSequenceCount,
  resolveWinningCardSweetenerAsset,
  _setWinningCardSequenceCountForTests,
} from "./winningCardSweetener";

describe("winningCardSweetener", () => {
  it("cycles 1→bling, 2→light, 3→strong, 4→arcade, then repeats", () => {
    resetWinningCardSequenceCount();
    assert.equal(resolveWinningCardSweetenerAsset(1), "bling");
    assert.equal(resolveWinningCardSweetenerAsset(2), "lead-sweetener-light");
    assert.equal(resolveWinningCardSweetenerAsset(3), "lead-sweetener-strong");
    assert.equal(resolveWinningCardSweetenerAsset(4), "arcadecentipede");
    assert.equal(resolveWinningCardSweetenerAsset(5), "bling");
    assert.equal(resolveWinningCardSweetenerAsset(6), "lead-sweetener-light");
  });

  it("increments per winning card and resets on new hand", () => {
    resetWinningCardSequenceCount();
    assert.equal(incrementWinningCardSequenceCount(), 1);
    assert.equal(incrementWinningCardSequenceCount(), 2);
    resetWinningCardSequenceCount();
    assert.equal(incrementWinningCardSequenceCount(), 1);
  });

  it("handles modulo edge for count 0 via formula", () => {
    _setWinningCardSequenceCountForTests(0);
    assert.equal(resolveWinningCardSweetenerAsset(0), "arcadecentipede");
  });
});
