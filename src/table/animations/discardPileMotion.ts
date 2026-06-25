import gsap from "gsap";
import { discardPilePlacement } from "../discardPileModel";
import {
  GSAP_DURATIONS,
  PREMIUM_EASE,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";
import { initCardMotion } from "./initMotion";
import { invertFromFirst, rectFromElement, type MotionRect } from "./flip";

const ACTIVE_DISCARD_FLIGHTS = new Set<gsap.core.Timeline>();

/** Max single-card discard glide (280–420ms spec). */
export const DISCARD_FLY_DURATION_SEC = GSAP_DURATIONS.drawDiscard;
export const DISCARD_FLY_MAX_MS = 420;

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.45,
    midY: dy * 0.45 - Math.max(24, Math.hypot(dx, dy) * 0.2),
  };
}

export function readDiscardPileAnchor(root: ParentNode = document): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el = doc.querySelector("[data-discard-pile-anchor]");
  return el ? rectFromElement(el) : null;
}

export function killDiscardFlights(): void {
  for (const tl of ACTIVE_DISCARD_FLIGHTS) tl.kill();
  ACTIVE_DISCARD_FLIGHTS.clear();
}

function forceCompleteTimeline(tl: gsap.core.Timeline, maxMs: number): void {
  const id = window.setTimeout(() => {
    if (tl.progress() < 1) tl.progress(1);
  }, maxMs);
  tl.eventCallback("onComplete", () => window.clearTimeout(id));
  tl.eventCallback("onInterrupt", () => window.clearTimeout(id));
}

export function animateCardsToDiscardPile(
  cardElements: HTMLElement[],
  cardKeys: string[],
  pileStartIndex: number,
  options: {
    root?: ParentNode;
    onCardComplete?: (index: number) => void;
    onComplete?: () => void;
  } = {},
): gsap.core.Timeline {
  initCardMotion(options.root ?? document);
  const reduced = prefersReducedMotion();
  const root = options.root ?? document;
  const anchor = readDiscardPileAnchor(root);
  const duration = scaledDuration(DISCARD_FLY_DURATION_SEC, reduced);
  const stagger = reduced ? 0.03 : 0.055;
  const tl = gsap.timeline({
    onComplete: () => {
      ACTIVE_DISCARD_FLIGHTS.delete(tl);
      options.onComplete?.();
    },
  });
  ACTIVE_DISCARD_FLIGHTS.add(tl);

  cardElements.forEach((el, i) => {
    const key = cardKeys[i] ?? `discard-${pileStartIndex + i}`;
    const placement = discardPilePlacement(key, pileStartIndex + i);
    const last = rectFromElement(el);

    gsap.set(el, {
      transformOrigin: "50% 50%",
      willChange: "transform,opacity",
      zIndex: 120 + pileStartIndex + i,
    });

    if (!anchor || reduced) {
      tl.to(
        el,
        {
          opacity: 0,
          scale: placement.scale,
          duration: Math.min(duration, 0.2),
          onComplete: () => {
            gsap.set(el, { clearProps: "transform,opacity,willChange,zIndex" });
            options.onCardComplete?.(i);
          },
        },
        i * stagger,
      );
      return;
    }

    const targetCx = anchor.left + anchor.width / 2 + placement.offsetX;
    const targetCy = anchor.top + anchor.height / 2 + placement.offsetY;
    const cardCx = last.left + last.width / 2;
    const cardCy = last.top + last.height / 2;
    const dx = targetCx - cardCx;
    const dy = targetCy - cardCy;
    const { midX, midY } = arcMidpoint(dx, dy);

    gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
    tl.to(
      el,
      {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: midX, y: midY },
            { x: dx, y: dy },
          ],
          curviness: 1.2,
        },
        rotation: placement.rotation,
        scale: placement.scale,
        opacity: 0.92,
        duration,
        ease: PREMIUM_EASE,
        onComplete: () => {
          gsap.set(el, { clearProps: "transform,opacity,willChange,zIndex" });
          options.onCardComplete?.(i);
        },
      },
      i * stagger,
    );
  });

  const totalMs = Math.round(
    (cardElements.length > 0 ? (cardElements.length - 1) * stagger : 0) * 1000 +
      duration * 1000 +
      40,
  );
  forceCompleteTimeline(tl, Math.min(DISCARD_FLY_MAX_MS, Math.max(280, totalMs)));
  return tl;
}

/** Fly from a seat/hand origin rect when no source element exists (bot backs). */
export function animateOriginRectsToDiscardPile(
  origins: MotionRect[],
  cardKeys: string[],
  pileStartIndex: number,
  host: HTMLElement,
  options: {
    onComplete?: () => void;
  } = {},
): gsap.core.Timeline {
  const ghosts: HTMLElement[] = [];
  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i];
    const ghost = document.createElement("div");
    ghost.className = "discard-fly-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.position = "fixed";
    ghost.style.left = `${origin.left}px`;
    ghost.style.top = `${origin.top}px`;
    ghost.style.width = `${origin.width}px`;
    ghost.style.height = `${origin.height}px`;
    ghost.style.pointerEvents = "none";
    host.appendChild(ghost);
    ghosts.push(ghost);
  }

  const tl = animateCardsToDiscardPile(ghosts, cardKeys, pileStartIndex, {
    root: host,
    onComplete: () => {
      for (const g of ghosts) g.remove();
      options.onComplete?.();
    },
  });
  tl.eventCallback("onInterrupt", () => {
    for (const g of ghosts) g.remove();
  });
  return tl;
}

export function seatOriginRectsForDiscard(
  playerId: string,
  count: number,
  root: ParentNode,
): MotionRect[] {
  const el =
    root.querySelector(`[data-seat-play-origin="${playerId}"]`) ??
    root.querySelector(`[data-trick-play-origin="${playerId}"]`);
  if (!el) return [];
  const base = rectFromElement(el);
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    left: base.left + i * 3,
    top: base.top - i * 2,
  }));
}

export function invertGhostToOrigin(ghost: HTMLElement, origin: MotionRect): void {
  const last = rectFromElement(ghost);
  const { x, y } = invertFromFirst(last, origin);
  gsap.set(ghost, { x, y });
}
