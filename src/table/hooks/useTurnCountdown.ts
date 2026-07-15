import { useEffect, useRef, useState } from "react";
import {
  buildBotThinkCountdownState,
  getBotThinkWindow,
  isRobotPlayerId,
  subscribeBotThinkWindow,
} from "../botThinkWindow";
import {
  buildTurnCountdownState,
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  type TurnCountdownInput,
  type TurnCountdownState,
} from "../turnCountdown";
import { prefersReducedMotion } from "../trickTiming";

export interface UseTurnCountdownResult {
  countdown: TurnCountdownState | null;
  reducedMotion: boolean;
}

/**
 * Single table-wide turn countdown — one ring on the active actor at a time.
 * Human actors use the 15s cycle; bot play turns use the published think window
 * (350–900 ms) from bot-play-delay so the ring matches the submit gate.
 */
export function useTurnCountdown(input: TurnCountdownInput): UseTurnCountdownResult {
  const activeActorId = resolveTableActiveActorId(input);
  const activityKey = turnCountdownActivityKey({ ...input, activeActorId });
  const startedAtRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string>("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [, setBotWindowTick] = useState(0);

  useEffect(() => subscribeBotThinkWindow(() => setBotWindowTick((n) => n + 1)), []);

  const isBotPlayTurn =
    isRobotPlayerId(activeActorId) &&
    input.session.phase === "play" &&
    !input.handComplete &&
    !input.suppressTurn;

  const botWindow = isBotPlayTurn ? getBotThinkWindow() : null;
  const useBotWindow = botWindow != null && botWindow.playerId === activeActorId;

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
      );
    } else if (!useBotWindow && startedAtRef.current != null) {
      countdown = buildTurnCountdownState(activeActorId, startedAtRef.current, nowMs);
    }
  }

  return {
    countdown,
    reducedMotion: prefersReducedMotion(),
  };
}
