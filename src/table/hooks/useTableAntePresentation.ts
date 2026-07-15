import { useLayoutEffect, useRef } from "react";
import { activePlayerOrder } from "../../game/playerOrder";
import {
  antePresentationDurationMs,
  killAnteCoinPresentation,
  runClockwiseAnteCoinPresentation,
} from "../animations/anteCoinPresentationMotion";
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
 * Deduped per session/hand; stagger uses bot-play timing (BOT_PLAY_STAGGER_MS).
 * Participant order is captured once per hand — participantIds array identity is
 * intentionally excluded from deps so snapshot churn cannot tear down the timeline.
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

    lastAnteKeyRef.current = anteKey;
    killAnteCoinPresentation();
    root.classList.add("btable-wrap--ante-coins");
    setAntePresentationActive(true);

    const reduced = prefersReducedMotion();
    const watchdogMs = antePresentationDurationMs(playerIds.length, reduced) + 200;

    const rafId = window.requestAnimationFrame(() => {
      runClockwiseAnteCoinPresentation({
        playerIds,
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
