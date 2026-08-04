import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  incrementWinningCardSequenceCount,
  resetWinningCardSequenceCount,
  resolveWinningCardSweetenerAsset,
  WINNING_CARD_SWEETENER_CYCLE,
} from "./winningCardSweetener";

describe("winningCardSweetener", () => {
  it("cycles indefinitely: bling → light → card-strong → arcade", () => {
    resetWinningCardSequenceCount();
    const expected = [
      "bling",
      "lead-sweetener-light",
      "card-sweetener-strong",
      "arcadecentipede",
      "bling",
      "lead-sweetener-light",
      "card-sweetener-strong",
      "arcadecentipede",
      "bling",
    ];
    for (let count = 1; count <= expected.length; count += 1) {
      assert.equal(
        resolveWinningCardSweetenerAsset(count),
        expected[count - 1],
        `count ${count}`,
      );
    }
  });

  it("uses modulo-4 index from 1-based count", () => {
    for (let count = 1; count <= 12; count += 1) {
      const index = (count - 1) % 4;
      assert.equal(resolveWinningCardSweetenerAsset(count), WINNING_CARD_SWEETENER_CYCLE[index]);
    }
  });

  it("increments per winning card and resets on new hand", () => {
    resetWinningCardSequenceCount();
    assert.equal(incrementWinningCardSequenceCount(), 1);
    assert.equal(incrementWinningCardSequenceCount(), 2);
    resetWinningCardSequenceCount();
    assert.equal(incrementWinningCardSequenceCount(), 1);
  });
});
