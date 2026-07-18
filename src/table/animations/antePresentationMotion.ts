import gsap from "gsap";
import { activePlayerOrder } from "../../game/playerOrder";
import {
  ANTE_CHIP_STAGGER_MS,
  ANTE_CHIP_TRAVEL_MS,
  antePresentationFlightMs,
} from "../handPresentationTiming";
import { PREMIUM_EASE, prefersReducedMotion, scaledDuration } from "./motionTokens";
import { tweenAlongArc } from "./arcTween";
import { invertFromFirst, rectFromElement, type MotionRect } from "./flip";

const ACTIVE_ANTE_TIMELINES = new Set<gsap.core.Timeline>();

/** Clockwise ante order — dealer posts last. */
export function antePostOrder(
  dealerId: string | null | undefined,
  participantIds: string[],
  seatRing: string[],
): string[] {
  const ring = seatRing.length ? seatRing : participantIds;
  return activePlayerOrder(dealerId, participantIds, ring);
}

export function readAnteSeatOrigin(playerId: string, root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el =
    doc.querySelector<HTMLElement>(`[data-seat-motion-anchor="${playerId}"]`) ??
    doc.querySelector<HTMLElement>(`[data-seat-play-origin="${playerId}"]`) ??
    doc.querySelector<HTMLElement>(`[data-pacing-player-id="${playerId}"] .bseat__stack`);
  return el ? rectFromElement(el) : null;
}

export function readAntePotTarget(root: ParentNode): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el =
    doc.querySelector<HTMLElement>("[data-ante-pot-target]") ??
    doc.querySelector<HTMLElement>('[data-testid="pot-display"]');
  return el ? rectFromElement(el) : null;
}

function createAnteGhost(origin: MotionRect): HTMLElement {
  const ghost = document.createElement("span");
  ghost.className = "ante-fly-ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.position = "fixed";
  ghost.style.left = `${origin.left}px`;
  ghost.style.top = `${origin.top}px`;
  ghost.style.width = `${Math.max(12, origin.width * 0.55)}px`;
  ghost.style.height = `${Math.max(12, origin.height * 0.55)}px`;
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "6";
  return ghost;
}

export function killAntePresentation(): void {
  for (const tl of ACTIVE_ANTE_TIMELINES) tl.kill();
  ACTIVE_ANTE_TIMELINES.clear();
}

export function hasActiveAntePresentation(): boolean {
  return ACTIVE_ANTE_TIMELINES.size > 0;
}

export interface RunAntePresentationInput {
  order: string[];
  root: HTMLElement;
  onCoinLanded?: (playerId: string) => void;
  onComplete?: () => void;
}

/** Seat-origin ghosts fly to the pot — one coin per seat, clockwise, dealer last. */
export function runAntePresentation({
  order,
  root,
  onCoinLanded,
  onComplete,
}: RunAntePresentationInput): gsap.core.Timeline {
  killAntePresentation();

  const reduced = prefersReducedMotion();
  const travelSec = scaledDuration(ANTE_CHIP_TRAVEL_MS / 1000, reduced);
  const staggerSec = reduced ? 0.04 : ANTE_CHIP_STAGGER_MS / 1000;
  const pot = readAntePotTarget(root);
  let landed = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    ACTIVE_ANTE_TIMELINES.delete(tl);
    onComplete?.();
  };

  const markLanded = (playerId: string) => {
    onCoinLanded?.(playerId);
    landed += 1;
    if (landed >= order.length) finish();
  };

  const tl = gsap.timeline({
    onInterrupt: () => {
      finished = true;
      ACTIVE_ANTE_TIMELINES.delete(tl);
      for (const ghost of root.querySelectorAll(".ante-fly-ghost")) ghost.remove();
    },
  });
  ACTIVE_ANTE_TIMELINES.add(tl);

  if (!order.length) {
    finish();
    return tl;
  }

  order.forEach((playerId, i) => {
    const position = i * staggerSec;
    tl.call(
      () => {
        const origin = readAnteSeatOrigin(playerId, root);
        if (!origin || !pot) {
          markLanded(playerId);
          return;
        }

        const ghost = createAnteGhost(origin);
        root.appendChild(ghost);
        const ghostRect = rectFromElement(ghost);
        const { x, y } = invertFromFirst(ghostRect, origin);
        const targetCx = pot.left + pot.width / 2;
        const targetCy = pot.top + pot.height / 2;
        const ghostCx = ghostRect.left + ghostRect.width / 2;
        const ghostCy = ghostRect.top + ghostRect.height / 2;
        const dx = targetCx - ghostCx;
        const dy = targetCy - ghostCy;

        const { midX, midY } = {
          midX: dx * 0.38,
          midY: dy * 0.38 - Math.max(18, Math.hypot(dx, dy) * 0.18),
        };

        gsap.set(ghost, {
          x,
          y,
          opacity: reduced ? 1 : 0.88,
          scale: reduced ? 1 : 0.82,
          rotation: reduced ? 0 : -28,
        });

        const onLand = () => {
          ghost.remove();
          markLanded(playerId);
        };

        if (reduced) {
          gsap.to(ghost, {
            x: dx,
            y: dy,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: travelSec,
            ease: PREMIUM_EASE,
            onComplete: onLand,
          });
          return;
        }

        const flight = gsap.timeline({ onComplete: onLand });
        flight.add(
          tweenAlongArc(ghost, {
            path: [
              { x, y },
              { x: x + midX, y: y + midY },
              { x: dx, y: dy },
            ],
            curviness: 1.15,
            opacity: 1,
            duration: travelSec,
            ease: PREMIUM_EASE,
          }),
          0,
        );
        flight.to(
          ghost,
          {
            rotation: 18,
            scale: 1.05,
            duration: travelSec * 0.55,
            ease: PREMIUM_EASE,
          },
          0,
        );
        flight.to(
          ghost,
          {
            rotation: 0,
            scale: 1,
            duration: travelSec * 0.45,
            ease: PREMIUM_EASE,
          },
          travelSec * 0.55,
        );
        flight.to(
          ghost,
          {
            scale: 0.96,
            duration: travelSec * 0.12,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          travelSec * 0.82,
        );
      },
      undefined,
      position,
    );
  });

  const forceMs = antePresentationFlightMs(order.length, reduced) + 80;
  const forceId = window.setTimeout(finish, forceMs);
  tl.eventCallback("onInterrupt", () => window.clearTimeout(forceId));

  return tl;
}
