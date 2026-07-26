import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PUBLIC_TABLE_MAX_SEATS,
  PUBLIC_TABLE_MIN_SEATS,
  PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  ROOM_VISIBILITY,
  BOT_ROLE,
  MATCH_QUEUE_COLLECTION,
  PUBLIC_TABLE_INDEX_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  publicTableIndexKey,
  roomHasMixedPublicTables,
  isPublicVisibility,
} from "../docs/public-table-schema.js";
import {
  MIXED_PUBLIC_TABLES_CLIENT_ENABLED,
  resolvePlayNowEntryPath,
  isMixedPublicTablesRolloutEnabled,
  isPublicTableSession,
} from "../docs/public-table-rollout.js";

describe("public-table schema contracts", () => {
  it("exposes seat bounds aligned with MAX_TABLE_PLAYERS", () => {
    assert.equal(PUBLIC_TABLE_MAX_SEATS, 8);
    assert.equal(PUBLIC_TABLE_MIN_SEATS, 2);
    assert.ok(PUBLIC_TABLE_DEFAULT_TARGET_SEATS >= PUBLIC_TABLE_MIN_SEATS);
    assert.ok(PUBLIC_TABLE_DEFAULT_TARGET_SEATS <= PUBLIC_TABLE_MAX_SEATS);
  });

  it("builds stable publicTableIndex keys", () => {
    assert.equal(publicTableIndexKey("room_a", "sess_b"), "room_a_sess_b");
  });

  it("treats absent room visibility as private", () => {
    assert.equal(isPublicVisibility({}), false);
    assert.equal(isPublicVisibility({ visibility: ROOM_VISIBILITY.PRIVATE }), false);
    assert.equal(isPublicVisibility({ visibility: ROOM_VISIBILITY.PUBLIC }), true);
  });

  it("requires explicit features.mixedPublicTables on room", () => {
    assert.equal(roomHasMixedPublicTables({}), false);
    assert.equal(roomHasMixedPublicTables({ features: {} }), false);
    assert.equal(roomHasMixedPublicTables({ features: { mixedPublicTables: true } }), true);
  });

  it("documents collection names for rules and Phase 3 queries", () => {
    assert.equal(MATCH_QUEUE_COLLECTION, "matchQueue");
    assert.equal(PUBLIC_TABLE_INDEX_COLLECTION, "publicTableIndex");
    assert.ok(MATCH_QUEUE_STATUS.SPECTATING);
    assert.ok(PENDING_JOIN_STATUS.READY);
    assert.equal(BOT_ROLE.FILL, "fill");
  });
});

describe("public-table rollout guard (client flag on)", () => {
  it("enables client master switch for Play Now public matchmaking", () => {
    assert.equal(MIXED_PUBLIC_TABLES_CLIENT_ENABLED, true);
  });

  it("resolvePlayNowEntryPath returns public-matchmaking when flag is on", () => {
    assert.equal(resolvePlayNowEntryPath(), "public-matchmaking");
  });

  it("enables rollout for flagged rooms when client switch is on", () => {
    assert.equal(
      isMixedPublicTablesRolloutEnabled({ features: { mixedPublicTables: true } }),
      true,
    );
  });

  it("detects publicTable session marker", () => {
    assert.equal(isPublicTableSession({ publicTable: true }), true);
    assert.equal(isPublicTableSession({}), false);
  });
});

describe("Play Now flag-on behavior contract", () => {
  it("public-matchmaking path is the Play Now entry when rollout is enabled", () => {
    const path = resolvePlayNowEntryPath();
    assert.equal(path, "public-matchmaking");
    assert.notEqual(path, "private-create");
  });
});

describe("public Play Now client integration", () => {
  it("routes Play Now to public matchmaking with client flag on", () => {
    assert.equal(MIXED_PUBLIC_TABLES_CLIENT_ENABLED, true);
    assert.equal(resolvePlayNowEntryPath(), "public-matchmaking");
  });

  it("app.js wires public handoff and queue cleanup", () => {
    const appJs = readFileSync(join(process.cwd(), "docs/app.js"), "utf8");
    assert.match(appJs, /triggerSessionPlay\("play-now-public"\)/);
    assert.match(appJs, /gameLeavePublicTable/);
    assert.match(appJs, /roomHasMixedPublicTables/);
    assert.match(appJs, /clearPublicTableQueueBestEffort/);
  });
});
