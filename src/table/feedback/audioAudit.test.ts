import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filenameFromAudioUrl,
  summarizeTableAudioAudit,
  type AudioAuditRecord,
} from "./audioAudit";
import { resolveSoundAsset, SOUND_EVENT_TRIGGER_TYPE } from "./soundPacks";

describe("audioAudit", () => {
  it("extracts filename from resolved asset URL", () => {
    assert.equal(
      filenameFromAudioUrl("https://booray.win/sounds/card-select.wav"),
      "card-select.wav",
    );
    assert.equal(filenameFromAudioUrl("./sounds/trick-win-big.wav"), "trick-win-big.wav");
  });

  it("summarizes audit records by action and result", () => {
    const rows: AudioAuditRecord[] = [
      {
        triggerType: "action",
        action: "card-select",
        event: "cardSelect",
        result: "asset-played",
        filename: "card-select.wav",
        timestamp: 1,
      },
      {
        triggerType: "action",
        action: "card-select",
        event: "cardSelect",
        result: "asset-played",
        filename: "card-select.wav",
        timestamp: 2,
      },
      {
        triggerType: "action",
        action: "draw",
        event: "draw",
        result: "asset-played",
        filename: "draw.wav",
        timestamp: 3,
      },
    ];
    const groups = summarizeTableAudioAudit(rows);
    const select = groups.find((g) => g.event === "cardSelect");
    assert.ok(select);
    assert.equal(select!.count, 2);
    assert.equal(select!.results["asset-played"], 2);
    assert.deepEqual(select!.filenames, ["card-select.wav"]);

    const draw = groups.find((g) => g.event === "draw");
    assert.ok(draw);
    assert.equal(draw!.triggerType, "action");
    assert.equal(draw!.results["asset-played"], 1);
    assert.deepEqual(draw!.filenames, ["draw.wav"]);
  });
});

describe("sound trigger classification", () => {
  it("classifies action-driven events", () => {
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.cardSelect, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.cardIllegal, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.uiButton, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.draw, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.fold, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.gameStart, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.openRoom, "action");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.deleteRoom, "action");
  });

  it("classifies outcome-driven events", () => {
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.potWin, "outcome");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.handWin, "outcome");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.bourre, "outcome");
  });

  it("classifies animation-driven events", () => {
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.shuffle, "animation");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.cardPlace, "animation");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.leadChange, "animation");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.trickWin, "animation");
    assert.equal(SOUND_EVENT_TRIGGER_TYPE.trickCollect, "animation");
  });

  it("maps draw to draw.wav asset", () => {
    assert.equal(resolveSoundAsset("classic", "draw"), "draw");
  });

  it("maps representative animation card place to tiered WAV", () => {
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 2 }), "card-place-heavy");
  });
});
