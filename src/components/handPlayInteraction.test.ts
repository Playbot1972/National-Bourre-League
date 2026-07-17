import assert from "node:assert/strict";
import test from "node:test";
import { resolveHandPlayCardInteraction } from "./handPlayInteraction";

const onTurnLegal = {
  isPlayMode: true,
  isMyTurn: true,
  legalPlay: true,
  busy: false,
  allowPlayPreselect: true,
  showPlayableHint: true,
  index: 2,
};

test("recommended card stays interactive but skips ambient green outline", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    cardState: "play-recommended",
    playableHintFor: () => false,
  });
  assert.equal(result.playInteractive, true);
  assert.equal(result.playableOutline, false);
});

test("preselected card stays interactive after failed submit path", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    cardState: "play-preselected",
    playableHintFor: () => false,
  });
  assert.equal(result.playInteractive, true);
  assert.equal(result.playableOutline, false);
});

test("tier-3 legal card gets green outline when hint resolver says legal-playable", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    cardState: "default",
    playableHintFor: () => true,
  });
  assert.equal(result.playInteractive, true);
  assert.equal(result.playableOutline, true);
});

test("out-of-turn legal card is preselectable without green outline", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    isMyTurn: false,
    cardState: "default",
    playableHintFor: () => false,
  });
  assert.equal(result.playInteractive, true);
  assert.equal(result.playableOutline, false);
});

test("illegal on-turn card is not interactive", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    legalPlay: false,
    cardState: "muted",
  });
  assert.equal(result.playInteractive, false);
  assert.equal(result.playableOutline, false);
});

test("hero on-turn legal card stays interactive when not busy", () => {
  const result = resolveHandPlayCardInteraction({
    ...onTurnLegal,
    cardState: "default",
  });
  assert.equal(result.playInteractive, true);
});
