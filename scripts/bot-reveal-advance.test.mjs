/**
 * Bot advance during reveal — server hint + structured empty-step reasons.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("bot reveal advance wiring", () => {
  const phaseSrc = readFileSync(
    fileURLToPath(new URL("../src/session/handPhaseMachine.ts", import.meta.url)),
    "utf8",
  );
  const handlersSrc = readFileSync(
    fileURLToPath(new URL("../functions/gameHandlers.js", import.meta.url)),
    "utf8",
  );

  it("resolveBotAdvanceHint includes advance_reveal for deal flow phase", () => {
    assert.ok(phaseSrc.includes('"advance_reveal"'));
    assert.ok(phaseSrc.includes("kind: \"advance_reveal\""));
    assert.ok(phaseSrc.includes("HAND_FLOW_PHASE.DEAL"));
  });

  it("exports resolveBotAdvanceEmptyReason for diagnostics", () => {
    assert.ok(phaseSrc.includes("export function resolveBotAdvanceEmptyReason"));
    assert.ok(phaseSrc.includes("draw_human_turn"));
  });

  it("advanceBotsAfterAction handles advance_reveal without nested chain", () => {
    assert.ok(handlersSrc.includes('case "advance_reveal"'));
    assert.ok(handlersSrc.includes("chainBots: false"));
    assert.ok(handlersSrc.includes("resolveBotAdvanceEmptyReason"));
    assert.ok(handlersSrc.includes("emptyReason"));
  });
});
