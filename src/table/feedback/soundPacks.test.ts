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
  it("lists all 16 classic WAV assets", () => {
    assert.equal(ALL_SOUND_ASSET_IDS.length, 16);
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

  it("resolves draw to draw.wav asset", () => {
    assert.equal(resolveSoundAsset("classic", "draw"), "draw");
    assert.equal(SOUND_ASSET_FILES.draw, "draw.wav");
  });

  it("resolves bourre to Fahhh.wav exactly", () => {
    assert.equal(resolveSoundAsset("classic", "bourre"), "Fahhh");
    assert.equal(SOUND_ASSET_FILES.Fahhh, "Fahhh.wav");
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
    assert.equal(
      resolveSoundAssetsRoot("http://127.0.0.1:8080/e2e-fixtures/table-audio"),
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
    assert.equal(SOUND_EVENT_TO_ASSET.potWin, "hand-win-stinger");
    assert.equal(SOUND_EVENT_TO_ASSET.handWin, "coin-chime-light");
    assert.equal(SOUND_EVENT_TO_ASSET.trickCollect, "coin-chime-light");
    assert.equal(SOUND_EVENT_TO_ASSET.cardIllegal, "card-illegal");
    assert.equal(SOUND_EVENT_TO_ASSET.shuffleFinal, "card-shuffle-final");
    assert.equal(SOUND_EVENT_TO_ASSET.openRoom, "card-shuffle-final");
    assert.equal(SOUND_EVENT_TO_ASSET.fold, "card-place-heavy");
    assert.equal(SOUND_EVENT_TO_ASSET.gameStart, "card-shuffle-normal");
    assert.equal(SOUND_EVENT_TO_ASSET.deleteRoom, "card-illegal");
    assert.equal(SOUND_EVENT_TO_ASSET.bourre, "Fahhh");
  });

  it("resolves intended single-asset events to exact filenames", () => {
    const singles: Array<[Parameters<typeof resolveSoundAsset>[1], string]> = [
      ["cardSelect", "card-select.wav"],
      ["cardIllegal", "card-illegal.wav"],
      ["draw", "draw.wav"],
      ["uiButton", "ui-button-press.wav"],
      ["fold", "card-place-heavy.wav"],
      ["gameStart", "card-shuffle-normal.wav"],
      ["openRoom", "card-shuffle-final.wav"],
      ["deleteRoom", "card-illegal.wav"],
      ["shuffle", "card-shuffle-normal.wav"],
      ["shuffleFinal", "card-shuffle-final.wav"],
      ["trickCollect", "coin-chime-light.wav"],
      ["handWin", "coin-chime-light.wav"],
      ["potWin", "hand-win-stinger.wav"],
      ["bourre", "Fahhh.wav"],
    ];
    for (const [event, expectedFile] of singles) {
      const assetId = resolveSoundAsset("classic", event, {});
      assert.ok(assetId, `missing asset for ${event}`);
      assert.equal(SOUND_ASSET_FILES[assetId!], expectedFile, event);
    }
  });
});
