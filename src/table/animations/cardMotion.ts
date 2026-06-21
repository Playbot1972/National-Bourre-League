import gsap from "gsap";
import {
  GSAP_DURATIONS,
  PREMIUM_EASE,
  PREMIUM_EASE_BOUNCE,
  PREMIUM_EASE_IN_OUT,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";
import { flipDelta, invertFromFirst, rectFromElement, type MotionRect } from "./flip";
import { initCardMotion } from "./initMotion";

function ensureMotion(): void {
  initCardMotion();
}

const ACTIVE_TWEENS = new WeakMap<Element, gsap.core.Animation>();

export function readDeckOrigin(root: ParentNode = document): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el =
    doc.querySelector('[data-testid="deal-button"]') ??
    doc.querySelector(".deck-stack__pile") ??
    doc.querySelector(".deck-stack");
  return el ? rectFromElement(el) : null;
}

function trackTween(el: Element, tween: gsap.core.Animation): gsap.core.Animation {
  ACTIVE_TWEENS.get(el)?.kill();
  ACTIVE_TWEENS.set(el, tween);
  return tween;
}

export function killCardMotion(el?: Element | null): void {
  if (!el) return;
  ACTIVE_TWEENS.get(el)?.kill();
  ACTIVE_TWEENS.delete(el);
  gsap.killTweensOf(el);
  gsap.set(el, { clearProps: "transform,opacity,filter" });
}

function arcMidpoint(dx: number, dy: number, lift = 0.22): { midX: number; midY: number } {
  return {
    midX: dx * 0.45,
    midY: dy * 0.45 - Math.max(28, Math.hypot(dx, dy) * lift),
  };
}

/** FLIP: element at `last` position animates from `first` rect. */
export function animateFlipFromRect(
  element: HTMLElement,
  first: MotionRect,
  options: {
    duration?: number;
    rotation?: number;
    scale?: number;
    arc?: boolean;
    onComplete?: () => void;
  } = {},
): gsap.core.Tween {
  ensureMotion();
  const reduced = prefersReducedMotion();
  const last = rectFromElement(element);
  const { x, y } = invertFromFirst(last, first);
  const duration = options.duration ?? scaledDuration(GSAP_DURATIONS.playToTable, reduced);
  const rotation = options.rotation ?? -10;
  const scale = options.scale ?? 0.9;

  gsap.set(element, { transformOrigin: "50% 50%", willChange: "transform,opacity" });
  gsap.set(element, { x, y, rotation, scale, opacity: reduced ? 1 : 0.92 });

  if (options.arc && !reduced) {
    const { midX, midY } = arcMidpoint(x, y);
    return trackTween(
      element,
      gsap.to(element, {
        motionPath: {
          path: [
            { x, y },
            { x: midX, y: midY },
            { x: 0, y: 0 },
          ],
          curviness: 1.25,
        },
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease: PREMIUM_EASE,
        onComplete: () => {
          gsap.set(element, { clearProps: "transform,opacity,willChange" });
          options.onComplete?.();
        },
      }),
    );
  }

  return trackTween(
    element,
    gsap.to(element, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease: PREMIUM_EASE_BOUNCE,
      onComplete: () => {
        gsap.set(element, { clearProps: "transform,opacity,willChange" });
        options.onComplete?.();
      },
    }),
  );
}

/** Play card from hand origin to trick slot (FLIP + arc). */
export function animateCardToTable(
  cardElement: HTMLElement,
  origin: MotionRect,
  options: { onComplete?: () => void } = {},
): gsap.core.Tween {
  return animateFlipFromRect(cardElement, origin, {
    arc: true,
    onComplete: options.onComplete,
  });
}

/** Deal stagger from deck pile to hand slots. */
export function dealCardsFromDeck(
  cardElements: HTMLElement[],
  deckOrigin: MotionRect,
  staggerSec = GSAP_DURATIONS.dealStagger,
): gsap.core.Timeline {
  ensureMotion();
  const reduced = prefersReducedMotion();
  const tl = gsap.timeline();
  const duration = scaledDuration(GSAP_DURATIONS.deal, reduced);

  cardElements.forEach((el, i) => {
    const last = rectFromElement(el);
    const { x, y } = invertFromFirst(last, deckOrigin);
    const { midX, midY } = arcMidpoint(x, y, 0.28);
    gsap.set(el, { transformOrigin: "50% 80%", willChange: "transform,opacity" });
    gsap.set(el, {
      x,
      y,
      rotation: -14 + i * 2,
      rotationY: reduced ? 0 : -72,
      scale: 0.58,
      opacity: reduced ? 1 : 0,
    });
    tl.to(
      el,
      {
        motionPath: reduced
          ? undefined
          : {
              path: [
                { x, y },
                { x: midX, y: midY },
                { x: 0, y: 0 },
              ],
              curviness: 1.2,
            },
        x: reduced ? 0 : undefined,
        y: reduced ? 0 : undefined,
        rotation: 0,
        rotationY: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease: PREMIUM_EASE,
        onComplete: () => gsap.set(el, { clearProps: "transform,opacity,willChange" }),
      },
      i * (reduced ? 0.04 : staggerSec),
    );
  });
  return tl;
}

