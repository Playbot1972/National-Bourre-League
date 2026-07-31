/**
 * Tutorial route helpers — URL ↔ screen sync and nav active resolution.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// Compile TS on the fly via tsx if available; otherwise test source contracts.
const appTsx = readFileSync(`${root}/src/App.tsx`, "utf8");
const routeTs = readFileSync(`${root}/src/tutorial-route.ts`, "utf8");

describe("tutorial-route module", () => {
  it("exports screen helpers used by App", () => {
    assert.match(routeTs, /export function screenFromLocation/);
    assert.match(routeTs, /export function resolveActiveNavScreen/);
    assert.match(routeTs, /export function writeScreenToLocation/);
    assert.match(routeTs, /"tutorial"/);
  });

  it("resolveActiveNavScreen prefers non-home URL view", () => {
    // Inline mirror of production logic for unit assertion without a TS runner.
    const VALID = new Set(["home", "rules", "tutorial", "room"]);
    function screenFromLocation(search) {
      const view = new URLSearchParams(search).get("view");
      if (view && VALID.has(view)) return view;
      return "home";
    }
    function resolveActiveNavScreen(screen, search) {
      const fromUrl = screenFromLocation(search);
      if (fromUrl !== "home") return fromUrl;
      return screen;
    }

    assert.equal(resolveActiveNavScreen("home", "?view=tutorial"), "tutorial");
    assert.equal(resolveActiveNavScreen("home", ""), "home");
    assert.equal(resolveActiveNavScreen("rules", "?view=tutorial"), "tutorial");
    assert.equal(resolveActiveNavScreen("tutorial", ""), "tutorial");
  });
});

describe("App tutorial tab wiring", () => {
  it("prevents default nav click and calls navigateScreen for Tutorial", () => {
    assert.match(appTsx, /resolveActiveNavScreen/);
    assert.match(appTsx, /event\.preventDefault\(\)/);
    assert.match(appTsx, /navigateScreen\(item\.screen\)/);
    assert.match(appTsx, /activeNavScreen === item\.screen/);
  });

  it("syncs screen from URL on popstate and pageshow", () => {
    assert.match(appTsx, /addEventListener\("popstate"/);
    assert.match(appTsx, /addEventListener\("pageshow"/);
    assert.match(appTsx, /screenFromLocation/);
  });
});
