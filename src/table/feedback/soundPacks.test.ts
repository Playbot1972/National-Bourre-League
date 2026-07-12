import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_SOUND_ASSET_IDS,
  isAudioContentType,
  resolveSoundAsset,
  resolveSoundAssetsRoot,
  SOUND_ASSET_FILES,
  SOUND_EVENT_TO_ASSET,
  soundAssetUrl,
} from "./soundPacks";

describe("sound asset registry", () => {
  it("lists all 15 classic WAV assets", () => {
    assert.equal(ALL_SOUND_ASSET_IDS.length, 15);
    for (const id of ALL_SOUND_ASSET_IDS) {
      assert.match(SOUND_ASSET_FILES[id], /\.wav$/);
    }
  });

  it("maps card place tiers to normal/soft/heavy", () => {
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 0 }), "card-place-normal");
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 1 }), "card-place-soft");
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 2 }), "card-place-heavy");
  });

  it("maps lead change tiers to light/strong sweeteners", () => {
    assert.equal(resolveSoundAsset("classic", "leadChange", { intensityTier: 0 }), "lead-sweetener-light");
    assert.equal(resolveSoundAsset("classic", "leadChange", { intensityTier: 2 }), "lead-sweetener-strong");
  });

  it("uses big trick win for local player", () => {
    assert.equal(
      resolveSoundAsset("classic", "trickWin", { isLocalPlayer: true }),
      "trick-win-big",
    );
    assert.equal(
      resolveSoundAsset("classic", "trickWin", { volumeScale: 1.08 }),
      "trick-win-big",
    );
    assert.equal(
      resolveSoundAsset("classic", "trickWin", { volumeScale: 1 }),
      "trick-win-normal",
    );
  });

  it("keeps draw procedural-only", () => {
    assert.equal(resolveSoundAsset("classic", "draw"), null);
  });

  it("resolves hosting paths under ./sounds/ in non-browser builds", () => {
    assert.equal(
      soundAssetUrl("classic", "card-place-normal"),
      "./sounds/card-place-normal.wav",
    );
  });

  it("pins sounds root under /social/ even without trailing slash", () => {
    assert.equal(
      resolveSoundAssetsRoot("https://booray.win/social"),
      "https://booray.win/social/sounds/",
    );
    assert.equal(
      resolveSoundAssetsRoot("https://booray.win/social/"),
      "https://booray.win/social/sounds/",
    );
    assert.equal(
      resolveSoundAssetsRoot("https://booray.win/social/index.html"),
      "https://booray.win/social/sounds/",
    );
  });

  it("resolves local docs root for dev static server", () => {
    assert.equal(
      resolveSoundAssetsRoot("http://127.0.0.1:8080/"),
      "http://127.0.0.1:8080/sounds/",
    );
  });

  it("rejects SPA HTML content-types during asset probe", () => {
    assert.equal(isAudioContentType("text/html; charset=utf-8"), false);
    assert.equal(isAudioContentType("audio/wav"), true);
    assert.equal(isAudioContentType("audio/x-wav"), true);
    assert.equal(isAudioContentType(null), false);
  });

  it("documents event-to-asset mapping for QA", () => {
    assert.equal(SOUND_EVENT_TO_ASSET.bigWin, "hand-win-stinger");
    assert.equal(SOUND_EVENT_TO_ASSET.trickCollect, "coin-chime-light");
    assert.equal(SOUND_EVENT_TO_ASSET.cardIllegal, "card-illegal");
    assert.equal(SOUND_EVENT_TO_ASSET.shuffleFinal, "card-shuffle-final");
  });
});
