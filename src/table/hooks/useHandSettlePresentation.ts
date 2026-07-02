import { useEffect, useRef } from "react";
import { runSettlePresentationMotion } from "../animations/settlePresentationMotion";
import type { HandPresentationApi } from "../handPresentationApi";
import { SETTLE_BOURRE_PENALTY_MS, SETTLE_POT_PAYOUT_MS } from "../handPresentationTiming";
import type { HandPresentationModel } from "../handPresentationMachine";
import { shouldAnimateSettlePotPayout } from "../handPresentationMachine";

type UseHandSettlePresentationOptions = {
  handPresentation: HandPresentationModel;
  tableRootRef: React.RefObject<HTMLElement | null>;
  presentationApiRef?: React.MutableRefObject<HandPresentationApi | null>;
};

function resolveSettleAnchor(root: HTMLElement, playerId: string): HTMLElement | null {
  return (
    root.querySelector<HTMLElement>(`[data-settle-chip-anchor="${playerId}"]`) ??
    root.querySelector<HTMLElement>(`[data-won-trick-pile-anchor="${playerId}"]`) ??
    root.querySelector<HTMLElement>(`[data-seat-motion-anchor="${playerId}"]`) ??
    root.querySelector<HTMLElement>(`[data-seat-play-origin="${playerId}"]`)
  );
}

function resolveWinnerSeatEl(root: HTMLElement, winnerIds: string[]): HTMLElement | null {
  for (const id of winnerIds) {
    const el = resolveSettleAnchor(root, id);
    if (el) return el;
  }
  return null;
}

function resolveBourreSeatEl(root: HTMLElement, bourreIds: string[]): HTMLElement | null {
  for (const id of bourreIds) {
    const el = resolveSettleAnchor(root, id);
    if (el) return el;
  }
  return null;
}

function resolvePotEl(root: HTMLElement): HTMLElement | null {
  return (
    root.querySelector<HTMLElement>("[data-settle-pot-anchor]") ??
    root.querySelector<HTMLElement>('[data-testid="pot-display"]')
  );
}

/** Drives settle pot payout + Bourré penalty chip motion; signals machine on completion. */
export function useHandSettlePresentation({
  handPresentation,
  tableRootRef,
  presentationApiRef,
}: UseHandSettlePresentationOptions): void {
  const payoutStartedRef = useRef(false);
  const penaltyStartedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const {
    phase,
    settleSubPhase,
    settleWinnerIds,
    settleBourreIds,
    displayPotAmount,
  } = handPresentation;

  useEffect(() => {
    if (phase !== "settle") {
      payoutStartedRef.current = false;
      penaltyStartedRef.current = false;
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    const root = tableRootRef.current;
    const api = presentationApiRef?.current;
    if (!root || !api) return;

    if (settleSubPhase === "potPayout" && !payoutStartedRef.current) {
      payoutStartedRef.current = true;
      const animate = shouldAnimateSettlePotPayout({
        settleWinnerIds,
        displayPotAmount,
      });
      if (!animate) {
        api.notifySettlePayoutComplete();
        return;
      }

      cleanupRef.current = runSettlePresentationMotion({
        kind: "potPayout",
        fromEl: resolvePotEl(root),
        toEl: resolveWinnerSeatEl(root, settleWinnerIds),
        durationMs: SETTLE_POT_PAYOUT_MS,
        onComplete: () => {
          api.notifySettlePayoutComplete();
        },
      });
      return;
    }

    if (settleSubPhase === "bourrePenalty" && settleBourreIds.length > 0 && !penaltyStartedRef.current) {
      penaltyStartedRef.current = true;
      cleanupRef.current = runSettlePresentationMotion({
        kind: "bourrePenalty",
        fromEl: resolveBourreSeatEl(root, settleBourreIds),
        toEl: resolvePotEl(root),
        durationMs: SETTLE_BOURRE_PENALTY_MS,
        onComplete: () => {
          api.notifySettlePenaltyComplete();
        },
      });
      return;
    }

    if (settleSubPhase === "bourrePenalty" && settleBourreIds.length === 0) {
      api.notifySettlePenaltyComplete();
    }
  }, [
    phase,
    settleSubPhase,
    settleWinnerIds,
    settleBourreIds,
    displayPotAmount,
    tableRootRef,
    presentationApiRef,
  ]);

  useEffect(
    () => () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    },
    [],
  );
}
