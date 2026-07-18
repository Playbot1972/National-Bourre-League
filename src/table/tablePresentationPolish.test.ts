import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { CARDS_PER_PLAYER } from "../game/playerOrder";
import {
  ANTE_CHIP_TRAVEL_MS,
  antePresentationFlightMs,
  DRAW_RING_BEAT_MS,
  drawSubPhaseSuppressesTurnRing,
} from "./handPresentationTiming";
import { dealPresentationDurationMs } from "./animations/dealPresentationMotion";
import { suppressesTurnIndicator } from "./trickTiming";
import {
  CARD_LAND_MS,
  POST_TRICK_READ_MS,
  TRICK_CARD_SETTLE_MS,
  TRICK_CARD_TRAVEL_MS,
  TRICK_SWEEP_MS,
  WINNER_REVEAL_MS,
} from "./trickTiming";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardAnimationsCss = readFileSync(join(__dirname, "cardAnimations.css"), "utf8");

describe("table presentation polish safety", () => {
  it("keeps authoritative timing constants unchanged", () => {
    assert.equal(TRICK_CARD_TRAVEL_MS, 520);
    assert.equal(TRICK_CARD_SETTLE_MS, 130);
    assert.equal(CARD_LAND_MS, 650);
    assert.equal(POST_TRICK_READ_MS, 550);
    assert.equal(WINNER_REVEAL_MS, 380);
    assert.equal(TRICK_SWEEP_MS, 780);
    assert.equal(ANTE_CHIP_TRAVEL_MS, 290);
    assert.equal(DRAW_RING_BEAT_MS, 340);
  });

  it("does not extend ante or deal schedules with polish", () => {
    const anteFlight = antePresentationFlightMs(6, false);
    assert.ok(anteFlight >= 600 && anteFlight <= 900);
    const dealMs = dealPresentationDurationMs(6 * CARDS_PER_PLAYER, false);
    assert.ok(dealMs >= 1800 && dealMs <= 2400);
  });

  it("keeps draw ring visible and suppresses turn ring only during discard/receive", () => {
    assert.equal(drawSubPhaseSuppressesTurnRing("ring"), false);
    assert.equal(drawSubPhaseSuppressesTurnRing("discard"), true);
    assert.equal(drawSubPhaseSuppressesTurnRing("receive"), true);
    assert.equal(drawSubPhaseSuppressesTurnRing("done"), false);
  });

  it("keeps turn suppression limited to trick read phases", () => {
    assert.equal(suppressesTurnIndicator("live"), false);
    assert.equal(suppressesTurnIndicator("trickComplete"), true);
    assert.equal(suppressesTurnIndicator("winnerReveal"), true);
    assert.equal(suppressesTurnIndicator("collectTrick"), false);
    assert.equal(suppressesTurnIndicator("nextLeadReady"), false);
  });

  it("syncs CSS cosmetic fallbacks to authoritative trick timing", () => {
    assert.match(cardAnimationsCss, /--trick-card-travel-ms:\s*520ms/);
    assert.match(cardAnimationsCss, /--trick-card-settle-ms:\s*130ms/);
    assert.match(cardAnimationsCss, /--trick-sweep-ms:\s*780ms/);
    assert.match(cardAnimationsCss, /--trick-winner-highlight-ms:\s*380ms/);
  });

  it("includes reduced-motion overrides for deal reveal polish", () => {
    assert.match(
      cardAnimationsCss,
      /prefers-reduced-motion: reduce[\s\S]*deal-card--revealed[\s\S]*pcard__surface/,
    );
  });
});
