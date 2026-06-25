import { useLayoutEffect, useRef } from "react";
import type { TrickPresentation } from "./useTrickPresentation";
import {
  animateTrickCardsToWonPile,
  clearWonTrickCollectionArtifacts,
  killWonTrickFlights,
  readTrickRowCardElements,
} from "../animations/wonTrickPileMotion";
import { wonTrickBookKey } from "../wonTrickPileModel";

export interface UseWonTrickCollectionInput {
  trickPresentation: TrickPresentation;
  handNumber: number;
  sessionPhase?: string | null;
  handComplete?: boolean;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

const TRICK_RESOLVED_PHASES = new Set(["nextLeadReady", "live"]);

/**
 * GSAP trick collection — visual-only, non-blocking for bot presentation gate.
 * Clears ghosts and presentation flags when each trick or hand resolves.
 */
export function useWonTrickCollection({
  trickPresentation,
  handNumber,
  sessionPhase = null,
  handComplete = false,
  tableRootRef,
}: UseWonTrickCollectionInput): void {
  const lastCollectKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(handNumber);
  const prevPhaseRef = useRef(trickPresentation.phase);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== handNumber) {
      handNumberRef.current = handNumber;
      lastCollectKeyRef.current = null;
      clearWonTrickCollectionArtifacts(root);
      return;
    }

    if (handComplete || (sessionPhase != null && sessionPhase !== "play")) {
      lastCollectKeyRef.current = null;
      clearWonTrickCollectionArtifacts(root);
    }
  }, [handNumber, handComplete, sessionPhase, tableRootRef]);

  useLayoutEffect(() => {
    const prev = prevPhaseRef.current;
    const phase = trickPresentation.phase;
    prevPhaseRef.current = phase;

    const root = tableRootRef.current;
    if (!root) return;

    if (prev === "collectTrick" && TRICK_RESOLVED_PHASES.has(phase)) {
      clearWonTrickCollectionArtifacts(root);
    }

    if (phase !== "collectTrick") {
      if (TRICK_RESOLVED_PHASES.has(phase)) {
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

    killWonTrickFlights();
    removeStaleGhosts(root);

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
    const root = tableRootRef.current;
    return () => {
      if (root) clearWonTrickCollectionArtifacts(root);
      else killWonTrickFlights();
    };
  }, [tableRootRef]);
}

function removeStaleGhosts(root: ParentNode): void {
  for (const ghost of root.querySelectorAll(".won-trick-fly-ghost")) {
    ghost.remove();
  }
}
