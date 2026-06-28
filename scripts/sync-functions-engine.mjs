#!/usr/bin/env node
/**
 * Copy built game engine + settlement helpers into functions/vendor for Cloud Functions.
 * Run after: npm run build:game
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendor = join(root, "functions", "vendor");

mkdirSync(vendor, { recursive: true });

const copies = [
  ["docs/game-engine.js", "game-engine.js"],
  ["docs/bourre-rules.js", "bourre-rules.js"],
  ["docs/risk-stakes.js", "risk-stakes.js"],
  ["docs/session-startup.js", "session-startup.js"],
  ["docs/play-now.js", "play-now.js"],
  ["docs/bot-rebuy.js", "bot-rebuy.js"],
];

for (const [src, dest] of copies) {
  copyFileSync(join(root, src), join(vendor, dest));
  console.log(`synced ${src} → functions/vendor/${dest}`);
}
