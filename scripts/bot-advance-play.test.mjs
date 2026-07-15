/**
 * Regression guards for gameAdvanceBots bot-play crash fix.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const handlersSrc = readFileSync(
  fileURLToPath(new URL("../functions/gameHandlers.js", import.meta.url)),
  "utf8",
);

describe("gameAdvanceBots bot play hardening", () => {
  it("loads bot private hand from embedded mirror before subcollection", () => {
    assert.match(handlersSrc, /async function loadBotPrivateHand/);
    assert.match(handlersSrc, /source: "embedded"/);
    assert.match(handlersSrc, /loadBotPrivateHand\(db, roomId, sessionId, sessionData, playerId\)/);
  });

  it("validates legal plays before runPlayCardTransaction", () => {
    assert.match(handlersSrc, /resolveBotPlayCardDecision/);
    assert.match(handlersSrc, /getLegalPlayIndices/);
    assert.match(handlersSrc, /legalCount/);
  });

  it("maps engine play errors to HttpsError instead of leaking INTERNAL", () => {
    assert.match(handlersSrc, /function mapPlayEngineError/);
    assert.match(handlersSrc, /throw mapPlayEngineError\(err\)/);
    assert.match(handlersSrc, /\[bot-advance\].*error/s);
  });

  it("advanceBotsAfterAction returns ok with emptyReason instead of throwing when no hint", () => {
    assert.match(handlersSrc, /return \{ status: "ok", steps, emptyReason \}/);
  });
});
