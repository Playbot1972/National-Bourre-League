import { useEffect, useLayoutEffect, useRef } from "react";
import type { FrozenTrick, TrickPresentationPhase } from "../trickTiming";
import {
  animateTrickCardsToWonPile,
  clearWonTrickCollectionArtifacts,
  hasActiveWonTrickFlights,
  killWonTrickFlights,
  readTrickRowCardElements,
  WON_TRICK_FLY_MAX_MS,
} from "../animations/wonTrickPileMotion";
import { setTrickCollectionActive } from "../presentationMotionBusy";
import { TRICK_RAKE_MS } from "../trickTiming";
import { wonTrickBookKey } from "../wonTrickPileModel";

export interface TrickCollectionState {
  phase: TrickPresentationPhase;
  trickWinnerSeatId: string | null;
  frozenTrick: FrozenTrick | null;
  displayTricksByPlayer: Record<string, number>;
}

export interface UseWonTrickCollectionInput {
  trickCollection: TrickCollectionState;
  handNumber: number;
  sessionPhase?: string | null;
  handComplete?: boolean;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

const TRICK_RESOLVED_PHASES = new Set(["nextLeadReady", "live"]);

/**
 * GSAP trick collection — blocks bots until the packet reaches the won-tricks pile.
 */
export function useWonTrickCollection({
  trickCollection,
  handNumber,
  sessionPhase = null,
  handComplete = false,
  tableRootRef,
}: UseWonTrickCollectionInput): void {
  const lastCollectKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(handNumber);
  const prevPhaseRef = useRef(trickCollection.phase);
  const trickCleanupTimerRef = useRef<number | null>(null);
  const collectionInFlightRef = useRef(false);

  const clearTrickCleanupTimer = () => {
    if (trickCleanupTimerRef.current != null) {
      window.clearTimeout(trickCleanupTimerRef.current);
      trickCleanupTimerRef.current = null;
    }
  };

  const scheduleTrickArtifactCleanup = (root: HTMLElement) => {
    clearTrickCleanupTimer();
    const delay = hasActiveWonTrickFlights() ? WON_TRICK_FLY_MAX_MS + 60 : 0;
    trickCleanupTimerRef.current = window.setTimeout(() => {
      trickCleanupTimerRef.current = null;
      clearAllPileRevealFlags(root);
    }, delay);
  };

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== handNumber) {
      handNumberRef.current = handNumber;
      lastCollectKeyRef.current = null;
      clearTrickCleanupTimer();
      clearWonTrickCollectionArtifacts(root);
      return;
    }

    if (handComplete || (sessionPhase != null && sessionPhase !== "play")) {
      lastCollectKeyRef.current = null;
      clearTrickCleanupTimer();
      clearWonTrickCollectionArtifacts(root);
    }
  }, [handNumber, handComplete, sessionPhase, tableRootRef]);

  useLayoutEffect(() => {
    const prev = prevPhaseRef.current;
    const phase = trickCollection.phase;
    prevPhaseRef.current = phase;

    const root = tableRootRef.current;
    if (!root) return;

    if (prev === "collectTrick" && TRICK_RESOLVED_PHASES.has(phase)) {
      lastCollectKeyRef.current = null;
      collectionInFlightRef.current = false;
      scheduleTrickArtifactCleanup(root);
    }

    if (phase !== "collectTrick") {
      return;
    }

    const winnerId = trickCollection.trickWinnerSeatId;
    const frozen = trickCollection.frozenTrick;
    if (!winnerId || !frozen) return;

    const collectKey = `${frozen.trickNumber}:${winnerId}:${frozen.plays.length}`;
    if (lastCollectKeyRef.current === collectKey) return;
    lastCollectKeyRef.current = collectKey;
    collectionInFlightRef.current = true;

    clearTrickCleanupTimer();
    killWonTrickFlights();
    removeStaleGhosts(root);

    const cardEls = readTrickRowCardElements(root);
    if (!cardEls.length) {
      collectionInFlightRef.current = false;
      return;
    }

    const bookIndex = Math.max(
      0,
      (trickCollection.displayTricksByPlayer[winnerId] ?? 1) - 1,
    );
    const trickKey = wonTrickBookKey({
      playerId: winnerId,
      handNumber,
      trickNumber: frozen.trickNumber,
    });

    const rakeDelay = TRICK_RAKE_MS;
    setTrickCollectionActive(true);
    const rakeTimer = window.setTimeout(() => {
      animateTrickCardsToWonPile(cardEls, {
        winnerPlayerId: winnerId,
        trickKey,
        bookIndex,
        root,
        host: root,
        onComplete: () => {
          collectionInFlightRef.current = false;
          setTrickCollectionActive(false);
        },
      });
    }, rakeDelay);

    return () => {
      window.clearTimeout(rakeTimer);
      collectionInFlightRef.current = false;
      setTrickCollectionActive(false);
    };
  }, [
    trickCollection.phase,
    trickCollection.trickWinnerSeatId,
    trickCollection.frozenTrick,
    trickCollection.displayTricksByPlayer,
    handNumber,
    tableRootRef,
  ]);

  useEffect(() => () => clearTrickCleanupTimer(), []);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    return () => {
      clearTrickCleanupTimer();
      if (root) clearWonTrickCollectionArtifacts(root);
      else killWonTrickFlights();
    };
  }, [tableRootRef]);
}

function clearAllPileRevealFlags(root: ParentNode): void {
  for (const seat of root.querySelectorAll(".bseat--pile-reveal-ready")) {
    seat.classList.remove("bseat--pile-reveal-ready");
  }
}

function removeStaleGhosts(root: ParentNode): void {
  for (const ghost of root.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) {
    ghost.remove();
  }
}
