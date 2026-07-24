import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

describe("public-table idle join recon (client)", () => {
  it("does not run periodic activity heartbeat (45s idle must not be defeated)", () => {
    const src = readFileSync(join(root, "../docs/app.js"), "utf8");
    const start = src.indexOf("function startPublicTableActivityHeartbeat");
    assert.ok(start >= 0);
    const block = src.slice(start, start + 700);
    assert.doesNotMatch(
      block,
      /setInterval\([\s\S]*touchPublicTableActivityBestEffort/,
      "periodic heartbeat must not bump lastActivityTimestamp",
    );
    assert.match(block, /bindPublicTableActivityGestures/);
    assert.match(block, /touchPublicTableActivityBestEffort\(\{ force: true \}\)/);
  });

  it("buildTablePlayerSeatFlags suppresses turn urgency for idle sit-out humans", () => {
    const src = readFileSync(join(root, "../docs/table-view-model.js"), "utf8");
    assert.match(src, /isOnTurn:\s*\n\s*sc\.sitOut !== true && cardsDealt/);
    assert.match(src, /isActiveActor:\s*\n\s*sc\.sitOut === true\s*\n\s*\?\s*false/);
  });

  it("TableSessionView passes sitOutPlayerIds into turn countdown hooks", () => {
    const src = readFileSync(join(root, "../src/table/TableSessionView.tsx"), "utf8");
    assert.match(src, /sitOutPlayerIds/);
    assert.match(src, /players\.filter\(\(p\) => p\.idleSitOut\)/);
    assert.match(src, /useTurnCountdown\(\{[\s\S]*sitOutPlayerIds/);
    assert.match(src, /useTurnTimerWarning\(\{[\s\S]*sitOutPlayerIds/);
  });
});
