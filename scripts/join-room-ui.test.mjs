import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { isJoinModeActive, JOIN_MODE_MIN_CODE_LENGTH } from "../docs/join-room-ui.js";

describe("join-room-ui", () => {
  it("isJoinModeActive is false for empty or whitespace-only input", () => {
    assert.equal(isJoinModeActive(""), false);
    assert.equal(isJoinModeActive("   "), false);
    assert.equal(isJoinModeActive(null), false);
    assert.equal(isJoinModeActive(undefined), false);
  });

  it("isJoinModeActive is false for partial codes under minimum length", () => {
    assert.equal(isJoinModeActive("A"), false);
    assert.equal(isJoinModeActive(" ABC"), false);
    assert.equal(isJoinModeActive("ABC-D"), false);
  });

  it("isJoinModeActive is true for full invite codes", () => {
    assert.equal(isJoinModeActive("ABC-D23"), true);
    assert.equal(isJoinModeActive("  abc-d23 "), true);
  });

  it("isJoinModeActive is true when normalized length reaches minimum", () => {
    const partial = "A".repeat(JOIN_MODE_MIN_CODE_LENGTH);
    assert.equal(isJoinModeActive(partial), true);
  });
});

describe("Play Now client wiring", () => {
  it("uses waitUntilStable and triggerSessionPlay retry", () => {
    const src = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
    assert.match(src, /waitUntilStable/);
    assert.match(src, /SESSION_PLAY_RETRY_ATTEMPTS/);
    assert.match(src, /seedOpenScoresFromSession/);
    assert.match(src, /assertPublicMatchmakingQueueMode/);
  });

  it("skips score-driven member sync and merges scores on snapshot", () => {
    const src = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
    assert.match(src, /mergeOpenScoresFromSnapshot/);
    assert.doesNotMatch(
      src,
      /openScores = scores;\s*\n\s*const sessionObj = currentSessions\.find/,
    );
    assert.match(src, /scheduleRenderRoomDetail\(\{ scoresOnly: true \}\)/);
    assert.match(src, /patchGameSetupRoster/);
  });
});
