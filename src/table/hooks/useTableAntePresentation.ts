import { useLayoutEffect, useRef } from "react";
import { activePlayerOrder } from "../../game/playerOrder";
import { buildAnteCoinDelayPlan } from "../../session/botActionTiming";
import {
  antePresentationDurationMs,
  killAnteCoinPresentation,
  runClockwiseAnteCoinPresentation,
} from "../animations/anteCoinPresentationMotion";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
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
 * Per-seat think delays reuse bot play timing (250–700 ms random) via botActionTiming.
 */
export function useTableAntePresentation({
  anteAnimActive,
  session,
  tableRootRef,
}: UseTableAntePresentationInput): void {
  const lastAnteKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(session.handNumber);
  const anteAnimActiveRef = useRef(anteAnimActive);
  anteAnimActiveRef.current = anteAnimActive;

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
    const delayPlan = buildAnteCoinDelayPlan({
      handNumber: session.handNumber,
      playerIds,
      reducedMotion: reduced,
    });

    if (isGameFlowDebugEnabled()) {
      for (let index = 0; index < playerIds.length; index += 1) {
        logGameFlow("antePresentation", "bot-timing-seat", {
          handNumber: session.handNumber,
          playerId: playerIds[index],
          actionType: "ante",
          thinkBeforeMs: delayPlan.thinkBeforeMs[index],
          delayRange: "250-700",
        });
      }
      logGameFlow("antePresentation", "bot-timing-plan", {
        handNumber: session.handNumber,
        seatCount: playerIds.length,
        totalThinkMs: delayPlan.totalThinkMs,
        totalDurationMs: delayPlan.totalDurationMs,
        actionType: "ante",
      });
    }

    lastAnteKeyRef.current = anteKey;
    killAnteCoinPresentation();
    root.classList.add("btable-wrap--ante-coins");
    setAntePresentationActive(true);

    const watchdogMs = antePresentationDurationMs(session.handNumber, playerIds, reduced) + 200;

    const rafId = window.requestAnimationFrame(() => {
      runClockwiseAnteCoinPresentation({
        handNumber: session.handNumber,
        playerIds,
        delayPlan,
        presentationKey: anteKey,
        root,
        onComplete: () => {
          root.classList.remove("btable-wrap--ante-coins");
          setAntePresentationActive(false);
        },
      });
    });

    const watchdog = window.setTimeout(() => {
      killAnteCoinPresentation();
      root.classList.remove("btable-wrap--ante-coins");
      setAntePresentationActive(false);
    }, watchdogMs);

    return () => {
      if (anteAnimActiveRef.current && lastAnteKeyRef.current === anteKey) {
        return;
      }
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdog);
      killAnteCoinPresentation();
      root.classList.remove("btable-wrap--ante-coins");
      setAntePresentationActive(false);
    };
  }, [anteAnimActive, session.sessionId, session.handNumber, tableRootRef]);
}
