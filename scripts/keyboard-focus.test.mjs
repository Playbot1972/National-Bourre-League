import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  blurActiveTextEntry,
  describeActiveElement,
  isTextEntryElement,
  shouldRestoreRoomDetailFocus,
} from "../docs/keyboard-focus.js";

describe("keyboard-focus", () => {
  it("isTextEntryElement detects text fields only", () => {
    assert.equal(isTextEntryElement({ tagName: "TEXTAREA" }), true);
    assert.equal(isTextEntryElement({ tagName: "INPUT", type: "text" }), true);
    assert.equal(isTextEntryElement({ tagName: "INPUT", type: "checkbox" }), false);
    assert.equal(isTextEntryElement({ tagName: "BUTTON" }), false);
  });

  it("blurActiveTextEntry blurs focused text inputs", () => {
    let blurred = false;
    const input = {
      tagName: "INPUT",
      type: "text",
      id: "add-player-name",
      blur() {
        blurred = true;
      },
    };
    const root = { activeElement: input };
    assert.equal(blurActiveTextEntry(root), "add-player-name");
    assert.equal(blurred, true);
    root.activeElement = { tagName: "BODY" };
    assert.equal(blurActiveTextEntry(root), null);
  });

  it("shouldRestoreRoomDetailFocus is false while table overlay is open", () => {
    assert.equal(shouldRestoreRoomDetailFocus(false), true);
    assert.equal(shouldRestoreRoomDetailFocus(true), false);
  });

  it("describeActiveElement labels text-entry fields", () => {
    assert.deepEqual(
      describeActiveElement({ tagName: "TEXTAREA", id: "session-notes" }),
      { tag: "textarea", id: "session-notes", type: undefined, textEntry: true },
    );
  });
});

describe("app.js table focus wiring", () => {
  const src = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");

  it("openTablePlay blurs text focus before showing overlay", () => {
    const idx = src.indexOf("async function openTablePlay()");
    assert.ok(idx >= 0);
    const body = src.slice(idx, idx + 900);
    assert.ok(body.includes("blurActiveTextEntry(document)"));
    assert.ok(body.includes("tablePlayOpen = true"));
    assert.ok(body.indexOf("blurActiveTextEntry(document)") < body.indexOf("tablePlayOpen = true"));
  });

  it("renderRoomDetail skips focus restore while table is open", () => {
    assert.ok(src.includes("shouldRestoreRoomDetailFocus(tablePlayOpen)"));
  });
});
