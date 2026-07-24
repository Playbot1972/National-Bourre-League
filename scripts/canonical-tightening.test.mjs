/**
 * Canonical tightening — enrollment constants, settlement write authority, view-model helpers.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveCoWinPresentation } from "../docs/co-win-presentation.js";
import { HAND_ENROLLMENT_MS } from "../functions/vendor/hand-enrollment-ms.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("enrollment timer constant (server)", () => {
  it("shares HAND_ENROLLMENT_MS via functions vendor module", () => {
    assert.equal(HAND_ENROLLMENT_MS, 12_000);
    const gameHandlers = readFileSync(join(root, "../functions/gameHandlers.js"), "utf8");
    const idle = readFileSync(join(root, "../functions/publicTableIdle.js"), "utf8");
    assert.match(gameHandlers, /from "\.\/vendor\/hand-enrollment-ms\.js"/);
    assert.doesNotMatch(gameHandlers, /export const HAND_ENROLLMENT_MS = 12_000/);
    assert.match(idle, /from "\.\/vendor\/hand-enrollment-ms\.js"/);
    assert.doesNotMatch(idle, /turnDeadlineMs: nowMs \+ 12_000/);
  });

  it("documents client/server enrollment completion divergence (intentional)", () => {
    const server = readFileSync(join(root, "../functions/gameHandlers.js"), "utf8");
    const client = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    const serverFn = server.slice(
      server.indexOf("function enrollmentPatchAfterStep"),
      server.indexOf("function sortedScorePlayerIds"),
    );
    const clientFn = client.slice(
      client.indexOf("function enrollmentPatchAfterStep"),
      client.indexOf("function patchFromDecisionStep"),
    );
    assert.match(serverFn, /enrolledIds\.length < 2[\s\S]*enrolledIds: \[\]/);
    assert.match(clientFn, /buildSoloWinPatch|buildPagatHandStartPatch/);
    assert.doesNotMatch(serverFn, /buildSoloWinPatch|buildPagatHandStartPatch/);
  });
});

describe("settlement write authority routing", () => {
  it("falls back to client batch only when Cloud Function is unavailable", () => {
    const src = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    const fn = src.slice(
      src.indexOf("async function callSettlementOrClient"),
      src.indexOf("function isSettlementDevLogging"),
    );
    assert.match(fn, /shouldSettlementFallbackToClient\(serverErr\)/);
    assert.match(fn, /isBenignTableActionError\(serverErr\)/);
    assert.doesNotMatch(fn, /Settlement Cloud Function failed, trying client batch/);
  });
});

describe("resolveCoWinPresentation", () => {
  it("shows co-win UI when hand is complete with tied leaders", () => {
    const result = resolveCoWinPresentation({
      handComplete: true,
      handReady: true,
      derivedWinnerIds: ["a", "b"],
      pendingCoWinSettlement: null,
      maxWinThisHand: 10,
    });
    assert.deepEqual(result.activeWinnerIds, ["a", "b"]);
    assert.equal(result.showCoWinSettlement, true);
    assert.equal(result.splitSharePerWinner, 5);
  });

  it("uses pending winners when tricks are not yet ready", () => {
    const result = resolveCoWinPresentation({
      handComplete: true,
      handReady: false,
      derivedWinnerIds: [],
      pendingCoWinSettlement: { winnerIds: ["a", "b"] },
      maxWinThisHand: 8,
    });
    assert.deepEqual(result.activeWinnerIds, ["a", "b"]);
    assert.equal(result.showCoWinSettlement, true);
    assert.equal(result.splitSharePerWinner, 4);
  });

  it("hides co-win UI for single winner", () => {
    const result = resolveCoWinPresentation({
      handComplete: true,
      handReady: true,
      derivedWinnerIds: ["a"],
      pendingCoWinSettlement: null,
      maxWinThisHand: 10,
    });
    assert.equal(result.showCoWinSettlement, false);
    assert.equal(result.splitSharePerWinner, 0);
  });
});

describe("buildTableSessionProps co-win derivation", () => {
  it("delegates to resolveCoWinPresentation in table-view-model", () => {
    const app = readFileSync(join(root, "../docs/app.js"), "utf8");
    const block = app.slice(
      app.indexOf("function buildTableSessionProps"),
      app.indexOf("let lastHandTransitionSnapKey"),
    );
    assert.match(block, /resolveCoWinPresentation\(/);
    assert.doesNotMatch(block, /const showCoWinSettlement\s*=\s*\n\s*handComplete/);
  });
});
