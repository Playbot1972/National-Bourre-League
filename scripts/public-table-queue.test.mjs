import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearStoredPublicTableJoinId,
  createPublicTableJoinId,
  forceNewPublicTableJoinId,
  isPublicTableJoinIdMismatchError,
  loadStoredPublicTableJoinId,
  resolvePublicTableJoinId,
  saveStoredPublicTableJoinId,
} from "../docs/public-table-queue.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const memory = new Map();

function installLocalStorageMock() {
  globalThis.localStorage = {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
    removeItem(key) {
      memory.delete(key);
    },
    clear() {
      memory.clear();
    },
  };
}

describe("public-table joinId persistence", () => {
  beforeEach(() => {
    memory.clear();
    installLocalStorageMock();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("reuses stored joinId for the same user (app restart resume)", () => {
    const first = resolvePublicTableJoinId("user_a");
    assert.equal(first.resumed, false);
    const second = resolvePublicTableJoinId("user_a");
    assert.equal(second.resumed, true);
    assert.equal(second.joinId, first.joinId);
  });

  it("does not reuse joinId across different users", () => {
    const a = resolvePublicTableJoinId("user_a");
    const b = resolvePublicTableJoinId("user_b");
    assert.notEqual(a.joinId, b.joinId);
  });

  it("forceNewPublicTableJoinId replaces stale local joinId after cleanup", () => {
    const first = resolvePublicTableJoinId("user_a").joinId;
    const next = forceNewPublicTableJoinId("user_a");
    assert.notEqual(next, first);
    assert.equal(loadStoredPublicTableJoinId("user_a"), next);
  });

  it("clearStoredPublicTableJoinId removes persisted state", () => {
    saveStoredPublicTableJoinId("user_a", "join-123");
    clearStoredPublicTableJoinId("user_a");
    assert.equal(loadStoredPublicTableJoinId("user_a"), null);
  });

  it("createPublicTableJoinId returns a non-empty string", () => {
    const id = createPublicTableJoinId();
    assert.match(id, /.+/, "joinId should be non-empty");
  });
});

describe("public-table joinId mismatch detection", () => {
  it("detects active queue joinId conflicts from callable errors", () => {
    assert.equal(
      isPublicTableJoinIdMismatchError({
        code: "functions/already-exists",
        message: "You already have an active public table queue with a different joinId.",
      }),
      true,
    );
    assert.equal(
      isPublicTableJoinIdMismatchError({
        code: "already-exists",
        message: "You already have an active public table queue with a different joinId.",
      }),
      true,
    );
    assert.equal(
      isPublicTableJoinIdMismatchError({
        code: "functions/already-exists",
        message: "You are already seated at this table.",
      }),
      false,
    );
  });
});

describe("Play Now client wiring", () => {
  it("reuses persisted joinId and recovers on mismatch", () => {
    const src = readFileSync(join(root, "docs/app.js"), "utf8");
    assert.match(src, /resolvePublicTableJoinId\(uid\)/);
    assert.match(src, /isPublicTableJoinIdMismatchError\(err\)/);
    assert.match(src, /recoverPublicTableQueueAndRetry/);
    assert.match(src, /PUBLIC_TABLE_QUEUE_RESUME_MESSAGE/);
    assert.match(src, /PUBLIC_TABLE_QUEUE_RECOVERY_MESSAGE/);
    assert.match(src, /playNowInFlight \|\| playNowBtn\?\.disabled/);
    assert.match(src, /clearStoredPublicTableJoinId\(session\.uid\)/);
  });
});

describe("double-tap Play Now guard", () => {
  it("sets playNowInFlight before awaiting matchmaking", () => {
    const src = readFileSync(join(root, "docs/app.js"), "utf8");
    const idx = src.indexOf("async function runPlayNowFlow()");
    const body = src.slice(idx, idx + 1200);
    const inFlightBeforeAwait =
      body.indexOf("playNowInFlight = true") < body.indexOf("callPublicPlayNowMatchmaking");
    assert.equal(inFlightBeforeAwait, true);
  });
});
