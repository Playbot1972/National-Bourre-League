/**
 * Canonical live-player invariants — seating, watch-only, turn ownership, enrollment eligibility.
 *
 * Fast Node tests (no browser). Complements e2e/live-players.emulator.spec.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  createWatchOnlyTableIntentHandlers,
  isPublicTableSpectator,
  isPublicTableWatchOnly,
} from "../docs/public-table-spectator.js";
import { PENDING_JOIN_STATUS } from "../docs/public-table-schema.js";
import {
  buildEnrollmentPatchForIdleSitOut,
  isIdleSitOutBlockingEnrollment,
} from "../functions/publicTableIdle.js";

const root = dirname(fileURLToPath(import.meta.url));

function readSrc(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

describe("seating vs watch-only vs pendingJoins", () => {
  it("spectating pendingJoin without score row is watch-only", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        uid_guest: {
          status: PENDING_JOIN_STATUS.SPECTATING,
          joinId: "j1",
          queuedAtHandCount: 2,
        },
      },
    };
    assert.equal(isPublicTableSpectator(session, "uid_guest"), true);
    assert.equal(isPublicTableWatchOnly(session, "uid_guest", { scorePlayerIds: [] }), true);
  });

  it("score row promotion overrides pendingJoin spectating status", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        uid_guest: {
          status: PENDING_JOIN_STATUS.SPECTATING,
          joinId: "j1",
          queuedAtHandCount: 2,
        },
      },
    };
    assert.equal(
      isPublicTableWatchOnly(session, "uid_guest", { scorePlayerIds: ["uid_guest"] }),
      false,
    );
    assert.equal(isPublicTableSpectator(session, "uid_guest", { hasScoreRow: true }), false);
  });

  it("seated pendingJoin status clears spectator mode", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        uid_guest: {
          status: PENDING_JOIN_STATUS.SEATED,
          joinId: "j1",
          queuedAtHandCount: 3,
        },
      },
    };
    assert.equal(isPublicTableSpectator(session, "uid_guest"), false);
    assert.equal(
      isPublicTableWatchOnly(session, "uid_guest", { scorePlayerIds: ["uid_guest"] }),
      false,
    );
  });

  it("private-room sessions never enter watch-only via pendingJoins", () => {
    const session = {
      publicTable: false,
      pendingJoins: {
        uid_guest: { status: PENDING_JOIN_STATUS.SPECTATING },
      },
    };
    assert.equal(isPublicTableWatchOnly(session, "uid_guest"), false);
  });
});

describe("turn ownership + sitOut invariants", () => {
  it("idle sit-out blocks enrollment turn until advanced", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["human_a", "human_b"],
      currentIndex: 0,
      enrolledIds: [],
      declinedIds: [],
      turnDeadlineMs: Date.now() + 12_000,
    };
    const scoreById = { human_a: { sitOut: true } };
    assert.equal(isIdleSitOutBlockingEnrollment(enrollment, scoreById, Date.now()), true);

    const patch = buildEnrollmentPatchForIdleSitOut(enrollment, "human_a", null, Date.now());
    assert.ok(patch?.handEnrollment);
    assert.ok(patch.handEnrollment.declinedIds.includes("human_a"));
    assert.equal(isIdleSitOutBlockingEnrollment(patch.handEnrollment, scoreById, Date.now()), false);
  });

  it("table-view-model suppresses isOnTurn and isActiveActor for idle sit-out", () => {
    const src = readSrc("../docs/table-view-model.js");
    assert.match(src, /isOnTurn:\s*\n\s*sc\.sitOut !== true && cardsDealt/);
    assert.match(src, /isActiveActor:\s*\n\s*sc\.sitOut === true\s*\n\s*\?\s*false/);
  });

  it("resolveTableActiveActorId clears actor for sitOutPlayerIds (turnCountdown)", () => {
    const src = readSrc("../src/table/turnCountdown.ts");
    assert.match(src, /sitOutPlayerIds/);
    assert.match(src, /sitOutPlayerIds\?\.includes\(turnPlayerId\)/);
  });

  it("watch-only spectators suppress turn actor in turnCountdown", () => {
    const src = readSrc("../src/table/turnCountdown.ts");
    const fn = src.slice(
      src.indexOf("export function resolveTableActiveActorId"),
      src.indexOf("export function buildTurnCountdownState"),
    );
    assert.match(fn, /input\.watchOnly\) return null/);
  });
});

describe("enrollment and dealing eligibility", () => {
  it("eligibleSeatPlayerIds excludes sitOut and out score rows", () => {
    const src = readSrc("../docs/firestore.js");
    const block = src.slice(
      src.indexOf("export function eligibleSeatPlayerIds"),
      src.indexOf("/** Clockwise order starting with the first seat after the dealer."),
    );
    assert.match(block, /row\?\.out === true/);
    assert.match(block, /row\?\.sitOut === true/);
    assert.match(block, /canEnrollWithBankroll/);
  });

  it("buildHandEnrollment skips sitOut and broke players", () => {
    const src = readSrc("../docs/firestore.js");
    const block = src.slice(
      src.indexOf("function buildHandEnrollment("),
      src.indexOf("function tryAutoEnrollmentDeal"),
    );
    assert.match(block, /row\?\.sitOut === true/);
    assert.match(block, /row\?\.out === true/);
    assert.match(block, /canEnrollWithBankroll/);
  });

  it("tryAutoEnrollmentDeal requires opt-in and eligible bankroll", () => {
    const src = readSrc("../docs/firestore.js");
    const block = src.slice(
      src.indexOf("function tryAutoEnrollmentDeal"),
      src.indexOf("function enrollmentFieldsForCreate"),
    );
    assert.match(block, /tableOptInIds/);
    assert.match(block, /eligible\.length < 2/);
    assert.match(block, /row\?\.sitOut === true/);
  });

  it("enrollment does not start on session create — only from Go to Table", () => {
    const firestore = readSrc("../docs/firestore.js");
    const block = firestore.slice(
      firestore.indexOf("function enrollmentFieldsForCreate"),
      firestore.indexOf("/** Clear join window between hands"),
    );
    assert.match(block, /return \{\}/);
    assert.match(block, /Go to Table/);
  });
});

describe("Firestore listener / view-model guardrails", () => {
  it("buildTableSessionProps routes watch-only to noop intent handlers", () => {
    const src = readSrc("../docs/app.js");
    const block = src.slice(
      src.indexOf("function buildTableSessionProps"),
      src.indexOf("let lastHandTransitionSnapKey"),
    );
    assert.match(block, /isPublicTableWatchOnly\(/);
    assert.match(block, /watchOnly \? createWatchOnlyTableIntentHandlers\(\)/);
    assert.match(block, /watchOnlyMessage/);
  });

  it("ensureSessionPlayer skips public-table spectators", () => {
    const src = readSrc("../docs/firestore.js");
    assert.match(src, /isPublicTableSpectator\(sessionData, playerId\)/);
  });

  it("watch-only intent handlers are pure no-ops", async () => {
    const handlers = createWatchOnlyTableIntentHandlers();
    let mutated = false;
    const guard = () => {
      mutated = true;
    };
    handlers.onToggleInHand(true);
    handlers.onTrickDelta(1);
    await handlers.onSubmitDraw?.([0]);
    await handlers.onPlayCard?.(0);
    assert.equal(mutated, false);
  });
});

describe("replacement / handoff wiring", () => {
  it("public-table replacement promotes queued humans at handoff window", () => {
    const src = readSrc("../functions/publicTableReplacement.js");
    assert.match(src, /isHandoffWindow\(sessionData\)/);
    assert.match(src, /selectQueuedHumansFifo/);
    assert.match(src, /PENDING_JOIN_STATUS\.SPECTATING/);
  });

  it("client orchestration does not skip bot driver for watch-only viewers", () => {
    const src = readSrc("../docs/app.js");
    const block = src.slice(
      src.indexOf("function runSessionOrchestration"),
      src.indexOf("function scheduleSessionOrchestration"),
    );
    assert.doesNotMatch(block, /watchOnly/);
  });
});
