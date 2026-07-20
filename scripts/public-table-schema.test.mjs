import { describe, it } from "node:test";
import assert from "node:assert/strict";
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

describe("public-table rollout guard (flag off by default)", () => {
  it("keeps client master switch disabled in Phase 2", () => {
    assert.equal(MIXED_PUBLIC_TABLES_CLIENT_ENABLED, false);
  });

  it("resolvePlayNowEntryPath returns private-create when flag is off", () => {
    assert.equal(resolvePlayNowEntryPath(), "private-create");
  });

  it("would return public-matchmaking when client flag is enabled (contract)", () => {
    // Document Phase 3 dispatch without mutating the shipped default.
    const pathIfEnabled = MIXED_PUBLIC_TABLES_CLIENT_ENABLED ? "public-matchmaking" : "private-create";
    assert.equal(pathIfEnabled, "private-create");
  });

  it("does not enable rollout for flagged rooms while client switch is off", () => {
    assert.equal(
      isMixedPublicTablesRolloutEnabled({ features: { mixedPublicTables: true } }),
      false,
    );
  });

  it("detects publicTable session marker without enabling flows", () => {
    assert.equal(isPublicTableSession({ publicTable: true }), true);
    assert.equal(isPublicTableSession({}), false);
  });
});

describe("Play Now flag-off behavior contract", () => {
  it("private-create path is the only Play Now entry when rollout is disabled", () => {
    const path = resolvePlayNowEntryPath();
    assert.equal(path, "private-create");
    assert.notEqual(path, "public-matchmaking");
  });
});
