import gsap from "gsap";
import { playAnteCoinLandSound } from "../feedback/audio";
import { ANTE_CHIP_TRAVEL_MS, antePresentationDurationMs } from "../handPresentationTiming";
import { readSeatPlayOrigin } from "../trickPlayFly";
import { anteCoinStaggerMs, prefersReducedMotion } from "../trickTiming";
import { tweenAlongArc } from "./arcTween";
import { invertFromFirst, rectFromElement, type MotionRect } from "./flip";
import { initCardMotion } from "./initMotion";
import {
  MOTION_GHOST_Z_INDEX,
  PREMIUM_EASE,
  PREMIUM_EASE_BOUNCE,
  scaledDuration,
} from "./motionTokens";

const ACTIVE_ANTE_TIMELINES = new Set<gsap.core.Timeline>();

export { antePresentationDurationMs };

export function anteCoinTravelMs(reducedMotion = prefersReducedMotion()): number {
  const scale = reducedMotion ? 0.35 : 1;
  return Math.round(ANTE_CHIP_TRAVEL_MS * scale);
}

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return { midX: dx * 0.5, midY: dy * 0.5 - Math.min(48, Math.abs(dx) * 0.12) };
}

export function readAntePotTarget(root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el =
    doc.querySelector<HTMLElement>("[data-ante-pot-target]") ??
    doc.querySelector<HTMLElement>(".bpot__stat--pot");
  return el ? rectFromElement(el) : null;
}

export function readAnteSeatOrigin(playerId: string, root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const anchor =
    doc.querySelector<HTMLElement>(`[data-seat-motion-anchor="${playerId}"]`) ??
    doc.querySelector<HTMLElement>(`[data-seat-play-origin="${playerId}"]`);
  if (anchor) return rectFromElement(anchor);
  return readSeatPlayOrigin(playerId);
}

/** Max anchor reads per coin spawn (initial frame + one RAF retry). */
export const ANTE_ANCHOR_READ_ATTEMPTS = 2;

export function shouldRetryAnteAnchors(
  origin: MotionRect | null,
  pot: MotionRect | null,
  attempt: number,
): boolean {
  return (!origin || !pot) && attempt < ANTE_ANCHOR_READ_ATTEMPTS - 1;
}

function landAnteCoinWithoutFlight(
  playerId: string,
  index: number,
  onCoinLand?: (playerId: string, index: number) => void,
): void {
  try {
    playAnteCoinLandSound();
  } catch {
    /* audio blocked */
  }
  onCoinLand?.(playerId, index);
}

function flyAnteCoinFromAnchors(
  playerId: string,
  index: number,
  root: ParentNode,
  origin: MotionRect,
  pot: MotionRect,
  reduced: boolean,
  travelSec: number,
  settleSec: number,
  onCoinLand?: (playerId: string, index: number) => void,
): void {
  const ghost = createCoinGhost();
  (root instanceof Document ? root.body : document.body).appendChild(ghost);
  const ghostRect = rectFromElement(ghost);
  const originCx = origin.left + origin.width / 2;
  const originCy = origin.top + origin.height / 2;
  const potCx = pot.left + pot.width / 2;
  const potCy = pot.top + pot.height / 2;
  const start = invertFromFirst(ghostRect, {
    left: originCx - ghostRect.width / 2,
    top: originCy - ghostRect.height / 2,
    width: ghostRect.width,
    height: ghostRect.height,
  });
  const dx = potCx - originCx;
  const dy = potCy - originCy;
  const { midX, midY } = arcMidpoint(dx, dy);

  gsap.set(ghost, {
    x: start.x,
    y: start.y,
    scale: reduced ? 1 : 0.72,
    opacity: reduced ? 1 : 0.85,
  });

  const inner = gsap.timeline({
    onComplete: () => {
      ghost.remove();
      onCoinLand?.(playerId, index);
    },
  });

  if (reduced) {
    inner.to(ghost, {
      x: start.x + dx,
      y: start.y + dy,
      scale: 1,
      opacity: 1,
      duration: travelSec,
      ease: PREMIUM_EASE,
      onComplete: () => {
        try {
          playAnteCoinLandSound();
        } catch {
          /* audio blocked */
        }
      },
    });
  } else {
    inner.add(
      tweenAlongArc(ghost, {
        path: [
          { x: start.x, y: start.y },
          { x: start.x + midX, y: start.y + midY },
          { x: start.x + dx, y: start.y + dy },
        ],
        curviness: 1.15,
        scale: 1,
        opacity: 1,
        duration: travelSec,
        ease: PREMIUM_EASE,
        onComplete: () => {
          try {
            playAnteCoinLandSound();
          } catch {
            /* audio blocked */
          }
        },
      }),
    );
    inner.to(
      ghost,
      {
        scale: 1.08,
        duration: settleSec,
        yoyo: true,
        repeat: 1,
        ease: PREMIUM_EASE_BOUNCE,
      },
      travelSec,
    );
  }
}