export function animateDrawDiscard(cards: HTMLElement[]): gsap.core.Timeline {
  ensureMotion();
  const tl = gsap.timeline();
  const duration = scaledDuration(GSAP_DURATIONS.drawDiscard);
  cards.forEach((el, i) => {
    gsap.set(el, { transformOrigin: "50% 50%", willChange: "transform,opacity" });
    tl.to(
      el,
      {
        x: 56 + i * 8,
        y: 42,
        rotation: 18 + i * 4,
        rotationX: 48,
        scale: 0.72,
        opacity: 0,
        duration,
        ease: PREMIUM_EASE_IN_OUT,
        onComplete: () => killCardMotion(el),
      },
      i * 0.05,
    );
  });
  return tl;
}

export function animateDrawReceive(
  cards: HTMLElement[],
  deckOrigin: MotionRect,
): gsap.core.Timeline {
  ensureMotion();
  const reduced = prefersReducedMotion();
  const tl = gsap.timeline();
  const duration = scaledDuration(GSAP_DURATIONS.drawReceive, reduced);
  const stagger = reduced ? 0.04 : GSAP_DURATIONS.drawReceiveStagger;

  cards.forEach((el, i) => {
    const last = rectFromElement(el);
    const { x, y } = invertFromFirst(last, deckOrigin);
    gsap.set(el, { transformOrigin: "50% 80%", willChange: "transform,opacity" });
    gsap.set(el, { x, y, rotationY: -80, scale: 0.76, opacity: 0 });
    tl.to(
      el,
      {
        x: 0,
        y: 0,
        rotationY: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease: PREMIUM_EASE_BOUNCE,
        onComplete: () => gsap.set(el, { clearProps: "transform,opacity,willChange" }),
      },
      i * stagger,
    );
  });
  return tl;
}

export function animateStandPat(cards: HTMLElement[]): gsap.core.Timeline {
  ensureMotion();
  const tl = gsap.timeline();
  const duration = scaledDuration(GSAP_DURATIONS.standPat);
  cards.forEach((el) => {
    tl.fromTo(
      el,
      { filter: "drop-shadow(0 0 0 rgba(244,213,141,0))" },
      {
        y: -5,
        scale: 1.02,
        filter: "drop-shadow(0 10px 18px rgba(244,213,141,0.45))",
        duration: duration * 0.45,
        ease: PREMIUM_EASE,
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.set(el, { clearProps: "transform,filter,willChange" }),
      },
      0,
    );
  });
  return tl;
}

export function animateFoldOut(cards: HTMLElement[]): gsap.core.Timeline {
  ensureMotion();
  const tl = gsap.timeline();
  const duration = scaledDuration(GSAP_DURATIONS.foldOut);
  cards.forEach((el, i) => {
    gsap.set(el, { transformOrigin: "50% 50%", willChange: "transform,opacity" });
    tl.to(
      el,
      {
        x: -20 - i * 6,
        y: 48,
        rotation: -8,
        rotationX: 22,
        scale: 0.9,
        opacity: 0.3,
        filter: "grayscale(0.45) brightness(0.88)",
        duration,
        ease: PREMIUM_EASE_IN_OUT,
        onComplete: () => killCardMotion(el),
      },
      i * 0.04,
    );
  });
  return tl;
}

export function animateTrumpMerge(card: HTMLElement): gsap.core.Tween {
  ensureMotion();
  const duration = scaledDuration(GSAP_DURATIONS.trumpMerge);
  gsap.set(card, { transformOrigin: "50% 80%", willChange: "transform" });
  return trackTween(
    card,
    gsap.fromTo(
      card,
      { y: -36, scale: 1.12, rotationX: 16, opacity: 0.88 },
      {
        y: 0,
        scale: 1,
        rotationX: 0,
        opacity: 1,
        duration,
        ease: PREMIUM_EASE_BOUNCE,
        onComplete: () => gsap.set(card, { clearProps: "transform,opacity,willChange" }),
      },
    ),
  );
}

/** Lift card in hand before play (physical pick-up). */
export function animatePlayLift(card: HTMLElement): gsap.core.Tween {
  ensureMotion();
  const duration = scaledDuration(0.32);
  gsap.set(card, { transformOrigin: "50% 90%", willChange: "transform" });
  return trackTween(
    card,
    gsap.to(card, {
      y: -26,
      rotationX: 14,
      rotationY: -10,
      scale: 1.05,
      duration,
      ease: PREMIUM_EASE,
    }),
  );
}

export function flyOffsetToSlot(
  origin: MotionRect,
  slotRect: DOMRect,
  cardRect: DOMRect,
): { dx: number; dy: number } {
  const o = {
    left: origin.left,
    top: origin.top,
    width: origin.width,
    height: origin.height,
  };
  const slot = {
    left: slotRect.left,
    top: slotRect.top,
    width: slotRect.width,
    height: slotRect.height,
  };
  const card = {
    left: cardRect.left,
    top: cardRect.top,
    width: cardRect.width,
    height: cardRect.height,
  };
  return flipDelta(o, card);
}
