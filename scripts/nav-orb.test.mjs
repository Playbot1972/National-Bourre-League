/**
 * Main nav tab order and blue orb indicator wiring.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const indexHtml = readFileSync(`${root}/docs/index.html`, "utf8");
const stylesCss = readFileSync(`${root}/docs/styles.css`, "utf8");
const appTsx = readFileSync(`${root}/src/App.tsx`, "utf8");
const appCss = readFileSync(`${root}/src/App.css`, "utf8");

describe("main nav tab order", () => {
  it("social app lists Home before Tutorial in primary nav", () => {
    const navIdx = indexHtml.indexOf('aria-label="Primary"');
    assert.ok(navIdx >= 0);
    const navBlock = indexHtml.slice(navIdx, navIdx + 600);
    const homeIdx = navBlock.indexOf('href="#home">Home');
    const tutorialIdx = navBlock.indexOf('href="/">Tutorial');
    assert.ok(homeIdx >= 0 && tutorialIdx >= 0);
    assert.ok(homeIdx < tutorialIdx, "Home should appear before Tutorial");
  });

  it("react app lists Home before Tutorial in MAIN_NAV", () => {
    const homeIdx = appTsx.indexOf('label: "Home"');
    const tutorialIdx = appTsx.indexOf('label: "Tutorial"');
    assert.ok(homeIdx >= 0 && tutorialIdx >= 0);
    assert.ok(homeIdx < tutorialIdx);
  });
});

describe("blue orb indicators", () => {
  it("social styles apply orb to active nav links", () => {
    assert.match(stylesCss, /\.nav__link\.is-active::after/);
    assert.match(stylesCss, /nbl-pill-orb-travel/);
  });

  it("social styles apply orb to selected play-now mode", () => {
    assert.match(stylesCss, /\.play-now-mode__option:has\(input:checked\)::after/);
  });

  it("react styles apply orb to active nav links", () => {
    assert.match(appCss, /\.app__nav-link\.is-active::after/);
    assert.match(appCss, /nbl-pill-orb-travel/);
  });
});
