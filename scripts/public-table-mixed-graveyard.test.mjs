/**
 * Mixed matchmaking must not fall back to bots-only when user selects mixed.
 */
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("public-table mixed graveyard routing", () => {
  it("handleFindOrCreatePublicTable does not create BOTS_ONLY on mixed graveyard", () => {
    const src = readFileSync(new URL("../functions/publicTable.js", import.meta.url), "utf8");
    const fnStart = src.indexOf("export async function handleFindOrCreatePublicTable");
    assert.ok(fnStart >= 0);
    const fnBody = src.slice(fnStart, fnStart + 4500);
    assert.doesNotMatch(fnBody, /sawBotGraveyard[\s\S]*queueMode:\s*PLAY_NOW_QUEUE_MODE\.BOTS_ONLY/);
    assert.match(fnBody, /createMixedPublicTableOrJoinPool/);
    assert.match(fnBody, /queueMode:\s*PLAY_NOW_QUEUE_MODE\.MIXED/);
  });
});
