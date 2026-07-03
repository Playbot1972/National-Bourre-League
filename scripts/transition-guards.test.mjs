import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  createTransitionLock,
  HAND_TRANSITION,
} from "../docs/session-startup.js";

describe("transition guards", () => {
  it("createTransitionLock ignores duplicate concurrent transitions", async () => {
    const lock = createTransitionLock();
    let inner = 0;
    await lock.runLockedTransition("HAND_END", async () => {
      const skipped = await lock.runLockedTransition("ROUND_ADVANCE", async () => {
        inner += 1;
      });
      assert.equal(skipped, undefined);
    });
    assert.equal(inner, 0);
    assert.equal(lock.current, null);
  });

  it("exports hand transition event constants", () => {
    assert.equal(HAND_TRANSITION.DRAW_SUBMIT, "DRAW_SUBMIT");
    assert.equal(HAND_TRANSITION.ROUND_ADVANCE, "ROUND_ADVANCE");
  });

  it("robotSubmitDraw is blocked when SERVER_HAND_AUTHORITY is on", () => {
    const firestoreSrc = readFileSync(
      fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
      "utf8",
    );
    const idx = firestoreSrc.indexOf("export async function robotSubmitDraw");
    assert.ok(idx >= 0);
    const body = firestoreSrc.slice(idx, idx + 500);
    assert.ok(body.includes("SERVER_HAND_AUTHORITY"));
    assert.ok(body.includes("HAND_TRANSITION.DRAW_SUBMIT"));
    assert.ok(body.includes("blocked: true"));
  });

  it("submitHandDraw returns blocked sentinel when draw lock is held", () => {
    const firestoreSrc = readFileSync(
      fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
      "utf8",
    );
    const idx = firestoreSrc.indexOf("export async function submitHandDraw");
    assert.ok(idx >= 0);
    const body = firestoreSrc.slice(idx, idx + 1200);
    assert.ok(body.includes("draw_transition_lock"));
    assert.ok(body.includes("return { blocked: true }"));
  });

  it("table draw intents ignore blocked submitHandDraw results", () => {
    const intentsSrc = readFileSync(
      fileURLToPath(new URL("../docs/table-intents.js", import.meta.url)),
      "utf8",
    );
    assert.ok(intentsSrc.includes("result?.blocked"));
  });

  it("runSessionOrchestration logs client DRAW_START on first entry into draw", () => {
    const appSrc = readFileSync(
      fileURLToPath(new URL("../docs/app.js", import.meta.url)),
      "utf8",
    );
    const fnIdx = appSrc.indexOf("function maybeLogClientHandPhaseTransitions");
    assert.ok(fnIdx >= 0);
    const body = appSrc.slice(fnIdx, fnIdx + 900);
    assert.ok(body.includes('prevPhase !== "draw"'));
    assert.ok(body.includes('currentPhase === "draw"'));
    assert.ok(body.includes("HAND_TRANSITION.DRAW_START"));
    assert.ok(body.includes("clientObservedHandPhase = currentPhase"));
    const orchIdx = appSrc.indexOf("function runSessionOrchestration");
    assert.ok(orchIdx >= 0);
    const orchBody = appSrc.slice(orchIdx, orchIdx + 500);
    assert.ok(orchBody.includes("maybeLogClientHandPhaseTransitions(sessionObj)"));
  });

  it("maybeRecoverHandLifecycle skips recover when next-hand enrollment is in flight", () => {
    const appSrc = readFileSync(
      fileURLToPath(new URL("../docs/app.js", import.meta.url)),
      "utf8",
    );
    const idx = appSrc.indexOf("function maybeRecoverHandLifecycle");
    assert.ok(idx >= 0);
    const body = appSrc.slice(idx, idx + 1400);
    assert.ok(body.includes("nextHandOpenInFlight || appRoundAdvanceLock.isLocked()"));
    assert.ok(body.includes("next_hand_inflight_or_round_advance_locked"));
    assert.ok(body.includes("sessionNeedsHandoffRecovery(sessionObj)"));
    assert.ok(body.includes("recoverHandoffBetweenHands"));
    const guardIdx = body.indexOf("next_hand_inflight_or_round_advance_locked");
    const needsIdx = body.indexOf("sessionNeedsHandoffRecovery(sessionObj)");
    const recoverIdx = body.indexOf("recoverHandoffBetweenHands");
    assert.ok(guardIdx >= 0 && needsIdx >= 0 && recoverIdx >= 0);
    assert.ok(guardIdx < recoverIdx);
    assert.ok(needsIdx < recoverIdx);
  });

  it("processRobotActions requests server advance before client robot draw", () => {
    const appSrc = readFileSync(
      fileURLToPath(new URL("../docs/app.js", import.meta.url)),
      "utf8",
    );
    const idx = appSrc.indexOf("function processRobotActionsInner");
    assert.ok(idx >= 0);
    const body = appSrc.slice(idx, idx + 9000);
    const serverIdx = body.indexOf("shouldRequestServerBotAdvance");
    const drawIdx = body.indexOf("robotSubmitDraw(");
    assert.ok(serverIdx >= 0 && drawIdx >= 0);
    assert.ok(serverIdx < drawIdx);
    assert.ok(body.includes("HAND_TRANSITION"));
  });
});
