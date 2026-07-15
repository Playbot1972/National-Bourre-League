import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  phaseScheduleMs,
  reduceHandPresentation,
  snapshotFromSession,
} from "./handPresentationMachine";
import { setApeSpeedModeEnabledForTests } from "./handPacingMode";
import {
  buildTurnCountdownState,
  resolveTurnCountdownActiveActorId,
  turnCountdownActivityKey,
} from "./turnCountdown";

const drawSnap = snapshotFromSession({
  sessionId: "s-first-draw",
  handNumber: 2,
  phase: "draw",
  participantIds: ["p-dealer", "p-next", "p-hero"],
  actionOrder: ["p-next", "p-hero", "p-dealer"],
  drawCompletedIds: [],
  turnPlayerId: "p-next",
  dealerId: "p-dealer",
  potAmount: 6,
});

function advanceAnteIntoFirstDraw(
  trumpUpcard: { rank: string; suit: string } | null,
): ReturnType<typeof createHandPresentationStore> {
  let store = createHandPresentationStore({
    ...drawSnap,
    phase: "reveal",
    trumpUpcard,
  });
  store = reduceHandPresentation(store, {
    type: "serverUpdate",
    snapshot: { ...drawSnap, phase: "draw", trumpUpcard },
  });
  if (store.phase === "ante") {
    store = reduceHandPresentation(store, { type: "advancePhase" });
  }
  if (store.phase === "trumpReveal") {
    store = reduceHandPresentation(store, { type: "advancePhase" });
  }
  return store;
}

function firstDrawCountdownInput(
  store: ReturnType<typeof createHandPresentationStore>,
  pacingMode: "classic" | "apeSpeed",
) {
  const model = buildHandPresentationModel(store);
  return {
    session: {
      phase: "draw" as const,
      turnPlayerId: drawSnap.turnPlayerId,
      drawCompletedIds: drawSnap.drawCompletedIds,
      participantIds: drawSnap.participantIds,
      tricksByPlayer: {},
      handNumber: drawSnap.handNumber,
    },
    suppressTurn: model.suppressTurnIndicator,
    handComplete: false,
    ante: model.anteAnimActive
      ? {
          anteAnimActive: true,
          presentationKey: "session:2:ante",
          handNumber: drawSnap.handNumber,
          playerIds: drawSnap.participantIds,
          reducedMotion: false,
          pacingMode,
        }
      : null,
  };
}

describe("first draw turn countdown", () => {
  it("clears anteAnimActive when ante advances into idle first draw", () => {
    const store = advanceAnteIntoFirstDraw(null);
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.anteAnimActive, false);
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(buildHandPresentationModel(store).suppressTurnIndicator, false);
  });

  it("clears anteAnimActive when trump reveal advances into idle first draw", () => {
    const store = advanceAnteIntoFirstDraw({ rank: "A", suit: "hearts" });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.anteAnimActive, false);
    assert.equal(buildHandPresentationModel(store).suppressTurnIndicator, false);
  });

  it("shows the ring on the first draw actor in classic pacing", () => {
    setApeSpeedModeEnabledForTests(false);
    const store = advanceAnteIntoFirstDraw(null);
    const input = firstDrawCountdownInput(store, "classic");
    const actor = resolveTurnCountdownActiveActorId(input);
    assert.equal(actor, "p-next");
    assert.equal(input.suppressTurn, false);
  });

  it("shows the ring on the first draw actor in Ape S. Mode", () => {
    setApeSpeedModeEnabledForTests(true);
    const store = advanceAnteIntoFirstDraw(null);
    const input = firstDrawCountdownInput(store, "apeSpeed");
    const actor = resolveTurnCountdownActiveActorId(input);
    assert.equal(actor, "p-next");
    assert.equal(input.suppressTurn, false);
  });

  it("spins the ring on first draw (progress decreases over time)", () => {
    const store = advanceAnteIntoFirstDraw(null);
    const input = firstDrawCountdownInput(store, "classic");
    const actor = resolveTurnCountdownActiveActorId(input);
    assert.equal(actor, "p-next");

    const started = 5_000_000;
    const early = buildTurnCountdownState(actor!, started, started + 500);
    const later = buildTurnCountdownState(actor!, started, started + 2_000);
    assert.ok(early);
    assert.ok(later);
    assert.ok(early!.progress > later!.progress);
    assert.equal(early!.playerId, "p-next");
    assert.equal(later!.playerId, "p-next");
  });

  it("activity key arms the ring when first draw becomes eligible", () => {
    const store = advanceAnteIntoFirstDraw(null);
    const model = buildHandPresentationModel(store);
    const suppressedKey = turnCountdownActivityKey({
      session: {
        phase: "draw",
        turnPlayerId: "p-next",
        drawCompletedIds: [],
        participantIds: drawSnap.participantIds,
        tricksByPlayer: {},
        handNumber: 2,
      },
      suppressTurn: true,
      handComplete: false,
      activeActorId: null,
    });
    const activeKey = turnCountdownActivityKey({
      session: {
        phase: "draw",
        turnPlayerId: "p-next",
        drawCompletedIds: [],
        participantIds: drawSnap.participantIds,
        tricksByPlayer: {},
        handNumber: 2,
      },
      suppressTurn: model.suppressTurnIndicator,
      handComplete: false,
      activeActorId: "p-next",
    });
    assert.notEqual(suppressedKey, activeKey);
    assert.match(activeKey, /p-next/);
  });

  it("does not change idle drawPlayer scheduling (bot/player draw timing)", () => {
    const store = advanceAnteIntoFirstDraw(null);
    assert.equal(phaseScheduleMs(store, false, "classic"), 0);
    assert.equal(phaseScheduleMs(store, false, "apeSpeed"), 0);
  });
});
