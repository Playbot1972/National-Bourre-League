import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  _resetAudioUnlockStateForTests,
  ensureAudioUnlockedSync,
  isAudioUnlocked,
} from "./audio";
import { drawCountAssetUrl, resolveDrawCountAsset } from "./soundPacks";

describe("draw first-click audio unlock", () => {
  it("ensureAudioUnlockedSync marks audio unlocked synchronously", () => {
    _resetAudioUnlockStateForTests();
    assert.equal(isAudioUnlocked(), false);
    const ok = ensureAudioUnlockedSync("test-gesture");
    assert.equal(ok, true);
    assert.equal(isAudioUnlocked(), true);
  });

  it("draw confirm sequence unlocks before resolving draw asset", () => {
    _resetAudioUnlockStateForTests();
    assert.equal(isAudioUnlocked(), false);

    ensureAudioUnlockedSync("draw-button");
    const cardCount = 3;
    const assetId = resolveDrawCountAsset(cardCount);
    const url = drawCountAssetUrl(cardCount);

    assert.equal(isAudioUnlocked(), true);
    assert.equal(assetId, "draw3");
    assert.equal(url, "/sounds/draw3.mp3");
  });
});
