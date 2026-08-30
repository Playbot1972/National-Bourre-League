import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import {
  isHeroDrawOrPlayTurn,
  suppressTurnForPlay,
  suppressTurnForVisual,
} from "./localAction";
import { planTapAutoplay } from "./heroHandPlayPreselect";
import { suppressesTurnIndicator } from "./trickTiming";
import type { TablePlayer } from "./types";

const hero: TablePlayer = {
  playerId: "hero",
  displayName: "Hero",
  handsWon: 0,
  inHand: true,
  tricksThisHand: 0,
  isSelf: true,
  isDealer: false,
  isWinner: false,
  canToggleInHand: false,
  canEditTricks: false,
};

function playTurnInput(overrides: {
  turnPlayerId?: string;
  suppressTurnForHeroPlay?: boolean;
  handSuppress?: boolean;
  trickSuppress?: boolean;
} = {}) {
  const trickSuppress = overrides.trickSuppress ?? false;
  const handSuppress = overrides.handSuppress ?? true;
  const visualSuppress = suppressTurnForVisual(trickSuppress, handSuppress);
  const playSuppress = suppressTurnForPlay(trickSuppress);
  return {
    currentUserId: "hero",
    enrollmentActive: false,
    selfPlayer: hero,
    session: {
      phase: "play" as const,
      turnPlayerId: overrides.turnPlayerId ?? "hero",
      drawCompletedIds: ["hero", "bot"],
      participantIds: ["hero", "bot"],
    },
    suppressTurn: overrides.suppressTurnForHeroPlay ?? playSuppress,
    handComplete: false,
    visualSuppress,
    trickSuppress,
    handSuppress,
  };
}

/** Mirrors HeroHand handleTapPlay immediate vs preselect branches. */
function simulateFirstPlayTap(input: {
  isMyTurn: boolean;
  legalPlayIndices: number[];
  tappedIndex: number;
  selectedPlay?: number | null;
}) {
  const selectedPlay = input.selectedPlay ?? null;
  const isLegal = input.legalPlayIndices.includes(input.tappedIndex);
  const plan = planTapAutoplay({
    selectedPlay,
    tappedIndex: input.tappedIndex,
    isMyTurn: input.isMyTurn,
    isLegal,
  });

  let onPlayCardCalls = 0;
  let cardSelectOnly = false;

  if (plan.shouldImmediatePlay && plan.nextSelection !== null) {
    onPlayCardCalls += 1;
  } else if (plan.nextSelection !== null && !plan.isDeselect) {
    cardSelectOnly = true;
  }

  return { plan, onPlayCardCalls, cardSelectOnly };
}

describe("hero play submit gate", () => {
  it("confirmed regression: hero play turn ignores hand draw presentation suppress", () => {
    const input = playTurnInput({ handSuppress: true, trickSuppress: false });
    assert.equal(input.visualSuppress, true);
    assert.equal(input.suppressTurn, false);

    const isMyTurn = isHeroDrawOrPlayTurn(input);
    assert.equal(isMyTurn, true);

    const tap = simulateFirstPlayTap({
      isMyTurn,
      legalPlayIndices: [2],
      tappedIndex: 2,
    });
    assert.equal(tap.plan.shouldImmediatePlay, true);
    assert.equal(tap.plan.shouldQueueSelection, false);
    assert.equal(tap.onPlayCardCalls, 1);
    assert.equal(tap.cardSelectOnly, false);
  });

  it("off-turn preservation: no submit while another player owns turn", () => {
    for (const handSuppress of [true, false]) {
      const input = playTurnInput({
        turnPlayerId: "bot",
        handSuppress,
        trickSuppress: false,
      });
      const isMyTurn = isHeroDrawOrPlayTurn(input);
      assert.equal(isMyTurn, false);

      const tap = simulateFirstPlayTap({
        isMyTurn,
        legalPlayIndices: [2],
        tappedIndex: 2,
      });
      assert.equal(tap.plan.shouldQueueSelection, true);
      assert.equal(tap.plan.shouldImmediatePlay, false);
      assert.equal(tap.onPlayCardCalls, 0);
      assert.equal(tap.cardSelectOnly, true);
    }
  });

  it("real trick lock: suppressTurnPlayerId blocks hero play submit", () => {
    const lockedPhases = ["trickComplete", "winnerReveal", "collectTrick"] as const;
    for (const phase of lockedPhases) {
      const trickSuppress =
        phase === "collectTrick" ? true : suppressesTurnIndicator(phase);
      const input = playTurnInput({ trickSuppress, handSuppress: false });
      const isMyTurn = isHeroDrawOrPlayTurn(input);
      assert.equal(isMyTurn, false, `phase ${phase}`);

      const tap = simulateFirstPlayTap({
        isMyTurn,
        legalPlayIndices: [1],
        tappedIndex: 1,
      });
      assert.equal(tap.onPlayCardCalls, 0, `phase ${phase}`);
    }
  });

  it("normal completed draw: first tap submits exactly once", () => {
    const input = playTurnInput({ handSuppress: false, trickSuppress: false });
    const isMyTurn = isHeroDrawOrPlayTurn(input);
    assert.equal(isMyTurn, true);

    const tap = simulateFirstPlayTap({
      isMyTurn,
      legalPlayIndices: [0, 2, 4],
      tappedIndex: 2,
    });
    assert.equal(tap.onPlayCardCalls, 1);
    assert.equal(tap.cardSelectOnly, false);
  });

  it("routing preservation: table paths still use server-only playHandCard routing", () => {
    const firestore = readFileSync(new URL("../../docs/firestore.js", import.meta.url), "utf8");
    const playRouting = readFileSync(
      new URL("../../docs/game-play-routing.js", import.meta.url),
      "utf8",
    );
    const fnStart = firestore.indexOf("export async function playHandCard");
    const fnEnd = firestore.indexOf("async function playHandCardClient");
    const fnBody = firestore.slice(fnStart, fnEnd);
    assert.match(fnBody, /routePlayHandCard/);
    assert.match(fnBody, /serverFn:\s*\(\)\s*=>\s*gamePlayCard/);
    assert.match(playRouting, /serverHandAuthority/);
  });

  it("audio: regression case does not take cardSelect-only queue branch", () => {
    const input = playTurnInput({ handSuppress: true, trickSuppress: false });
    const isMyTurn = isHeroDrawOrPlayTurn(input);
    const tap = simulateFirstPlayTap({
      isMyTurn,
      legalPlayIndices: [3],
      tappedIndex: 3,
    });
    assert.equal(tap.cardSelectOnly, false);
    assert.equal(tap.plan.shouldImmediatePlay, true);
  });

  it("CardTable and MobileCardTable wire play suppress separately from visual suppress", () => {
    for (const file of ["CardTable.tsx", "MobileCardTable.tsx"] as const) {
      const src = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      assert.match(src, /suppressTurnForPlay/);
      assert.match(src, /suppressTurnForVisual/);
      assert.match(src, /suppressTurn:\s*suppressTurnForHeroPlay/);
      assert.match(src, /suppressTurn=\{Boolean\(suppressTurn\)\}/);
    }
  });
});
