import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOTS_ONLY_BOT_COUNT_WEIGHTS,
  pickBotsOnlyBotCount,
} from "../docs/play-now.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicTableJs = readFileSync(join(root, "functions/publicTable.js"), "utf8");

describe("pickBotsOnlyBotCount", () => {
  it("only chooses bot counts 2 through 7", () => {
    for (let i = 0; i < 500; i += 1) {
      const count = pickBotsOnlyBotCount(() => i / 500);
      assert.ok(count >= 2);
      assert.ok(count <= 7);
    }
  });

  it("respects configured weights (6 and 7 less likely than 2–5)", () => {
    const samples = 20_000;
    const counts = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (let i = 0; i < samples; i += 1) {
      const count = pickBotsOnlyBotCount(Math.random);
      counts[count] += 1;
    }
    const lowBucket = (counts[2] + counts[3] + counts[4] + counts[5]) / samples;
    const highBucket = (counts[6] + counts[7]) / samples;
    assert.ok(lowBucket > highBucket, `expected 2–5 > 6–7; got ${lowBucket} vs ${highBucket}`);
    assert.ok(counts[6] > counts[7], "weight 6 should exceed weight 7");
    assert.equal(
      Object.values(BOTS_ONLY_BOT_COUNT_WEIGHTS).reduce((a, b) => a + b, 0),
      100,
    );
  });

  it("is deterministic for a fixed rng sequence at creation time", () => {
    const rng = (() => {
      let s = 0.31;
      return () => {
        s = (s * 1.37) % 1;
        return s;
      };
    })();
    const first = pickBotsOnlyBotCount(rng);
    const second = pickBotsOnlyBotCount(rng);
    assert.notEqual(first, second);
    assert.ok(first >= 2 && first <= 7);
    assert.ok(second >= 2 && second <= 7);
  });
});

describe("bots-only create wiring", () => {
  it("rolls bot count once in createPublicTable and persists on room doc", () => {
    assert.match(publicTableJs, /botsOnlyBotCount = pickBotsOnlyBotCount\(\)/);
    assert.match(publicTableJs, /resolvedTargetSeatCount = botsOnlyBotCount \+ 1/);
    assert.match(publicTableJs, /botsOnlyBotCount \!= null \? \{ botsOnlyBotCount \}/);
    assert.doesNotMatch(
      publicTableJs.slice(
        publicTableJs.indexOf("if (botsOnly) {"),
        publicTableJs.indexOf("} else {", publicTableJs.indexOf("if (botsOnly) {")),
      ),
      /pickBotsOnlyBotCount[\s\S]*pickBotsOnlyBotCount/,
    );
  });

  it("mixed create path does not use pickBotsOnlyBotCount", () => {
    const mixedCreate = publicTableJs.slice(
      publicTableJs.indexOf("resolvedTargetSeatCount = clampTargetSeatCount"),
      publicTableJs.indexOf("const botCount = botsOnly"),
    );
    assert.doesNotMatch(mixedCreate, /pickBotsOnlyBotCount/);
  });
});
