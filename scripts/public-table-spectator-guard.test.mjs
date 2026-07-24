import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createWatchOnlyTableIntentHandlers,
  isPublicTableSpectator,
  isPublicTableWatchOnly,
  PUBLIC_TABLE_WATCH_ONLY_MESSAGE,
} from "../docs/public-table-spectator.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function baseSession(overrides = {}) {
  return {
    publicTable: true,
    pendingJoins: {
      user_a: { status: "spectating", joinId: "join_1", queuedAtHandCount: 0 },
    },
    ...overrides,
  };
}

describe("public-table spectator helpers", () => {
  it("detects spectating pendingJoin without a score row", () => {
    const session = baseSession();
    assert.equal(isPublicTableSpectator(session, "user_a"), true);
    assert.equal(isPublicTableWatchOnly(session, "user_a", { scorePlayerIds: [] }), true);
  });

  it("treats a score row as authoritative seated promotion", () => {
    const session = baseSession();
    assert.equal(
      isPublicTableWatchOnly(session, "user_a", { scorePlayerIds: ["user_a"] }),
      false,
    );
    assert.equal(
      isPublicTableSpectator(session, "user_a", { hasScoreRow: true }),
      false,
    );
  });

  it("clears watch-only when pendingJoin status is seated", () => {
    const session = baseSession({
      pendingJoins: {
        user_a: { status: "seated", joinId: "join_1", queuedAtHandCount: 0 },
      },
    });
    assert.equal(isPublicTableWatchOnly(session, "user_a", { scorePlayerIds: ["user_a"] }), false);
    assert.equal(isPublicTableSpectator(session, "user_a"), false);
  });

  it("ignores private-room sessions", () => {
    assert.equal(isPublicTableSpectator({}, "user_a"), false);
    assert.equal(isPublicTableWatchOnly({ publicTable: false }, "user_a"), false);
  });
});

describe("watch-only table intent handlers", () => {
  it("does not mutate state when invoked", async () => {
    const handlers = createWatchOnlyTableIntentHandlers();
    await handlers.onSubmitDraw?.([0]);
    await handlers.onPlayCard?.(0);
    handlers.onToggleInHand(true);
    handlers.onTrickDelta(1);
    handlers.onSettle("split");
    assert.equal(typeof handlers.onToggleInHand, "function");
  });
});

describe("legacy sync guard wiring", () => {
  it("ensureSessionPlayer skips public-table spectators", () => {
    const src = readFileSync(join(root, "docs/firestore.js"), "utf8");
    assert.match(src, /isPublicTableSpectator\(sessionData, playerId\)/);
    assert.match(src, /!isPublicTableSpectator\(sessionData, m\.userId\)/);
  });

  it("buildTableSessionProps avoids pseudo seated row for spectators", () => {
    const src = readFileSync(join(root, "docs/app.js"), "utf8");
    assert.match(src, /isPublicTableWatchOnly\(s, myUid/);
    assert.match(src, /watchOnly \? createWatchOnlyTableIntentHandlers\(\)/);
    assert.match(src, /PUBLIC_TABLE_WATCH_ONLY_MESSAGE/);
  });

  it("turn urgency hooks receive watchOnly from TableSessionView", () => {
    const src = readFileSync(join(root, "src/table/turnCountdown.ts"), "utf8");
    assert.match(src, /watchOnly\)/);
    const viewSrc = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(viewSrc, /watchOnly,\s*\n\s*currentUserId/);
  });
});

describe("watch-only banner copy", () => {
  it("uses the launch-safety spectator message", () => {
    assert.equal(
      PUBLIC_TABLE_WATCH_ONLY_MESSAGE,
      "Watching this hand — you'll join the next deal.",
    );
    const viewSrc = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(viewSrc, /data-testid="watch-only-banner"/);
  });
});
