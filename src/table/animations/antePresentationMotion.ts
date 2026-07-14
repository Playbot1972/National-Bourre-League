import gsap from "gsap";
import {
  ANTE_MONEY_TRAVEL_MS,
  ANTE_PILE_MERGE_MS,
  computeAnteStaggerMs,
} from "../antePresentationTiming";
import { initCardMotion } from "./initMotion";
import { invertFromFirst, rectCenter, rectFromElement, type MotionRect } from "./flip";
import {
  MOTION_GHOST_Z_INDEX,
  PREMIUM_EASE,
  PREMIUM_EASE_BOUNCE,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";

let activeAnteTimeline: gsap.core.Timeline | null = null;
let lastAnteSequenceKey: string | null = null;

export interface AntePresentationCallbacks {
  onLaunch?: (playerId: string, playerIndex: number) => void;
  onLand?: (playerId: string, playerIndex: number) => void;
  onComplete?: () => void;
}

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.42,
    midY: dy * 0.42 - Math.max(22, Math.hypot(dx, dy) * 0.22),
  };
}

export function readAnteSeatOrigin(playerId: string, root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const anchor =
    doc.querySelector<HTMLElement>(`[data-seat-motion-anchor="${playerId}"]`) ??
    doc.querySelector<HTMLElement>(`[data-seat-play-origin="${playerId}"]`);
  if (!anchor) return null;
  const avatar = anchor.closest(".bseat")?.querySelector<HTMLElement>(".bseat__avatar-wrap");
  return rectFromElement(avatar ?? anchor);
}

export function readAntePotTarget(root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el = doc.querySelector<HTMLElement>("[data-ante-pot-target]");
  return el ? rectFromElement(el) : null;
}

function createMoneyGhost(playerIndex: number): HTMLElement {
  const ghost = document.createElement("div");
  ghost.className = "ante-money-fly";
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.setProperty("--ante-money-i", String(playerIndex));
  const bill = document.createElement("span");
  bill.className = "ante-money-fly__bill";
  bill.textContent = "$";
  ghost.appendChild(bill);
  return ghost;
}

function pileOffset(playerIndex: number): { x: number; y: number; rot: number } {
  const ring = playerIndex % 8;
  const angle = (ring / 8) * Math.PI * 2;
  const radius = 6 + (playerIndex % 3) * 3;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius - 2,
    rot: -18 + (playerIndex % 5) * 9,
  };
}

function addPileBill(pile: HTMLElement, playerIndex: number): void {
  const chip = document.createElement("span");
  chip.className = "bpot__ante-pile-bill";
  const { x, y, rot } = pileOffset(playerIndex);
  chip.style.setProperty("--pile-x", `${x}px`);
  chip.style.setProperty("--pile-y", `${y}px`);
  chip.style.setProperty("--pile-rot", `${rot}deg`);
  chip.textContent = "$";
  pile.appendChild(chip);
  gsap.fromTo(
    chip,
    { scale: 0.4, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.12, ease: PREMIUM_EASE_BOUNCE },
  );
}

