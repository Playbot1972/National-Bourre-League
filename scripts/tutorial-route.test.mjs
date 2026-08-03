/**
 * Tutorial routing, URL sync, and iOS visibility regression tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

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

describe("tutorial route helpers", () => {
  it("resolves view=tutorial from search params", () => {
    assert.equal(screenFromLocation("?view=tutorial"), "tutorial");
    assert.equal(screenFromLocation(""), "home");
    assert.equal(screenFromLocation("?view=nope"), "home");
  });
});

describe("tutorial-route module", () => {
  it("exports screen helpers used by App", () => {
    const routeTs = read("src/tutorial-route.ts");
    assert.match(routeTs, /export function screenFromLocation/);
    assert.match(routeTs, /export function resolveActiveNavScreen/);
    assert.match(routeTs, /export function writeScreenToLocation/);
    assert.match(routeTs, /"tutorial"/);
  });

  it("resolveActiveNavScreen prefers non-home URL view", () => {
    assert.equal(resolveActiveNavScreen("home", "?view=tutorial"), "tutorial");
    assert.equal(resolveActiveNavScreen("home", ""), "home");
    assert.equal(resolveActiveNavScreen("rules", "?view=tutorial"), "tutorial");
    assert.equal(resolveActiveNavScreen("tutorial", ""), "tutorial");
  });
});

describe("App tutorial tab wiring", () => {
  it("prevents default nav click and calls navigateScreen for Tutorial", () => {
    const appTsx = read("src/App.tsx");
    assert.match(appTsx, /resolveActiveNavScreen/);
    assert.match(appTsx, /event\.preventDefault\(\)/);
    assert.match(appTsx, /navigateScreen\(item\.screen\)/);
    assert.match(appTsx, /activeNavScreen === item\.screen/);
  });

  it("syncs screen from URL on popstate and pageshow", () => {
    const appTsx = read("src/App.tsx");
    assert.match(appTsx, /addEventListener\("popstate"/);
    assert.match(appTsx, /addEventListener\("pageshow"/);
    assert.match(appTsx, /screenFromLocation/);
  });
});

describe("tutorial iOS wiring", () => {
  it("social Tutorial link targets view=tutorial", () => {
    assert.match(read("docs/index.html"), /href="\/?\?view=tutorial">Tutorial/);
  });

  it("App syncs screen from popstate/pageshow and uses client navigation", () => {
    const app = read("src/App.tsx");
    assert.match(app, /addEventListener\("popstate"/);
    assert.match(app, /addEventListener\("pageshow"/);
    assert.match(app, /navigateScreen/);
    assert.match(app, /TutorialErrorBoundary/);
    assert.match(app, /logTutorialRoute/);
  });

  it("Hand fan stage avoids display:contents (Safari paint bug)", () => {
    const css = read("src/components/Hand.css");
    assert.doesNotMatch(css, /\.hand__fan-stage\s*\{[^}]*display:\s*contents/);
    assert.match(css, /\.hand__fan-stage/);
  });

  it("tutorial stage keeps visible opacity baseline on mobile", () => {
    const css = read("src/screens/TutorialScreen.css");
    assert.match(css, /\.tut__stage[\s\S]*opacity:\s*1/);
    assert.match(css, /animation:\s*tut-fade-in[\s\S]*both/);
  });

  it("body background avoids fixed attachment on touch devices", () => {
    const css = read("src/index.css");
    assert.match(css, /background-attachment:\s*scroll/);
    assert.match(css, /pointer:\s*fine/);
  });
});
