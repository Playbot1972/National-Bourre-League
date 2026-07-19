import { useEffect, useRef, useState } from "react";
import {
  botPlayTurnKey,
  buildBotThinkCountdownState,
  getBotThinkWindow,
  isRobotPlayerId,
  subscribeBotThinkWindow,
} from "../botThinkWindow";
import { resolveSuppressTurnForBot } from "../localAction";
import {
  buildTurnCountdownState,
  resolveTableActiveActorId,
  TURN_RING_ACTIVATION_DELAY_MS,
  turnCountdownActivityKey,
  type TurnCountdownInput,
  type TurnCountdownState,
} from "../turnCountdown";
import { prefersReducedMotion } from "../trickTiming";
import {
  reportVisibleBotRingHidden,
  reportVisibleBotRingShown,
} from "../visibleBotRingBridge";

/** Retry visible-ring ack while the live bot ring stays on screen. */
const VISIBLE_RING_ACK_RETRY_MS = 250;

export interface UseTurnCountdownResult {
  countdown: TurnCountdownState | null;
  reducedMotion: boolean;
}

/**
 * Single table-wide turn countdown — one ring on the active actor at a time.
 * Human actors use the 15s cycle; bot play turns use the published think window
 * (1500–3000 ms) from bot-play-delay so the ring matches the submit gate.
 */
export function useTurnCountdown(input: TurnCountdownInput): UseTurnCountdownResult {
  const effectiveSuppressTurn = resolveSuppressTurnForBot({
    suppressTurn: input.suppressTurn,
    session: input.session,
  });
  const activeActorId = resolveTableActiveActorId({
    ...input,
    suppressTurn: effectiveSuppressTurn,
  });
  const activityKey = turnCountdownActivityKey({
    ...input,
    suppressTurn: effectiveSuppressTurn,
    activeActorId,
  });
  const startedAtRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string>("");
  const prevBotRingTurnKeyRef = useRef<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [botWindowTick, setBotWindowTick] = useState(0);

  useEffect(() => subscribeBotThinkWindow(() => setBotWindowTick((n) => n + 1)), []);

  const isBotPlayTurn =
    isRobotPlayerId(activeActorId) &&
    input.session.phase === "play" &&
    !input.handComplete &&
    !effectiveSuppressTurn;

  const botWindow = isBotPlayTurn ? getBotThinkWindow() : null;
  const useBotWindow = botWindow != null && botWindow.playerId === activeActorId;

  const liveTurnPlayerId = input.session.turnPlayerId ?? null;
  const botRingReport =
    isBotPlayTurn &&
    activeActorId &&
    liveTurnPlayerId === activeActorId
      ? {
          turnKey: botPlayTurnKey({
            handNumber: input.session.handNumber,
            trickNumber: input.session.currentTrick?.trickNumber ?? null,
            turnPlayerId: liveTurnPlayerId,
          }),
          playerId: activeActorId,
        }
      : null;

  useEffect(() => {
    if (!activeActorId || useBotWindow) {
      if (!useBotWindow) {
        startedAtRef.current = null;
        lastKeyRef.current = activityKey;
      }
      return;
    }
    if (activityKey !== lastKeyRef.current || startedAtRef.current == null) {
      startedAtRef.current = Date.now();
      lastKeyRef.current = activityKey;
      setNowMs(Date.now());
    }
  }, [activeActorId, activityKey, useBotWindow]);

  useEffect(() => {
    if (!activeActorId) return;
    if (!useBotWindow && startedAtRef.current == null) return;

    const tick = () => setNowMs(Date.now());
    const intervalMs = prefersReducedMotion() ? 250 : 100;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [activeActorId, activityKey, useBotWindow, botWindow?.turnKey]);

  let countdown: TurnCountdownState | null = null;
  if (activeActorId) {
    if (useBotWindow && botWindow) {
      countdown = buildBotThinkCountdownState(
        botWindow.playerId,
        botWindow.startedAtMs,
        botWindow.totalMs,
        nowMs,
        TURN_RING_ACTIVATION_DELAY_MS,
        botWindow.countingStartedAtMs,
      );
    } else if (!useBotWindow && startedAtRef.current != null) {
      countdown = buildTurnCountdownState(
        activeActorId,
        startedAtRef.current,
        nowMs,
        TURN_RING_ACTIVATION_DELAY_MS,
      );
    }
  }

  const ringVisibleForBot =
    botRingReport != null && countdown?.playerId === botRingReport.playerId;

  useEffect(() => {
    const prevTurnKey = prevBotRingTurnKeyRef.current;
    const nextTurnKey = botRingReport?.turnKey ?? null;
    if (prevTurnKey && nextTurnKey && prevTurnKey !== nextTurnKey) {
      reportVisibleBotRingHidden({
        turnKey: prevTurnKey,
        reason: "turn_exit",
        nowMs: Date.now(),
      });
    }
    prevBotRingTurnKeyRef.current = nextTurnKey;
  }, [botRingReport?.turnKey]);

  useEffect(() => {
    if (!ringVisibleForBot || !botRingReport) return;

    const activationMs = prefersReducedMotion() ? 0 : TURN_RING_ACTIVATION_DELAY_MS;
    const { turnKey, playerId } = botRingReport;
    const handNumber = input.session.handNumber;
    const trickNumber = input.session.currentTrick?.trickNumber ?? null;

    const emit = () => {
      reportVisibleBotRingShown({
        turnKey,
        playerId,
        nowMs: Date.now(),
        handNumber,
        trickNumber,
      });
    };

    const showTimer = window.setTimeout(emit, activationMs);
    const retryId = window.setInterval(emit, VISIBLE_RING_ACK_RETRY_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(retryId);
    };
  }, [
    ringVisibleForBot,
    botRingReport?.turnKey,
    botRingReport?.playerId,
    botWindow?.turnKey,
    botWindow?.countingStartedAtMs,
    botWindowTick,
    input.session.handNumber,
    input.session.currentTrick?.trickNumber,
  ]);

  return {
    countdown,
    reducedMotion: prefersReducedMotion(),
  };
}
