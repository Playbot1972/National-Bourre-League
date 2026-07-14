import gsap from "gsap";
import {
  GSAP_DURATIONS,
  MOTION_GHOST_Z_INDEX,
  PREMIUM_EASE_BOUNCE,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";
import { initCardMotion } from "./initMotion";
import { tweenAlongArc } from "./arcTween";
import { rectFromElement, type MotionRect } from "./flip";
import { readDeckOrigin } from "./cardMotion";
import { seatHandOriginRectsForDraw } from "./discardPileMotion";

const ACTIVE_RECEIVE_FLIGHTS = new Set<gsap.core.Timeline>();

/** Max draw-receive glide (aligned with drawReceive presentation schedule). */
export const DRAW_RECEIVE_FLY_MAX_MS = 680;

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.45,
    midY: dy * 0.45 - Math.max(24, Math.hypot(dx, dy) * 0.2),
  };
}

export function killDrawReceiveFlights(): void {
  for (const tl of ACTIVE_RECEIVE_FLIGHTS) tl.kill();
  ACTIVE_RECEIVE_FLIGHTS.clear();
}

function createCardBackGhost(origin: MotionRect): HTMLElement {
  const ghost = document.createElement("div");
  ghost.className = "draw-receive-fly-ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.position = "fixed";
  ghost.style.left = `${origin.left}px`;
  ghost.style.top = `${origin.top}px`;
  ghost.style.width = `${origin.width}px`;
  ghost.style.height = `${origin.height}px`;
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = String(MOTION_GHOST_Z_INDEX);
  return ghost;
}

/** Fly replacement card backs from deck origin into a seat hand anchor (bots). */
export function animateDeckGhostsToSeatOrigins(
  deckOrigin: MotionRect,
  seatOrigins: MotionRect[],
  host: HTMLElement,
  options: {
    onComplete?: () => void;
  } = {},
): gsap.core.Timeline {
  initCardMotion(host);
  const reduced = prefersReducedMotion();
  const duration = scaledDuration(GSAP_DURATIONS.drawReceive, reduced);
  const stagger = reduced ? 0.04 : GSAP_DURATIONS.drawReceiveStagger;
  const ghosts: HTMLElement[] = [];

  for (let i = 0; i < seatOrigins.length; i++) {
    const ghost = createCardBackGhost(deckOrigin);
    host.appendChild(ghost);
    ghosts.push(ghost);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      for (const g of ghosts) g.remove();
      ACTIVE_RECEIVE_FLIGHTS.delete(tl);
      window.clearTimeout(forceId);
      options.onComplete?.();
    },
  });
  ACTIVE_RECEIVE_FLIGHTS.add(tl);

  const totalMs = Math.round(
    (ghosts.length > 0 ? (ghosts.length - 1) * stagger : 0) * 1000 + duration * 1000 + 40,
  );
  const forceId = window.setTimeout(() => {
    if (tl.progress() < 1) tl.progress(1);
  }, Math.min(DRAW_RECEIVE_FLY_MAX_MS, Math.max(320, totalMs)));

  tl.eventCallback("onInterrupt", () => {
    for (const g of ghosts) g.remove();
    ACTIVE_RECEIVE_FLIGHTS.delete(tl);
    window.clearTimeout(forceId);
  });

  ghosts.forEach((ghost, i) => {
    const target = seatOrigins[i];
    const last = rectFromElement(ghost);
    const targetCx = target.left + target.width / 2;
    const targetCy = target.top + target.height / 2;
    const ghostCx = last.left + last.width / 2;
    const ghostCy = last.top + last.height / 2;
    const dx = targetCx - ghostCx;
    const dy = targetCy - ghostCy;
    const { midX, midY } = arcMidpoint(dx, dy);

    gsap.set(ghost, {
      transformOrigin: "50% 80%",
      willChange: "transform,opacity",
      x: 0,
      y: 0,
      rotationY: reduced ? 0 : -72,
      scale: reduced ? 1 : 0.76,
      opacity: reduced ? 1 : 0,
    });

    if (reduced) {
      tl.to(
        ghost,
        {
          x: dx,
          y: dy,
          opacity: 0.5,
          duration: Math.min(duration, 0.18),
        },
        i * stagger,
      );
      tl.to(
        ghost,
        {
          opacity: 0,
          duration: Math.min(duration, 0.08),
          onComplete: () => {
            gsap.set(ghost, { clearProps: "transform,opacity,willChange" });
          },
        },
        i * stagger + Math.min(duration, 0.18),
      );
      return;
    }

    const travelAt = i * stagger;
    const fadeAt = travelAt + duration * 0.78;
    tl.add(
      tweenAlongArc(ghost, {
        path: [
          { x: 0, y: 0 },
          { x: midX, y: midY },
          { x: dx, y: dy },
        ],
        curviness: 1.2,
        rotationY: 0,
        scale: 1,
        opacity: 0.92,
        duration: duration * 0.78,
        ease: PREMIUM_EASE_BOUNCE,
      }),
      travelAt,
    );
    tl.to(
      ghost,
      {
        opacity: 0,
        scale: 0.92,
        duration: duration * 0.22,
        ease: "power1.in",
        onComplete: () => {
          gsap.set(ghost, { clearProps: "transform,opacity,willChange" });
        },
      },
      fadeAt,
    );
  });

  return tl;
}

export function runBotDrawReceiveFly(input: {
  playerId: string;
  replaceCount: number;
  root: HTMLElement;
  onComplete?: () => void;
}): void {
  const { playerId, replaceCount, root, onComplete } = input;
  if (replaceCount <= 0) {
    onComplete?.();
    return;
  }
  const deck = readDeckOrigin(root);
  const seats = seatHandOriginRectsForDraw(playerId, replaceCount, root);
  if (!deck || !seats.length) {
    onComplete?.();
    return;
  }
  animateDeckGhostsToSeatOrigins(deck, seats, root, { onComplete });
}
