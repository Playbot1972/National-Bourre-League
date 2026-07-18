import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertMatchKeyInvariants,
  buildMatchKey,
  buildServerSnapshot,
  collectBotIds,
  deriveTableReadiness,
  isStaleMatchKey,
} from "./matchKey";
import {
  clearScopedPresentationState,
  invalidateQueuedHeroIntentOlderThan,
} from "./matchKeyLifecycle";
import { subscribeHeroQueuedIntentInvalidation } from "./heroQueuedIntent";
import {
  getTrickAnimationBusyState,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
  syncAuthoritativeMatchKey,
} from "./trickAnimationBridge";

const idleTrickFields = {
  matchKey: "",
  presentationScopeKey: "0:0",
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
  dealPresentationActive: false,
  trickCollectionActive: false,
};

function snapshot(seq = 3) {
  return buildServerSnapshot({
    sessionId: "sess-1",
    handNumber: 2,
    trickNumber: 1,
    turnPlayerId: "hero-1",
    serverActionSeq: seq,
    actionOrder: ["hero-1", "bot_a"],
  });
}

describe("buildMatchKey", () => {
  it("throws when serverActionSeq is missing", () => {
    assert.throws(
      () =>
        buildMatchKey({
          sessionId: "s",
          handNumber: 1,
          serverActionSeq: null,
        }),
      /Missing authoritative serverActionSeq/,
    );
  });

  it("includes session, hand, trick, turn index, and action seq", () => {
    const key = buildMatchKey(snapshot(7));
    assert.equal(key, "sess-1-h2-t1-turn0-aseq7");
  });
});

describe("deriveTableReadiness", () => {
  const botIds = collectBotIds(["hero-1", "bot_a"]);
  const clearPresentation = {
    matchKey: "sess-1-h2-t1-turn0-aseq3",
    pipelineActive: false,
    motionGateActive: false,
    revealCatchUp: false,
    handPresenting: false,
  };

  it("hero turn with clear gates => canHeroAct true", () => {
    const matchKey = buildMatchKey(snapshot());
    const readiness = deriveTableReadiness({
      matchKey,
      turnPlayerId: "hero-1",
      heroId: "hero-1",
      botIds,
      presentation: { ...clearPresentation, matchKey },
    });
    assert.equal(readiness.canHeroAct, true);
    assert.equal(readiness.needsBotDriver, false);
  });

  it("bot turn with clear gates => needsBotDriver true", () => {
    const matchKey = buildMatchKey(
      buildServerSnapshot({
        sessionId: "sess-1",
        handNumber: 2,
        trickNumber: 1,
        turnPlayerId: "bot_a",
        serverActionSeq: 3,
        actionOrder: ["hero-1", "bot_a"],
      }),
    );
    const readiness = deriveTableReadiness({
      matchKey,
      turnPlayerId: "bot_a",
      heroId: "hero-1",
      botIds,
      presentation: { ...clearPresentation, matchKey },
    });
    assert.equal(readiness.needsBotDriver, true);
    assert.equal(readiness.canHeroAct, false);
  });

  it("stale presentation.matchKey cannot block current turn", () => {
    const matchKey = buildMatchKey(snapshot(4));
    const readiness = deriveTableReadiness({
      matchKey,
      turnPlayerId: "hero-1",
      heroId: "hero-1",
      botIds,
      presentation: {
        matchKey: "sess-1-h2-t1-turn0-aseq3",
        pipelineActive: true,
        motionGateActive: true,
        revealCatchUp: true,
        handPresenting: true,
      },
    });
    assert.equal(readiness.visualCatchUpBusy, false);
    assert.equal(readiness.canHeroAct, true);
  });

  it("hero and bot cannot both be considered active at once", () => {
    assert.throws(
      () =>
        assertMatchKeyInvariants({
          matchKey: "k",
          turnPlayerId: "x",
          heroId: "hero-1",
          botIds,
          presentation: clearPresentation,
          isHeroTurn: true,
          isBotTurn: true,
          visualCatchUpBusy: false,
          canHeroAct: true,
          needsBotDriver: true,
        }),
      /hero and bot cannot both own the turn/,
    );
  });

  it("drawCompleted > drawTotal throws in assertMatchKeyInvariants", () => {
    assert.throws(
      () =>
        assertMatchKeyInvariants({
          matchKey: "k",
          turnPlayerId: "hero-1",
          heroId: "hero-1",
          botIds,
          presentation: clearPresentation,
          drawCompleted: 5,
          drawTotal: 4,
          isHeroTurn: true,
          isBotTurn: false,
          visualCatchUpBusy: false,
          canHeroAct: true,
          needsBotDriver: false,
        }),
      /drawCompleted \(5\) > drawTotal \(4\)/,
    );
  });
});

describe("matchKey lifecycle", () => {
  it("matchKey changes clear stale trick presentation busy flags", () => {
    resetTrickAnimationBusyState();
    const prevKey = "sess-1-h1-t0-turn0-aseq1";
    const nextKey = "sess-1-h1-t1-turn1-aseq2";
    syncAuthoritativeMatchKey(nextKey);
    setTrickAnimationBusyState({
      ...idleTrickFields,
      matchKey: prevKey,
      presentationScopeKey: "1:1",
      pipelineActive: true,
      revealCatchUp: true,
    });
    clearScopedPresentationState(prevKey);
    const busy = getTrickAnimationBusyState();
    assert.equal(busy.pipelineActive, false);
    assert.equal(busy.revealCatchUp, false);
  });

  it("invalidateQueuedHeroIntentOlderThan notifies subscribers", () => {
    let seen = 0;
    const unsub = subscribeHeroQueuedIntentInvalidation(() => {
      seen += 1;
    });
    invalidateQueuedHeroIntentOlderThan("sess-1-h2-t1-turn0-aseq4");
    unsub();
    assert.equal(seen, 1);
  });
});

describe("isStaleMatchKey", () => {
  it("detects key drift", () => {
    assert.equal(isStaleMatchKey("a", "b"), true);
    assert.equal(isStaleMatchKey("a", "a"), false);
  });
});
