import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { isJoinModeActive, JOIN_MODE_CLASS } from "../docs/join-room-ui.js";

describe("join-room-ui", () => {
  it("isJoinModeActive is false for empty input", () => {
    assert.equal(isJoinModeActive(""), false);
    assert.equal(isJoinModeActive(null), false);
    assert.equal(isJoinModeActive(undefined), false);
  });

  it("isJoinModeActive is true for any non-empty input", () => {
    assert.equal(isJoinModeActive("A"), true);
    assert.equal(isJoinModeActive(" ABC"), true);
    assert.equal(isJoinModeActive("ABC-D23"), true);
  });

  it("JOIN_MODE_CLASS is stable for CSS hook", () => {
    assert.equal(JOIN_MODE_CLASS, "room-actions--join-mode");
  });
});

describe("Join Room home UI markup", () => {
  const indexHtml = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");

  it("join submit starts as default btn (primary applied in join mode via JS)", () => {
    const joinIdx = indexHtml.indexOf('data-testid="join-code-submit"');
    assert.ok(joinIdx >= 0);
    const snippet = indexHtml.slice(Math.max(0, joinIdx - 80), joinIdx + 40);
    assert.match(snippet, /class="btn"/);
    assert.doesNotMatch(snippet, /btn--primary/);
  });

  it("room-actions wrapper exists for join-mode class toggle", () => {
    assert.match(indexHtml, /class="room-actions"/);
    assert.match(indexHtml, /id="join-form"/);
  });
});
