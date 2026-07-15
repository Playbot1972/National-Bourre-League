import { useLayoutEffect, useRef } from "react";
import { activePlayerOrder } from "../../game/playerOrder";
import {
  killAnteCoinPresentation,
  runClockwiseAnteCoinPresentation,
} from "../animations/anteCoinPresentationMotion";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
import { getHandPacingMode, resolveAnteCoinDelayPlan } from "../handPacingMode";
import { seatRingPlayerIds } from "../layout/seatOrder";
import { setAntePresentationActive } from "../presentationMotionBusy";
import { prefersReducedMotion } from "../trickTiming";
import type { TableSessionData } from "../types";

export interface UseTableAntePresentationInput {
  anteAnimActive: boolean;
  session: TableSessionData;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

/**
 * Drives the single ante coin GSAP path when hand presentation enters ante.
 * Classic pacing waits for full coin flight; Ape S. Mode releases after think-only delays.
 */
export function useTableAntePresentation({
  anteAnimActive,
  session,
  tableRootRef,
}: UseTableAntePresentationInput): void {
  const lastAnteKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(session.handNumber);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== session.handNumber) {
      handNumberRef.current = session.handNumber;
      lastAnteKeyRef.current = null;
      killAnteCoinPresentation();
      setAntePresentationActive(false);
      root.classList.remove("btable-wrap--ante-coins");
    }
  }, [session.handNumber, tableRootRef]);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root || !anteAnimActive) return;

    const anteKey = `${session.sessionId}:${session.handNumber}:ante`;
    if (lastAnteKeyRef.current === anteKey) return;

    const seatRing = seatRingPlayerIds(session.participantIds, session);
    const playerIds = activePlayerOrder(
      session.dealerId,
      session.participantIds,
      seatRing.length ? seatRing : session.participantIds,
    );
    if (playerIds.length < 1) return;

    const reduced = prefersReducedMotion();
    const pacingMode = getHandPacingMode(session.handNumber);
    const delayPlan = resolveAnteCoinDelayPlan(
      session.handNumber,
      playerIds,
      reduced,
      pacingMode,
    );

    if (isGameFlowDebugEnabled()) {
      for (let index = 0; index < playerIds.length; index += 1) {
        logGameFlow("antePresentation", "bot-timing-seat", {
          handNumber: session.handNumber,
          playerId: playerIds[index],
          actionType: "ante",
          thinkBeforeMs: delayPlan.thinkBeforeMs[index],
          pacingMode,
        });
      }
      logGameFlow("antePresentation", "bot-timing-plan", {
        handNumber: session.handNumber,
        seatCount: playerIds.length,
        totalThinkMs: delayPlan.totalThinkMs,
        totalDurationMs: delayPlan.totalDurationMs,
        pacingMode,
        actionType: "ante",
      });
    }

    lastAnteKeyRef.current = anteKey;
    killAnteCoinPresentation();
    root.classList.add("btable-wrap--ante-coins");
    setAntePresentationActive(true);

    const releaseBotGate = () => setAntePresentationActive(false);
    const visualWatchdogMs = delayPlan.totalDurationMs + 200;
    const thinkReleaseTimer =
      pacingMode === "apeSpeed"
        ? window.setTimeout(releaseBotGate, delayPlan.totalThinkMs)
        : null;

    const rafId = window.requestAnimationFrame(() => {
      runClockwiseAnteCoinPresentation({
        handNumber: session.handNumber,
        playerIds,
        delayPlan,
        presentationKey: anteKey,
        root,
        onComplete: () => {
          root.classList.remove("btable-wrap--ante-coins");
          if (pacingMode === "classic") {
            releaseBotGate();
          }
        },
      });
    });

    const visualWatchdog = window.setTimeout(() => {
      killAnteCoinPresentation();
      root.classList.remove("btable-wrap--ante-coins");
      releaseBotGate();
    }, visualWatchdogMs);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (thinkReleaseTimer != null) window.clearTimeout(thinkReleaseTimer);
      window.clearTimeout(visualWatchdog);
      releaseBotGate();
    };
  }, [anteAnimActive, session.sessionId, session.handNumber, tableRootRef]);
}
