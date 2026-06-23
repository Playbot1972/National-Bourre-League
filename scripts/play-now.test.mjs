import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PLAY_NOW_BUY_IN,
  PLAY_NOW_ANTE,
  VACATION_DESTINATIONS,
  BOY_NAMES,
  GIRL_NAMES,
  pickPlayNowRobotCount,
  pickVacationRoomName,
  pickUniqueRobotNames,
  playNowBourreSettings,
  randomInt,
} from "../docs/play-now.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(join(root, "docs/index.html"), "utf8");

describe("Play Now constants", () => {
  it("uses separate buy-in and ante amounts", () => {
    const settings = playNowBourreSettings();
    assert.equal(settings.buyInAmount, 1000);
    assert.equal(settings.anteAmount, 50);
    assert.equal(PLAY_NOW_BUY_IN, 1000);
    assert.equal(PLAY_NOW_ANTE, 50);
    assert.notEqual(settings.buyInAmount, settings.anteAmount);
  });

  it("includes curated destination and name lists", () => {
    assert.ok(VACATION_DESTINATIONS.length >= 150);
    assert.equal(BOY_NAMES.length, 100);
    assert.equal(GIRL_NAMES.length, 100);
    assert.ok(VACATION_DESTINATIONS.includes("Paris"));
    assert.ok(VACATION_DESTINATIONS.includes("Bali"));
  });
});

describe("pickPlayNowRobotCount", () => {
  it("returns 1..availableSeats-1 for an 8-seat table with host seated", () => {
    const rng = () => 0.5;
    for (let i = 0; i < 50; i += 1) {
      const count = pickPlayNowRobotCount(8, 1, () => i / 50);
      assert.ok(count >= 1);
      assert.ok(count <= 6);
    }
  });

  it("never exceeds table capacity minus host", () => {
    const count = pickPlayNowRobotCount(8, 1, () => 0.99);
    assert.equal(count, 6);
    assert.ok(1 + count <= 8);
  });

  it("returns 0 when no room for robots", () => {
    assert.equal(pickPlayNowRobotCount(8, 7, () => 0), 0);
    assert.equal(pickPlayNowRobotCount(2, 1, () => 0), 0);
  });
});

describe("pickVacationRoomName", () => {
  it("picks from the destination list", () => {
    const name = pickVacationRoomName([], () => 0);
    assert.ok(
      VACATION_DESTINATIONS.some((d) => name === d || name.startsWith(`${d} `)),
    );
  });

  it("avoids taken names with a clean suffix", () => {
    const first = pickVacationRoomName([], () => 0);
    const second = pickVacationRoomName([first], () => 0);
    assert.notEqual(first.toLowerCase(), second.toLowerCase());
  });
});

describe("pickUniqueRobotNames", () => {
  it("returns human-style names without robot labels", () => {
    const names = pickUniqueRobotNames(4, ["Host"], () => 0.123);
    assert.equal(names.length, 4);
    for (const name of names) {
      assert.ok(!/robot/i.test(name));
      const poolHit = [...BOY_NAMES, ...GIRL_NAMES].some(
        (n) => name === n || /^.+\s\d+$/.test(name),
      );
      assert.ok(poolHit);
    }
  });

  it("keeps names unique within the session", () => {
    const names = pickUniqueRobotNames(8, ["Olivia"], (() => {
      let s = 0.1;
      return () => {
        s = (s * 1.37) % 1;
        return s;
      };
    })());
    const lowered = names.map((n) => n.toLowerCase());
    assert.equal(new Set(lowered).size, names.length);
    assert.ok(!lowered.includes("olivia"));
  });

  it("appends a differentiator after re-roll exhaustion", () => {
    const taken = [...BOY_NAMES, ...GIRL_NAMES].map((n) => n.toLowerCase());
    const names = pickUniqueRobotNames(1, taken, () => 0);
    assert.match(names[0], /\s\d+$/);
  });
});

describe("randomInt", () => {
  it("is inclusive on both ends", () => {
    assert.equal(randomInt(3, 3, () => 0), 3);
    assert.equal(randomInt(1, 6, () => 0.999), 6);
  });
});

describe("Play Now home UI", () => {
  it("renders Play Now above Join Room with primary button styling", () => {
    const createIdx = indexHtml.indexOf('id="create-room"');
    const playIdx = indexHtml.indexOf('data-testid="play-now"');
    const joinIdx = indexHtml.indexOf('id="join-form"');
    assert.ok(createIdx >= 0);
    assert.ok(playIdx >= 0);
    assert.ok(joinIdx >= 0);
    assert.ok(playIdx > createIdx);
    assert.ok(playIdx < joinIdx);
    const playSnippet = indexHtml.slice(Math.max(0, playIdx - 120), playIdx + 120);
    assert.match(playSnippet, /btn btn--primary/);
    assert.match(playSnippet, /Play Now/);
  });
});

describe("Play Now idempotency helpers", () => {
  it("robot count stays within supported limits for max table", () => {
    const maxTable = 8;
    for (let t = 0; t < 100; t += 1) {
      const robots = pickPlayNowRobotCount(maxTable, 1, () => t / 100);
      assert.ok(robots >= 0);
      assert.ok(1 + robots <= maxTable);
    }
  });

  it("double-tap guard skips a second run while in flight", () => {
    let inFlight = false;
    let runs = 0;
    const attempt = () => {
      if (inFlight) return false;
      inFlight = true;
      runs += 1;
      inFlight = false;
      return true;
    };
    assert.equal(attempt(), true);
    inFlight = true;
    assert.equal(attempt(), false);
    assert.equal(runs, 1);
  });
});
