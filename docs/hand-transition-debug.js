/**
 * Targeted next-hand transition instrumentation (opt-in).
 *
 * Enable:
 *   localStorage.setItem('nbl-hand-transition-debug', '1'); location.reload();
 *   — or add ?handTransitionDebug=1 to the URL
 *
 * Export timeline: copy(JSON.stringify(window.__nblHandTransitionTimeline, null, 2))
 */

export const DEBUG_KEY = "nbl-hand-transition-debug";
export const QUERY_FLAG = "handTransitionDebug";

const MAX_TIMELINE = 80;
const SHUFFLE_STALL_MS = 18_000;

/** @type {Array<Record<string, unknown>>} */
let timeline = [];
let shuffleWatchdog = null;
/** @type {{ startedAt: number; handCount: number; sessionId: string | null } | null} */
let pendingShuffle = null;

export function isHandTransitionDebugEnabled() {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem(DEBUG_KEY) === "1") {
      return true;
    }
    if (typeof location !== "undefined") {
      return new URLSearchParams(location.search).has(QUERY_FLAG);
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Browser / platform context for iPhone Chrome vs Safari reports. */
export function detectHandTransitionPlatform() {
  if (typeof navigator === "undefined") {
    return { userAgent: "", isIPhone: false, isIOS: false, isIOSChrome: false, isIOSSafari: false };
  }
  const ua = navigator.userAgent || "";
  const isIPhone = /iPhone|iPod/.test(ua);
  const isIPad =
    /iPad/.test(ua) ||
    (typeof navigator.platform === "string" &&
      navigator.platform === "MacIntel" &&
      (navigator.maxTouchPoints ?? 0) > 1);
  const isIOS = isIPhone || isIPad;
  const isIOSChrome = /CriOS/.test(ua);
  const isIOSSafari = isIOS && !isIOSChrome && !/FxiOS|EdgiOS/.test(ua);
  const viewport =
    typeof window !== "undefined"
      ? { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio ?? 1 }
      : null;
  const orientation =
    typeof screen !== "undefined" && screen.orientation?.type
      ? screen.orientation.type
      : viewport && viewport.width > viewport.height
        ? "landscape-primary"
        : "portrait-primary";
  return {
    userAgent: ua,
    isIPhone,
    isIPad,
    isIOS,
    isIOSChrome,
    isIOSSafari,
    isDesktop: !isIOS && !/Android/i.test(ua),
    viewport,
    orientation,
  };
}

function perfMs() {
  return typeof performance !== "undefined" ? performance.now() : 0;
}

function publishTimeline() {
  if (typeof window !== "undefined") {
    window.__nblHandTransitionTimeline = timeline;
  }
}

/**
 * @param {string} event
 * @param {Record<string, unknown>} [data]
 */
export function logHandTransition(event, data = {}) {
  if (!isHandTransitionDebugEnabled()) return;
  const entry = {
    kind: "event",
    event,
    at: Date.now(),
    perfMs: perfMs(),
    platform: detectHandTransitionPlatform(),
    ...data,
  };
  timeline.push(entry);
  if (timeline.length > MAX_TIMELINE) timeline = timeline.slice(-MAX_TIMELINE);
  publishTimeline();
  const ts = `${entry.perfMs.toFixed(1)}ms`;
  console.info(`[nbl-hand-transition ${ts}] ${event}`, data);
}

/**
 * Non-fatal anomaly — always recorded in timeline when debug on; also tries optional telemetry bridges.
 * @param {string} code
 * @param {Record<string, unknown>} [detail]
 */
export function reportHandTransitionAnomaly(code, detail = {}) {
  if (!isHandTransitionDebugEnabled()) return;
  const payload = {
    kind: "anomaly",
    code,
    at: Date.now(),
    perfMs: perfMs(),
    platform: detectHandTransitionPlatform(),
    ...detail,
  };
  timeline.push(payload);
  if (timeline.length > MAX_TIMELINE) timeline = timeline.slice(-MAX_TIMELINE);
  publishTimeline();
  console.warn(`[nbl-hand-transition ANOMALY] ${code}`, detail);

  tryEmitTelemetry("hand_transition_anomaly", { code, ...detail });
}

function tryEmitTelemetry(eventName, params) {
  try {
    if (typeof window === "undefined") return;
    const bridge = window.__nblReportTelemetry;
    if (typeof bridge === "function") {
      bridge(eventName, params);
      return;
    }
    const plugins = window.Capacitor?.Plugins;
    if (plugins?.FirebaseCrashlytics?.log) {
      plugins.FirebaseCrashlytics.log({
        message: `${eventName}: ${JSON.stringify(params).slice(0, 500)}`,
      });
    }
    const analytics = window.firebase?.analytics;
    if (typeof analytics === "function") {
      const inst = analytics();
      if (typeof inst?.logEvent === "function") {
        inst.logEvent(eventName, params);
      }
    }
  } catch {
    /* telemetry is best-effort */
  }
}

/** Log platform once when debug mode is first detected. */
export function logHandTransitionBoot() {
  if (!isHandTransitionDebugEnabled()) return;
  logHandTransition("debug_enabled", {
    key: DEBUG_KEY,
    queryFlag: QUERY_FLAG,
    platform: detectHandTransitionPlatform(),
  });
}

/**
 * Build a compact snapshot for transition debugging.
 * @param {object} input
 */
export function snapshotHandTransitionState(input) {
  const {
    session = null,
    scores = [],
    myUid = null,
    privateHandCards = [],
    sessionHandDealStarted = false,
    tableActionFeedback = null,
  } = input;

  const hand = session?.currentHand ?? {};
  const phase = hand.phase ?? null;
  const participantIds = hand.participantIds ?? [];
  const seatedIds = hand.seatedIds ?? [];
  const decision = hand.handDecision ?? null;
  const enrollment = session?.handEnrollment ?? session?.liveEnrollment ?? null;
  const enrollmentActive = Boolean(enrollment?.active);
  const decisionActive = phase === "decision" && decision?.active === true;

  const cashByPlayer = {};
  const outPlayerIds = [];
  const eligiblePlayerIds = [];
  for (const sc of scores) {
    const pid = sc.playerId;
    if (!pid) continue;
    const rowBankroll = Math.max(0, Number(sc.bankroll) || 0);
    cashByPlayer[pid] = rowBankroll;
    const isOut = sc.out === true || rowBankroll <= 0;
    if (isOut) outPlayerIds.push(pid);
    else eligiblePlayerIds.push(pid);
  }

  const decisionOrder = decision?.orderedPlayerIds ?? [];
  const decisionTurn =
    decisionActive && decision
      ? (decision.orderedPlayerIds?.[decision.currentIndex ?? 0] ?? null)
      : null;
  const enrollmentOrder = enrollment?.orderedPlayerIds ?? [];
  const enrollmentTurn =
    enrollmentActive && enrollment
      ? (enrollment.orderedPlayerIds?.[enrollment.currentIndex ?? 0] ?? null)
      : null;

  const waitingPlayerIds = (decisionActive ? decisionOrder : enrollmentOrder).filter((pid) => {
    if (!pid) return false;
    if (decisionActive) {
      const playing = decision?.playingIds ?? [];
      const passed = decision?.passedIds ?? [];
      return !playing.includes(pid) && !passed.includes(pid);
    }
    const enrolled = enrollment?.enrolledIds ?? [];
    const declined = enrollment?.declinedIds ?? [];
    return !enrolled.includes(pid) && !declined.includes(pid);
  });

  return {
    sessionId: session?.id ?? null,
    handCount: session?.handCount ?? 0,
    phase,
    participantIds: [...participantIds],
    seatedIds: [...seatedIds],
    decisionActive,
    decisionTurn,
    decisionOrder: [...decisionOrder],
    decisionWaitingCount: waitingPlayerIds.length,
    decisionWaitingPlayerIds: [...waitingPlayerIds],
    enrollmentActive,
    enrollmentTurn,
    enrollmentWaitingCount: waitingPlayerIds.length,
    eligiblePlayerIds: [...eligiblePlayerIds],
    outPlayerIds: [...outPlayerIds],
    cashByPlayer,
    sessionHandDealStarted,
    heroInParticipants: myUid ? participantIds.includes(myUid) : null,
    heroPrivateCardCount: privateHandCards?.length ?? 0,
    privateHandSnapReady: input.privateHandSnapSeen === true,
    tableFeedback: tableActionFeedback?.message ?? null,
    pendingCoWin: Boolean(session?.pendingCoWinSettlement),
    carryOverPot: session?.carryOverPot ?? 0,
  };
}

/**
 * Run anomaly heuristics on a snapshot; reports each hit.
 * @param {ReturnType<typeof snapshotHandTransitionState>} snap
 */
export function analyzeHandTransitionAnomalies(snap) {
  if (!isHandTransitionDebugEnabled() || !snap) return;

  for (const outId of snap.outPlayerIds) {
    if (snap.eligiblePlayerIds.includes(outId)) {
      reportHandTransitionAnomaly("out_player_in_eligible", {
        playerId: outId,
        eligiblePlayerIds: snap.eligiblePlayerIds,
      });
    }
    if (snap.decisionOrder.includes(outId) && !snap.participantIds.includes(outId)) {
      reportHandTransitionAnomaly("out_player_in_decision_queue", {
        playerId: outId,
        decisionOrder: snap.decisionOrder,
        participantIds: snap.participantIds,
      });
    }
    if (snap.decisionTurn === outId) {
      reportHandTransitionAnomaly("decision_turn_is_out_player", {
        playerId: outId,
        phase: snap.phase,
      });
    }
    if (snap.enrollmentTurn === outId) {
      reportHandTransitionAnomaly("enrollment_turn_is_out_player", {
        playerId: outId,
      });
    }
  }

  if (
    snap.decisionWaitingCount > 0 &&
    snap.eligiblePlayerIds.length > 0 &&
    snap.decisionWaitingCount > snap.eligiblePlayerIds.length
  ) {
    reportHandTransitionAnomaly("waiting_count_exceeds_eligible", {
      waitingCount: snap.decisionWaitingCount,
      eligibleCount: snap.eligiblePlayerIds.length,
      waitingPlayerIds: snap.decisionWaitingPlayerIds,
    });
  }

  if (snap.phase && ["reveal", "draw", "play", "decision"].includes(snap.phase)) {
    if (snap.participantIds.length >= 2 && snap.heroInParticipants === false && snap.heroPrivateCardCount >= 5) {
      reportHandTransitionAnomaly("non_participant_has_five_cards", {
        heroPrivateCardCount: snap.heroPrivateCardCount,
        participantIds: snap.participantIds,
      });
    }
    if (snap.participantIds.length >= 2 && snap.sessionHandDealStarted && snap.heroInParticipants && snap.heroPrivateCardCount === 0 && snap.privateHandSnapReady) {
      reportHandTransitionAnomaly("participant_missing_private_hand", {
        phase: snap.phase,
        participantIds: snap.participantIds,
      });
    }
  }

  if (snap.phase === "reveal" && snap.participantIds.length < 2) {
    reportHandTransitionAnomaly("reveal_with_fewer_than_two_participants", {
      participantIds: snap.participantIds,
    });
  }
}

export function markHandShuffleStart(ctx = {}) {
  if (!isHandTransitionDebugEnabled()) return;
  pendingShuffle = {
    startedAt: Date.now(),
    handCount: ctx.handCount ?? 0,
    sessionId: ctx.sessionId ?? null,
  };
  logHandTransition("shuffle_start", ctx);
  if (shuffleWatchdog) clearTimeout(shuffleWatchdog);
  shuffleWatchdog = setTimeout(() => {
    if (!pendingShuffle) return;
    reportHandTransitionAnomaly("shuffle_started_deal_never_dispatched", {
      elapsedMs: Date.now() - pendingShuffle.startedAt,
      handCount: pendingShuffle.handCount,
      sessionId: pendingShuffle.sessionId,
      lastSnapshot: timeline.filter((e) => e.kind === "event").slice(-5),
    });
    pendingShuffle = null;
  }, SHUFFLE_STALL_MS);
}

export function markHandDealDispatched(ctx = {}) {
  if (!isHandTransitionDebugEnabled()) return;
  if (pendingShuffle) {
    ctx.shuffleElapsedMs = Date.now() - pendingShuffle.startedAt;
    pendingShuffle = null;
  }
  if (shuffleWatchdog) {
    clearTimeout(shuffleWatchdog);
    shuffleWatchdog = null;
  }
  logHandTransition("deal_dispatched", ctx);
}

export function markHandCardsDealt(ctx = {}) {
  if (!isHandTransitionDebugEnabled()) return;
  logHandTransition("cards_dealt", ctx);
}

export function clearHandTransitionTimeline() {
  timeline = [];
  publishTimeline();
}
