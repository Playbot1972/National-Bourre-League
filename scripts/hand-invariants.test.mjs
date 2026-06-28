/**
 * Hand invariant wiring — ownership boundaries in app.js / firestore / CF.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("hand invariant wiring", () => {
  const firestoreSrc = readFileSync(
    fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
    "utf8",
  );
  const handlersSrc = readFileSync(
    fileURLToPath(new URL("../functions/gameHandlers.js", import.meta.url)),
    "utf8",
  );
  const appSrc = readFileSync(
    fileURLToPath(new URL("../docs/app.js", import.meta.url)),
    "utf8",
  );

  it("firestore imports and uses assertHandActionAllowed", () => {
    assert.ok(firestoreSrc.includes("assertHandActionAllowed"));
    assert.ok(firestoreSrc.includes("assertSettlementEntryAllowed"));
    assert.ok(firestoreSrc.includes("assertSessionChipConserved"));
  });

  it("gameHandlers imports and uses assertHandActionAllowed", () => {
    assert.ok(handlersSrc.includes("assertHandActionAllowed"));
    assert.ok(handlersSrc.includes("assertSettlementEntryAllowed"));
    assert.ok(handlersSrc.includes("assertSessionChipConserved"));
  });

  it("recordHand paths call settlement guards", () => {
    const recordIdx = firestoreSrc.indexOf("async function recordHandClient");
    assert.ok(recordIdx >= 0);
    const body = firestoreSrc.slice(recordIdx, recordIdx + 2500);
    assert.ok(body.includes("assertSettlementEntryAllowed"));
  });

  it("bot orchestration runtime guards duplicate execute", () => {
    const runtimeSrc = readFileSync(
      fileURLToPath(new URL("../docs/bot-orchestration-runtime.js", import.meta.url)),
      "utf8",
    );
    assert.ok(runtimeSrc.includes("assertBotAdvanceNotInFlight"));
    assert.ok(appSrc.includes("createServerBotAdvanceRuntime"));
  });

  it("session-startup bundle exports invariant helpers", () => {
    const startupSrc = readFileSync(
      fileURLToPath(new URL("../docs/session-startup.js", import.meta.url)),
      "utf8",
    );
    assert.ok(startupSrc.includes("assertHandActionAllowed"));
    assert.ok(startupSrc.includes("assertSessionChipConserved"));
  });
});
