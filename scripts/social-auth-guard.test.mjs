/**
 * Social app protected-route auth guard — wait for Firebase before gating.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const appJs = readFileSync(`${root}/docs/app.js`, "utf8");
const authJs = readFileSync(`${root}/docs/auth.js`, "utf8");

describe("social protected nav auth guard", () => {
  it("exports currentUser and whenAuthReady from auth.js", () => {
    assert.match(authJs, /export function currentUser\(/);
    assert.match(authJs, /export function whenAuthReady\(/);
  });

  it("waits for auth initialization before opening sign-in on protected views", () => {
    assert.match(appJs, /let authInitialized = false/);
    assert.match(appJs, /function waitForAuthInitialized\(/);
    assert.match(appJs, /if \(!authInitialized\) \{[\s\S]*waitForAuthInitialized\(\)\.then\(\(\) => showView\(\)\)/);
    assert.match(appJs, /currentUser/);
  });

  it("syncs session from Firebase currentUser after auth is ready", () => {
    assert.match(appJs, /function syncSessionFromAuth\(/);
    assert.match(appJs, /syncSessionFromAuth\(\)/);
  });

  it("closes the auth modal when session is established", () => {
    assert.match(appJs, /if \(user\) closeAuth\(\)/);
  });

  it("registers onAuthChange before the initial routed showView", () => {
    const authIdx = appJs.indexOf("onAuthChange((user) => {");
    const bootShowIdx = appJs.indexOf("void waitForAuthInitialized().then(() => {");
    assert.ok(authIdx >= 0 && bootShowIdx >= 0);
    assert.ok(authIdx < bootShowIdx, "auth listener should register before boot showView");
  });
});
