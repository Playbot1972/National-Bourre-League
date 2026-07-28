/**
 * Chip pack catalog + purchase flow tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHIP_PURCHASE_PACKS,
  formatChipAmount,
  formatPackPrice,
  getChipPackById,
} from "../docs/chip-packs.js";

describe("chip-packs", () => {
  it("defines five canonical IAP packs", () => {
    assert.equal(CHIP_PURCHASE_PACKS.length, 5);
    assert.deepEqual(
      CHIP_PURCHASE_PACKS.map((p) => p.id),
      ["starter", "popular", "value", "big_winner", "whale"],
    );
    assert.equal(getChipPackById("popular")?.chips, 50_000);
    assert.equal(getChipPackById("value")?.badge, "best_value");
    assert.equal(getChipPackById("popular")?.badge, "popular");
  });

  it("formats chip amounts and prices for UI", () => {
    assert.equal(formatChipAmount(10000), "10,000");
    assert.equal(formatPackPrice(4.99), "$4.99");
  });

  it("chip-purchase.js imports CHIP_PURCHASE_PACKS before re-export", () => {
    const src = readRepoFile("docs/chip-purchase.js");
    assert.match(src, /import \{[^}]*CHIP_PURCHASE_PACKS[^}]*\} from "\.\/chip-packs\.js"/);
    assert.match(src, /export \{ CHIP_PURCHASE_PACKS/);
  });
});

describe("rebuy table UI wiring", () => {
  it("TableSessionView opens purchase modal instead of legacy onRebuy when rebuyPurchase is set", () => {
    const src = readRepoFile("src/table/TableSessionView.tsx");
    assert.match(src, /rebuyPurchase/);
    assert.match(src, /setRebuyModalOpen\(true\)/);
    assert.match(src, /RebuyPurchaseModal/);
    assert.match(src, /data-testid="rebuy-button"/);
  });

  it("shows rebuy offer when hero is out without requiring rebuyEnabled house rule", () => {
    const src = readRepoFile("src/table/TableSessionView.tsx");
    assert.doesNotMatch(src, /rebuyEnabled &&[\s\S]*showRebuyOffer/);
    assert.match(src, /selfPlayer\?\.isOut === true/);
  });

  it("app builds rebuyPurchase config with all packs", () => {
    const appSrc = readRepoFile("docs/app.js");
    assert.match(appSrc, /buildRebuyPurchaseConfig/);
    assert.match(appSrc, /CHIP_PURCHASE_PACKS\.map/);
    assert.match(appSrc, /purchaseChipPackAndGrant/);
    assert.match(appSrc, /applyFreeSessionRebuy/);
  });
});

describe("chip purchase server path", () => {
  it("exports grant + free rebuy callables from functions index", () => {
    const indexSrc = readRepoFile("functions/index.js");
    assert.match(indexSrc, /gameGrantChipPurchase/);
    assert.match(indexSrc, /gameApplyFreeSessionRebuy/);
  });

  it("uses idempotent grant collection", () => {
    const src = readRepoFile("functions/chipPurchase.js");
    assert.match(src, /chipPurchaseGrants/);
    assert.match(src, /already_granted/);
    assert.match(src, /chip-purchase:/);
  });

  it("firestore rules block client writes to chipPurchaseGrants", () => {
    const rules = readRepoFile("firestore.rules");
    assert.match(rules, /chipPurchaseGrants/);
    assert.match(rules, /allow write: if false/);
  });
});

function readRepoFile(path) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  return readFileSync(join(root, path), "utf8");
}
