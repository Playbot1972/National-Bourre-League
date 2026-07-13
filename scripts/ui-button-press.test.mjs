import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveUiButtonPressTarget } from "../docs/ui-button-press.js";

function mockEl(tagName, className = "", attrs = {}) {
  const node = { tagName: tagName.toUpperCase(), className, id: attrs.id ?? "", attrs, parent: null };
  const el = {
    get parent() {
      return node.parent;
    },
    set parent(value) {
      node.parent = value;
    },
    matches(selector) {
      if (selector === ":disabled") return attrs.disabled === "true";
      if (selector.startsWith("#")) return node.id === selector.slice(1);
      if (selector.startsWith(".")) return node.className.split(/\s+/).includes(selector.slice(1));
      if (selector.includes("a[href]") && node.tagName === "A" && node.attrs.href) return true;
      return node.tagName === selector.toUpperCase();
    },
    closest(selector) {
      let cur = el;
      const parts = selector.split(",").map((s) => s.trim());
      while (cur) {
        if (parts.some((part) => cur.matches(part))) return cur;
        cur = cur.parent;
      }
      return null;
    },
    getAttribute(name) {
      return node.attrs[name] ?? null;
    },
  };
  return el;
}

function tree(...nodes) {
  for (let i = 1; i < nodes.length; i += 1) nodes[i].parent = nodes[i - 1];
  return nodes[nodes.length - 1];
}

describe("docs ui-button-press binding", () => {
  it("plays target resolver skips table chrome and cards", () => {
    const playNow = mockEl("button", "btn btn--primary", { id: "play-now" });
    assert.ok(resolveUiButtonPressTarget(playNow));

    const session = mockEl("div", "btable-session");
    const draw = mockEl("button", "btn");
    tree(session, draw);
    assert.equal(resolveUiButtonPressTarget(draw), null);

    const card = mockEl("button", "pcard pcard--interactive");
    assert.equal(resolveUiButtonPressTarget(card), null);
  });
});
