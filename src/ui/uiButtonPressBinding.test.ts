import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveUiButtonPressTarget } from "./uiButtonPressBinding";

type MockNode = {
  tagName: string;
  className: string;
  id: string;
  attrs: Record<string, string>;
  parent: MockNode | null;
};

function mockEl(
  tagName: string,
  className = "",
  attrs: Record<string, string> = {},
): MockNode & Element {
  const node: MockNode = { tagName: tagName.toUpperCase(), className, id: attrs.id ?? "", attrs, parent: null };
  const el = {
    get tagName() {
      return node.tagName;
    },
    get className() {
      return node.className;
    },
    get parent() {
      return node.parent;
    },
    set parent(value: MockNode | null) {
      node.parent = value;
    },
    matches(selector: string): boolean {
      if (selector === ":disabled") return attrs.disabled === "true";
      if (selector.startsWith("#")) return node.id === selector.slice(1);
      if (selector.startsWith(".")) {
        return node.className.split(/\s+/).includes(selector.slice(1));
      }
      if (selector.includes("a[href]") && node.tagName === "A" && node.attrs.href) {
        return true;
      }
      if (selector.includes("[data-delete-room]") && node.attrs["data-delete-room"] !== undefined) {
        return true;
      }
      return node.tagName === selector.toUpperCase();
    },
    closest(selector: string): Element | null {
      let cur: (MockNode & Element) | null = el;
      const parts = selector.split(",").map((s) => s.trim());
      while (cur) {
        if (parts.some((part) => cur!.matches(part))) return cur;
        cur = cur.parent as (MockNode & Element) | null;
      }
      return null;
    },
    getAttribute(name: string): string | null {
      return node.attrs[name] ?? null;
    },
  };
  return el as unknown as MockNode & Element;
}

function tree(...nodes: Array<MockNode & Element>): MockNode & Element {
  for (let i = 1; i < nodes.length; i += 1) {
    nodes[i]!.parent = nodes[i - 1]!;
  }
  return nodes[nodes.length - 1]!;
}

describe("resolveUiButtonPressTarget", () => {
  it("returns button activators outside the table", () => {
    const btn = mockEl("button", "btn btn--primary");
    assert.equal(resolveUiButtonPressTarget(btn as unknown as EventTarget), btn);
  });

  it("skips controls inside the live table shell", () => {
    const session = mockEl("div", "btable-session");
    const btn = mockEl("button", "btn");
    tree(session, btn);
    assert.equal(resolveUiButtonPressTarget(btn as unknown as EventTarget), null);
  });

  it("skips playing cards", () => {
    const card = mockEl("button", "pcard pcard--interactive");
    assert.equal(resolveUiButtonPressTarget(card as unknown as EventTarget), null);
  });

  it("skips disabled activators", () => {
    const btn = mockEl("button", "btn", { disabled: "true" });
    assert.equal(resolveUiButtonPressTarget(btn as unknown as EventTarget), null);
  });

  it("skips delete-room controls with dedicated delete audio", () => {
    const btn = mockEl("button", "btn btn--danger", { id: "delete-room" });
    assert.equal(resolveUiButtonPressTarget(btn as unknown as EventTarget), null);
  });

  it("resolves nav links and theme toggle", () => {
    const link = mockEl("a", "nav__link", { href: "#rooms" });
    const theme = mockEl("button", "theme-toggle");
    assert.equal(resolveUiButtonPressTarget(link as unknown as EventTarget), link);
    assert.equal(resolveUiButtonPressTarget(theme as unknown as EventTarget), theme);
  });
});
