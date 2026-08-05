import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolveSoundAsset, soundAssetUrl } from "./soundPacks";

describe("last-card trick win audio sequence", () => {
  const serviceSrc = readFileSync(
    fileURLToPath(new URL("./service.ts", import.meta.url)),
    "utf8",
  );
  const useCardAudioSrc = readFileSync(
    fileURLToPath(new URL("../hooks/useCardAudio.ts", import.meta.url)),
    "utf8",
  );

  it("registered keys map to shotgun.mp3 and trick-win-normal.mp3", () => {
    assert.equal(resolveSoundAsset("classic", "lastCardTrickWin"), "shotgun");
    assert.equal(soundAssetUrl("classic", "shotgun"), "/sounds/shotgun.mp3");
    assert.equal(resolveSoundAsset("classic", "trickWin"), "trick-win-normal");
    assert.equal(soundAssetUrl("classic", "trick-win-normal"), "/sounds/trick-win-normal.mp3");
  });

  it("scheduleWinningCardSweetener defers last-card audio to winnerReveal", () => {
    assert.match(serviceSrc, /if \(input\.lastCardTrickWin\) return;/);
    assert.doesNotMatch(
      serviceSrc,
      /if \(input\.lastCardTrickWin\) \{\s*\n\s*playLastCardTrickWinFeedback/s,
    );
  });

  it("playLastCardTrickWinSequenceFeedback chains shotgun then trick-win for local winner", () => {
    assert.match(serviceSrc, /export function playLastCardTrickWinSequenceFeedback/);
    assert.match(serviceSrc, /playLastCardTrickWinFeedback\(\)/);
    assert.match(serviceSrc, /if \(!isLocalPlayer\) return/);
    assert.match(serviceSrc, /playTrickWinFeedback\(\)/);
  });

  it("useCardAudio plays sequence at winnerReveal when last card wins trick", () => {
    assert.match(useCardAudioSrc, /lastCardPlayWinsTrick/);
    assert.match(useCardAudioSrc, /playLastCardTrickWinSequenceFeedback\(isLocalPlayer\)/);
  });
});
