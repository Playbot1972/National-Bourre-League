import { useLayoutEffect, useRef } from "react";
import type { TrickPresentation } from "./useTrickPresentation";
import {
  animateTrickCardsToWonPile,
  clearWinnerPileRevealReady,
  killWonTrickFlights,
  readTrickRowCardElements,
} from "../animations/wonTrickPileMotion";
import { wonTrickBookKey } from "../wonTrickPileModel";

export interface UseWonTrickCollectionInput {
  trickPresentation: TrickPresentation;
  handNumber: number;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

/**
 * GSAP trick collection — visual-only, non-blocking for bot presentation gate.
 * Runs when presentation enters collectTrick; force-completes within ~480ms.
 */
export function useWonTrickCollection({
  trickPresentation,
  handNumber,
  tableRootRef,
}: UseWonTrickCollectionInput): void {
  const lastCollectKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (trickPresentation.phase !== "collectTrick") {
      if (trickPresentation.phase === "live" || trickPresentation.phase === "nextLeadReady") {
        lastCollectKeyRef.current = null;
      }
      return;
    }

    const winnerId = trickPresentation.trickWinnerSeatId;
    const frozen = trickPresentation.frozenTrick;
    if (!winnerId || !frozen) return;

    const collectKey = `${frozen.trickNumber}:${winnerId}:${frozen.plays.length}`;
    if (lastCollectKeyRef.current === collectKey) return;
    lastCollectKeyRef.current = collectKey;

    const root = tableRootRef.current;
    if (!root) return;

    clearWinnerPileRevealReady(winnerId, root);
    killWonTrickFlights();

    const cardEls = readTrickRowCardElements(root);
    if (!cardEls.length) {
      return;
    }

    const bookIndex = Math.max(
      0,
      (trickPresentation.displayTricksByPlayer[winnerId] ?? 1) - 1,
    );
    const trickKey = wonTrickBookKey({
      playerId: winnerId,
      handNumber,
      trickNumber: frozen.trickNumber,
    });

    animateTrickCardsToWonPile(cardEls, {
      winnerPlayerId: winnerId,
      trickKey,
      bookIndex,
      root,
      host: root,
    });
  }, [
    trickPresentation.phase,
    trickPresentation.trickWinnerSeatId,
    trickPresentation.frozenTrick,
    trickPresentation.displayTricksByPlayer,
    handNumber,
    tableRootRef,
  ]);

  useLayoutEffect(() => {
    return () => killWonTrickFlights();
  }, []);

  useLayoutEffect(() => {
    if (trickPresentation.phase === "collectTrick") return;
    const root = tableRootRef.current;
    if (!root) return;
    for (const seat of root.querySelectorAll(".bseat--pile-reveal-ready")) {
      seat.classList.remove("bseat--pile-reveal-ready");
    }
  }, [trickPresentation.phase, tableRootRef]);
}
