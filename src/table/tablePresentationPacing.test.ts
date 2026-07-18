import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CARDS_PER_PLAYER } from "../game/playerOrder";
import {
  antePresentationFlightMs,
  antePresentationScheduleMs,
  ANTE_POST_HOLD_MS,
  DRAW_RING_BEAT_MS,
  drawPlayerAnimScheduleMs,
  drawSubPhaseSuppressesTurnRing,
  handTimingScale,
  resolveDrawPresentationRingActor,
  TRUMP_REVEAL_HOLD_MS,
} from "./handPresentationTiming";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  phaseScheduleMs,
  reduceHandPresentation,
  snapshotFromSession,
} from "./handPresentationMachine";
import { canStartDealPresentation } from "./presentationPhaseOwnership";
import {
  dealPresentationDurationMs,
} from "./animations/dealPresentationMotion";
import {
  CARD_LAND_MS,
  NEXT_LEAD_GAP_MS,
  postTrickReadMs,
  trickCardTravelMs,
  trickResolutionScheduleMs,
  TRUMP_BEAT_READ_MS,
} from "./trickTiming";

const drawSnap = snapshotFromSession({
  sessionId: "pace-s1",
  handNumber: 1,
  phase: "draw",
  enrollmentActive: false,
  participantIds: ["p1", "p2", "p3"],
  drawCompletedIds: [],
  turnPlayerId: "p2",
  trumpUpcard: null,
  dealerId: "p1",
  potAmount: 9,
});

describe("table presentation pacing", () => {
  it("keeps ante flight in the 600–900ms window for six seats", () => {
    const flight = antePresentationFlightMs(6, false);
    assert.ok(flight >= 600 && flight <= 900, `ante flight ${flight}ms`);
    const schedule = antePresentationScheduleMs(6, false);
    assert.equal(schedule, flight + ANTE_POST_HOLD_MS);
  });

  it("keeps full deal in the 1.8–2.4s window for six seats", () => {
    const steps = 6 * CARDS_PER_PLAYER;
    const duration = dealPresentationDurationMs(steps, false);
    assert.ok(duration >= 1800 && duration <= 2400, `deal ${duration}ms`);
  });

  it("holds trump reveal in the 800–1200ms band without running long", () => {
    assert.ok(TRUMP_REVEAL_HOLD_MS >= 800 && TRUMP_REVEAL_HOLD_MS <= 1200);
    const t = handTimingScale(false);
    assert.equal(t.trumpRevealHoldMs, TRUMP_REVEAL_HOLD_MS);
  });

  it("uses readable live trick travel and post-trick read windows", () => {
    assert.ok(trickCardTravelMs("live") >= 450 && trickCardTravelMs("live") <= 650);
    assert.ok(postTrickReadMs({}) >= 900 && postTrickReadMs({}) <= 1300);
    assert.ok(TRUMP_BEAT_READ_MS >= 900 && TRUMP_BEAT_READ_MS <= 1400);
    assert.ok(NEXT_LEAD_GAP_MS >= 400 && NEXT_LEAD_GAP_MS <= 600);
    assert.ok(CARD_LAND_MS >= 550 && CARD_LAND_MS <= 720);
  });

  it("schedules draw ring before discard/receive and keeps inter-player beat in range", () => {
    assert.ok(DRAW_RING_BEAT_MS >= 300 && DRAW_RING_BEAT_MS <= 500);
    const ringMs = drawPlayerAnimScheduleMs({
      subPhase: "ring",
      discardCount: 1,
      replaceCount: 1,
      reducedMotion: false,
    });
    assert.equal(ringMs, DRAW_RING_BEAT_MS);
    const discardMs = drawPlayerAnimScheduleMs({
      subPhase: "discard",
      discardCount: 1,
      replaceCount: 1,
      reducedMotion: false,
    });
    assert.ok(discardMs >= 300 && discardMs <= 500);
  });

  it("shows turn ring on the drawing seat during the ring beat only", () => {
    const ringActor = resolveDrawPresentationRingActor({
      phase: "drawPlayer",
      drawAnimSubPhase: "ring",
      animatingDrawPlayerId: "p2",
    });
    assert.equal(ringActor, "p2");
    assert.equal(
      resolveDrawPresentationRingActor({
        phase: "drawPlayer",
        drawAnimSubPhase: "discard",
        animatingDrawPlayerId: "p2",
      }),
      null,
    );
    assert.equal(drawSubPhaseSuppressesTurnRing("ring"), false);
    assert.equal(drawSubPhaseSuppressesTurnRing("discard"), true);
    assert.equal(drawSubPhaseSuppressesTurnRing("receive"), true);
  });

  it("does not suppress the turn ring during draw ring beat", () => {
    let store = createHandPresentationStore(drawSnap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...drawSnap, drawCompletedIds: ["p2"], turnPlayerId: "p3" },
    });
    assert.equal(store.drawAnimSubPhase, "ring");
    const model = buildHandPresentationModel(store);
    assert.equal(model.suppressTurnIndicator, false);
    assert.ok(phaseScheduleMs(store, false) >= DRAW_RING_BEAT_MS - 20);
  });

  it("blocks deal motion while trump reveal hold is active (no major overlap)", () => {
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "reveal",
        privateHandReady: true,
        trumpRevealActive: true,
        anteAnimActive: false,
        trumpMergeActive: false,
      }),
      false,
    );
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "draw",
        privateHandReady: true,
        trumpRevealActive: false,
        anteAnimActive: true,
        trumpMergeActive: false,
      }),
      false,
    );
  });

  it("holds post-trick read then winner reveal as separate beats", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.ok(schedule.readBeforeWinnerMs >= 900 && schedule.readBeforeWinnerMs <= 1300);
    assert.ok(schedule.winnerRevealMs >= 500 && schedule.winnerRevealMs <= 800);
    assert.ok(schedule.sweepMs >= 300 && schedule.sweepMs <= 500);
    assert.equal(schedule.readTotalMs, schedule.readBeforeWinnerMs + schedule.winnerRevealMs);
    assert.ok(schedule.nextLeadGapMs >= 400 && schedule.nextLeadGapMs <= 600);
  });
});