function flyOneAnte(
  root: HTMLElement,
  playerId: string,
  playerIndex: number,
  origin: MotionRect,
  target: MotionRect,
  pile: HTMLElement,
  reduced: boolean,
  callbacks: AntePresentationCallbacks,
): gsap.core.Timeline {
  const ghost = createMoneyGhost(playerIndex);
  root.appendChild(ghost);

  const ghostRect = rectFromElement(ghost);
  const { x, y } = invertFromFirst(ghostRect, origin);
  const originCenter = rectCenter(origin);
  const targetCenter = rectCenter(target);
  const dx = targetCenter.x - originCenter.x;
  const dy = targetCenter.y - originCenter.y;
  const { midX, midY } = arcMidpoint(dx, dy);
  const travelSec = scaledDuration(
    (reduced ? 0.14 : ANTE_MONEY_TRAVEL_MS / 1000),
    reduced,
  );

  gsap.set(ghost, {
    position: "fixed",
    left: `${ghostRect.left}px`,
    top: `${ghostRect.top}px`,
    width: `${Math.max(18, origin.width * 0.42)}px`,
    height: `${Math.max(14, origin.height * 0.32)}px`,
    zIndex: String(MOTION_GHOST_Z_INDEX + 2),
    pointerEvents: "none",
    transformOrigin: "50% 50%",
    willChange: "transform,opacity",
    x,
    y,
    rotation: -16 + (playerIndex % 3) * 8,
    scale: 0.55,
    opacity: 0,
  });

  const tl = gsap.timeline({
    onStart: () => callbacks.onLaunch?.(playerId, playerIndex),
  });

  tl.to(ghost, {
    scale: 1.08,
    opacity: 1,
    duration: reduced ? 0.06 : 0.09,
    ease: PREMIUM_EASE_BOUNCE,
  });

  if (reduced) {
    tl.to(ghost, {
      x: dx,
      y: dy,
      rotation: 0,
      scale: 1,
      duration: travelSec,
      ease: PREMIUM_EASE,
    });
  } else {
    tl.to(ghost, {
      motionPath: {
        path: [
          { x, y },
          { x: x + midX, y: y + midY },
          { x: dx, y: dy },
        ],
        curviness: 1.25,
      },
      rotation: 6,
      scale: 1,
      opacity: 1,
      duration: travelSec,
      ease: PREMIUM_EASE,
    });
  }

  tl.to(
    ghost,
    {
      scale: 0.92,
      duration: 0.07,
      yoyo: true,
      repeat: 1,
      ease: PREMIUM_EASE_BOUNCE,
      onComplete: () => {
        ghost.remove();
        addPileBill(pile, playerIndex);
        callbacks.onLand?.(playerId, playerIndex);
      },
    },
    `-=${0.05}`,
  );

  return tl;
}

export function antePresentationDedupeKey(handNumber: number): string {
  return `${handNumber}:ante-motion`;
}

export function killAntePresentation(): void {
  activeAnteTimeline?.kill();
  activeAnteTimeline = null;
}

export function clearAntePile(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  for (const el of doc.querySelectorAll(".bpot__ante-pile-bill, .ante-money-fly")) {
    el.remove();
  }
  const pile = doc.querySelector<HTMLElement>(".bpot__ante-pile");
  if (pile) pile.classList.remove("bpot__ante-pile--active");
}

/**
 * Staggered cartoon money from each seat into the center pot pile.
 * Returns false when this hand's sequence already ran (re-render guard).
 */
export function runAntePresentation(
  root: HTMLElement,
  handNumber: number,
  playerIds: string[],
  callbacks: AntePresentationCallbacks = {},
): boolean {
  const key = antePresentationDedupeKey(handNumber);
  if (lastAnteSequenceKey === key) return false;
  lastAnteSequenceKey = key;

  killAntePresentation();
  clearAntePile(root);
  initCardMotion(root);

  const ids = playerIds.slice(0, 8);
  if (!ids.length) return false;

  const target = readAntePotTarget(root);
  const pile = root.querySelector<HTMLElement>(".bpot__ante-pile");
  if (!target || !pile) return false;

  pile.classList.add("bpot__ante-pile--active");
  const reduced = prefersReducedMotion();
  const staggerSec = computeAnteStaggerMs(ids.length, reduced) / 1000;
  const mergeSec = scaledDuration(ANTE_PILE_MERGE_MS / 1000, reduced);

  const master = gsap.timeline({
    onComplete: () => {
      activeAnteTimeline = null;
      callbacks.onComplete?.();
    },
  });
  activeAnteTimeline = master;

  for (let i = 0; i < ids.length; i += 1) {
    const playerId = ids[i]!;
    const origin = readAnteSeatOrigin(playerId, root);
    if (!origin) continue;
    const startAt = i * staggerSec;
    master.add(
      flyOneAnte(root, playerId, i, origin, target, pile, reduced, callbacks),
      startAt,
    );
  }

  master.to(
    pile,
    {
      scale: 0.82,
      opacity: 0,
      duration: mergeSec,
      ease: PREMIUM_EASE,
      onComplete: () => {
        clearAntePile(root);
      },
    },
    ">-0.04",
  );

  return true;
}

export function clearAntePresentationDedupe(handNumber?: number): void {
  if (handNumber == null || lastAnteSequenceKey === antePresentationDedupeKey(handNumber)) {
    lastAnteSequenceKey = null;
  }
}

/** @internal test helper */
export function _resetAntePresentationForTests(): void {
  lastAnteSequenceKey = null;
  killAntePresentation();
}
