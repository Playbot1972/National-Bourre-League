import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLAY_NOW_QUEUE_MODE,
  loadPlayNowQueueMode,
  playNowMatchmakingStatusMessage,
  playNowQueueModeDescription,
  playNowQueueModeShortLabel,
  playNowWatchOnlyMessage,
  savePlayNowQueueMode,
} from "../docs/play-now-queue-mode.js";
import {
  normalizePlayNowQueueMode,
  resolvePublicTableQueueMode,
} from "../docs/public-table-schema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(join(root, "docs/index.html"), "utf8");
const appJs = readFileSync(join(root, "docs/app.js"), "utf8");
const publicTableJs = readFileSync(join(root, "functions/publicTable.js"), "utf8");

describe("Play Now queue mode helpers", () => {
  it("defaults unknown values to mixed", () => {
    assert.equal(normalizePlayNowQueueMode(undefined), PLAY_NOW_QUEUE_MODE.MIXED);
    assert.equal(normalizePlayNowQueueMode("nope"), PLAY_NOW_QUEUE_MODE.MIXED);
    assert.equal(normalizePlayNowQueueMode(PLAY_NOW_QUEUE_MODE.BOTS_ONLY), PLAY_NOW_QUEUE_MODE.BOTS_ONLY);
  });

  it("labels and status copy are mode-specific", () => {
    assert.equal(playNowQueueModeShortLabel(PLAY_NOW_QUEUE_MODE.MIXED), "Mixed");
    assert.equal(playNowQueueModeShortLabel(PLAY_NOW_QUEUE_MODE.BOTS_ONLY), "Bots only");
    assert.match(playNowMatchmakingStatusMessage(PLAY_NOW_QUEUE_MODE.MIXED), /mixed/i);
    assert.match(playNowMatchmakingStatusMessage(PLAY_NOW_QUEUE_MODE.BOTS_ONLY), /bots-only/i);
    assert.match(playNowWatchOnlyMessage(PLAY_NOW_QUEUE_MODE.MIXED), /Mixed table/);
    assert.match(playNowQueueModeDescription(PLAY_NOW_QUEUE_MODE.BOTS_ONLY), /bots/i);
  });

  it("persists selected mode in localStorage", () => {
    const store = new Map();
    const prior = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
      removeItem: (key) => {
        store.delete(key);
      },
    };
    try {
      savePlayNowQueueMode(PLAY_NOW_QUEUE_MODE.BOTS_ONLY);
      assert.equal(loadPlayNowQueueMode(), PLAY_NOW_QUEUE_MODE.BOTS_ONLY);
      savePlayNowQueueMode(PLAY_NOW_QUEUE_MODE.MIXED);
      assert.equal(loadPlayNowQueueMode(), PLAY_NOW_QUEUE_MODE.MIXED);
    } finally {
      globalThis.localStorage = prior;
    }
  });
});

describe("Play Now queue mode wiring", () => {
  it("rooms UI exposes mixed and bots-only selector before Play Now", () => {
    const playIdx = indexHtml.indexOf('data-testid="play-now"');
    const modeIdx = indexHtml.indexOf('data-testid="play-now-mode"');
    assert.ok(modeIdx >= 0);
    assert.ok(playIdx >= 0);
    assert.ok(modeIdx < playIdx);
    assert.match(indexHtml, /name="play-now-mode" value="mixed"/);
    assert.match(indexHtml, /name="play-now-mode" value="bots_only"/);
    assert.match(indexHtml, /checked/);
  });

  it("app passes queueMode to public matchmaking callable", () => {
    assert.match(appJs, /readPlayNowQueueModeFromDom\(\)/);
    assert.match(appJs, /queueMode,\s*\n\s*displayName: session\.displayName/);
    assert.match(appJs, /clearStoredPublicTableJoinId\(session\.uid\)/);
  });

  it("server routes bots-only without joinable candidate scan", () => {
    assert.match(publicTableJs, /queueMode === PLAY_NOW_QUEUE_MODE\.BOTS_ONLY/);
    assert.match(publicTableJs, /botsOnlyPublicTables: true/);
    assert.match(publicTableJs, /Bots-only tables do not accept spectators/);
    assert.doesNotMatch(
      publicTableJs.slice(
        publicTableJs.indexOf("if (queueMode === PLAY_NOW_QUEUE_MODE.BOTS_ONLY)"),
        publicTableJs.indexOf("const joinArgs = { actorId"),
      ),
      /attemptJoinJoinableCandidates/,
    );
  });

  it("room features resolve canonical queue mode", () => {
    assert.equal(
      resolvePublicTableQueueMode({ features: { mixedPublicTables: true } }),
      PLAY_NOW_QUEUE_MODE.MIXED,
    );
    assert.equal(
      resolvePublicTableQueueMode({ features: { botsOnlyPublicTables: true } }),
      PLAY_NOW_QUEUE_MODE.BOTS_ONLY,
    );
    assert.equal(resolvePublicTableQueueMode({}), null);
  });
});
