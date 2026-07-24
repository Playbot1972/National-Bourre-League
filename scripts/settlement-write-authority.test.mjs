/**
 * Settlement / bankroll write authority — routing guards and recon tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  isSettlementServerRejection,
  isSettlementCloudFunctionUnavailable,
  shouldSettlementFallbackToClient,
} from "../docs/settlement-write-routing.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("settlement write authority routing", () => {
  it("rejects client fallback on server validation errors", () => {
    assert.equal(
      shouldSettlementFallbackToClient({
        code: "functions/failed-precondition",
        message: "Hand is not ready to settle",
      }),
      false,
    );
    assert.equal(
      shouldSettlementFallbackToClient({
        code: "functions/invalid-argument",
        message: "Co-winners must choose push or split",
      }),
      false,
    );
    assert.equal(
      shouldSettlementFallbackToClient({
        code: "functions/permission-denied",
        message: "Only co-winners can vote",
      }),
      false,
    );
  });

  it("rejects client fallback on internal callable errors", () => {
    assert.equal(
      shouldSettlementFallbackToClient({ code: "functions/internal", message: "internal" }),
      false,
    );
    assert.equal(
      shouldSettlementFallbackToClient({ code: "functions/unknown", message: "Internal error" }),
      false,
    );
  });

  it("allows client fallback only for genuine unavailability", () => {
    assert.equal(
      shouldSettlementFallbackToClient({ code: "functions/unavailable", message: "unavailable" }),
      true,
    );
    assert.equal(
      shouldSettlementFallbackToClient({ code: "functions/deadline-exceeded", message: "timeout" }),
      true,
    );
    assert.equal(
      shouldSettlementFallbackToClient({ message: "Failed to fetch" }),
      true,
    );
  });

  it("does not treat broad internal message as unavailability", () => {
    assert.equal(isSettlementCloudFunctionUnavailable({ message: "internal server error" }), false);
    assert.equal(isSettlementServerRejection({ code: "functions/failed-precondition" }), true);
  });

  it("callSettlementOrClient uses shouldSettlementFallbackToClient", () => {
    const src = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    const fn = src.slice(
      src.indexOf("async function callSettlementOrClient"),
      src.indexOf("function isSettlementDevLogging"),
    );
    assert.match(fn, /shouldSettlementFallbackToClient\(serverErr\)/);
    assert.doesNotMatch(fn, /isCloudFunctionUnavailable\(serverErr\)/);
    assert.doesNotMatch(fn, /Settlement Cloud Function failed, trying client batch/);
  });
});

describe("remaining client-only settlement/bankroll writes (documented)", () => {
  it("recordHand and voteCoWinSettlement route through callSettlementOrClient", () => {
    const src = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    assert.match(src, /export async function recordHand[\s\S]*?return callSettlementOrClient/);
    assert.match(src, /export async function voteCoWinSettlement[\s\S]*?return callSettlementOrClient/);
  });

  it("rebuySessionPlayer remains client-direct (no callable yet)", () => {
    const src = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    const block = src.slice(
      src.indexOf("export async function rebuySessionPlayer"),
      src.indexOf("async function applyBotAutoRebuysAfterSettlement"),
    );
    assert.doesNotMatch(block, /callSettlementOrClient|gameRecordHand|callGame/);
    assert.match(block, /updateDoc|writeBatch/);
  });

  it("applyRankingResults remains client-direct for session finalization", () => {
    const src = readFileSync(join(root, "../docs/firestore.js"), "utf8");
    const block = src.slice(
      src.indexOf("export async function applyRankingResults"),
      src.indexOf("export async function advanceSessionBots"),
    );
    assert.match(block, /writeBatch/);
    assert.doesNotMatch(block, /callSettlementOrClient|gameRecordHand/);
  });
});