function spawnAnteCoinWithAnchorRetry(
  playerId: string,
  index: number,
  root: ParentNode,
  reduced: boolean,
  travelSec: number,
  settleSec: number,
  onCoinLand?: (playerId: string, index: number) => void,
  attempt = 0,
): void {
  const origin = readAnteSeatOrigin(playerId, root);
  const pot = readAntePotTarget(root);
  if (shouldRetryAnteAnchors(origin, pot, attempt)) {
    requestAnimationFrame(() =>
      spawnAnteCoinWithAnchorRetry(
        playerId,
        index,
        root,
        reduced,
        travelSec,
        settleSec,
        onCoinLand,
        attempt + 1,
      ),
    );
    return;
  }
  if (!origin || !pot) {
    landAnteCoinWithoutFlight(playerId, index, onCoinLand);
    return;
  }
  flyAnteCoinFromAnchors(
    playerId,
    index,
    root,
    origin,
    pot,
    reduced,
    travelSec,
    settleSec,
    onCoinLand,
  );
}

function createCoinGhost(): HTMLElement {
  const el = document.createElement("span");
  el.className = "bpot__ante-chip bpot__ante-chip--fly";
  el.setAttribute("aria-hidden", "true");
  el.style.position = "fixed";
  el.style.width = "14px";
  el.style.height = "14px";
  el.style.borderRadius = "50%";
  el.style.pointerEvents = "none";
  el.style.zIndex = String(MOTION_GHOST_Z_INDEX);
  el.style.background = "var(--gold-300, #f4d58d)";
  el.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.35)";
  return el;
}

export function killAnteCoinPresentation(): void {
  for (const tl of ACTIVE_ANTE_TIMELINES) tl.kill();
  ACTIVE_ANTE_TIMELINES.clear();
  if (typeof document !== "undefined") {
    for (const ghost of document.querySelectorAll(".bpot__ante-chip--fly")) {
      ghost.remove();
    }
  }
}

export interface RunAnteCoinPresentationInput {
  playerIds: string[];
  root: ParentNode;
  onCoinLand?: (playerId: string, index: number) => void;
  onComplete?: () => void;
}

/** One GSAP timeline — coins fly clockwise from seat anchors into the pot. */
export function runClockwiseAnteCoinPresentation({
  playerIds,
  root,
  onCoinLand,
  onComplete,
}: RunAnteCoinPresentationInput): gsap.core.Timeline {
  initCardMotion(root);
  killAnteCoinPresentation();

  const reduced = prefersReducedMotion();
  const staggerSec = anteCoinStaggerMs(reduced) / 1000;
  const travelSec = scaledDuration(anteCoinTravelMs(reduced) / 1000, reduced);
  const settleSec = scaledDuration(0.08, reduced);

  const tl = gsap.timeline({
    onComplete: () => {
      ACTIVE_ANTE_TIMELINES.delete(tl);
      onComplete?.();
    },
    onInterrupt: () => {
      ACTIVE_ANTE_TIMELINES.delete(tl);
      for (const ghost of root.querySelectorAll?.(".bpot__ante-chip--fly") ?? []) {
        ghost.remove();
      }
    },
  });
  ACTIVE_ANTE_TIMELINES.add(tl);

  if (!playerIds.length) {
    tl.call(() => onComplete?.());
    return tl;
  }

  playerIds.forEach((playerId, index) => {
    const position = index * staggerSec;
    tl.call(
      () => {
        spawnAnteCoinWithAnchorRetry(
          playerId,
          index,
          root,
          reduced,
          travelSec,
          settleSec,
          onCoinLand,
        );
      },
      undefined,
      position,
    );
  });

  return tl;
}
