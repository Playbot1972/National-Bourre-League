/**
 * Watch-only mid-hand join must not freeze bot-only public tables.
 * Regression for Play Now → spectating during reveal/trump with presentation catch-up.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { isPublicTableWatchOnly } from "../docs/public-table-spectator.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("watch-only mid-hand join — bot progression", () => {
  it("spectator is watch-only without a score row", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        guest_1: { status: "spectating", joinedAt: Date.now() },
      },
      currentHand: {
        phase: "reveal",
        trumpUpcard: { rank: "7", suit: "spades" },
        participantIds: ["bot_a", "bot_b"],
      },
    };
    assert.equal(
      isPublicTableWatchOnly(session, "guest_1", { scorePlayerIds: ["bot_a", "bot_b"] }),
      true,
    );
  });

  it("bot-only reveal phase still has advance_reveal server hint", () => {
    const phaseSrc = readFileSync(
      join(root, "../src/session/handPhaseMachine.ts"),
      "utf8",
    );
    assert.match(phaseSrc, /HAND_FLOW_PHASE\.DEAL[\s\S]*kind: "advance_reveal"/);
  });

  it("server bot runtime defers non-play presentation instead of aborting schedule", () => {
    const runtimeSrc = readFileSync(join(root, "../docs/bot-orchestration-runtime.js"), "utf8");
    assert.match(runtimeSrc, /presentationBlocked && handPhase !== "play"/);
    assert.match(runtimeSrc, /action: "deferred"/);
    assert.doesNotMatch(
      runtimeSrc,
      /presentationBlocked && handPhase !== "play"[\s\S]{0,500}return;\s*\n\s*if \(inFlight\)/,
    );
  });

  it("watch-only TableSessionView skips client reveal advance only (server remains canonical)", () => {
    const viewSrc = readFileSync(
      join(root, "../src/table/TableSessionView.tsx"),
      "utf8",
    );
    const block = viewSrc.slice(
      viewSrc.indexOf("useEffect(() => {"),
      viewSrc.indexOf("useEffect(() => {\n    const onKey"),
    );
    assert.match(block, /if \(watchOnly\) return;/);
    assert.match(block, /actions\.onAdvanceReveal/);
    const appSrc = readFileSync(join(root, "../docs/app.js"), "utf8");
    assert.match(appSrc, /scheduleSessionOrchestration\(.*reason: "open-table-play"/);
    assert.doesNotMatch(
      appSrc.slice(
        appSrc.indexOf("function runSessionOrchestration"),
        appSrc.indexOf("function scheduleSessionOrchestration"),
      ),
      /watchOnly/,
      "orchestration must not skip bot driver for watch-only spectators",
    );
  });

  it("pendingJoins spectator promotion stays at handoff boundary", () => {
    const replacementSrc = readFileSync(
      join(root, "../functions/publicTableReplacement.js"),
      "utf8",
    );
    assert.match(replacementSrc, /isHandoffWindow\(sessionData\)/);
    assert.match(replacementSrc, /selectQueuedHumansFifo/);
  });
});
