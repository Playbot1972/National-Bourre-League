import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  anteSelectOptionsForDisplay,
  anteValueSelected,
  parseAnteAmount,
  renderAnteSelectOptionsHtml,
  resolveRoomAnteAmount,
  syncAnteSelectToAmount,
} from "../docs/room-ante-state.js";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

describe("room ante state sync", () => {
  it("lists sub-dollar ante options for both mirrored controls", () => {
    const options = anteSelectOptionsForDisplay(1);
    assert.ok(options.some((o) => o.value === 0.01 && o.label === "1¢"));
    assert.ok(options.some((o) => o.value === 0.25 && o.label === "25¢"));
    assert.ok(options.some((o) => o.value === 1 && o.label === "$1"));
  });

  it("resolves pending override ahead of saved room ante", () => {
    assert.equal(resolveRoomAnteAmount(0.25, 1), 0.25);
    assert.equal(resolveRoomAnteAmount(null, 1), 1);
  });

  it("renders cent and dollar labels without parenthetical duplicates", () => {
    const html = renderAnteSelectOptionsHtml(0.25, escapeHtml);
    assert.match(html, /value="0\.25"[^>]*selected/);
    assert.match(html, />25¢</);
    assert.ok(!html.includes("("));
  });

  it("marks $1 selected when current ante is one dollar", () => {
    const html = renderAnteSelectOptionsHtml(1, escapeHtml);
    assert.match(html, /value="1"[^>]*selected/);
    assert.match(html, />\$1</);
  });

  it("matches sub-dollar values with float-safe selection", () => {
    assert.ok(anteValueSelected(0.01, 0.01));
    assert.ok(anteValueSelected("0.25", 0.25));
    assert.ok(!anteValueSelected(1, 0.25));
  });

  it("parses sub-dollar ante amounts without truncating to whole dollars", () => {
    assert.equal(parseAnteAmount("0.01"), 0.01);
    assert.equal(parseAnteAmount("0.25"), 0.25);
    assert.equal(parseAnteAmount("1"), 1);
  });

  it("syncs a select element to a sub-dollar ante without re-render", () => {
    const select = {
      options: [{ value: "0.01" }, { value: "0.25" }, { value: "1" }],
      value: "1",
    };
    syncAnteSelectToAmount(select, 0.25);
    assert.equal(select.value, "0.25");
    syncAnteSelectToAmount(select, 0.01);
    assert.equal(select.value, "0.01");
  });
});
