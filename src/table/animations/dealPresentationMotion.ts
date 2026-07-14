import { gsap } from "./gsapPlugins";
import { CARDS_PER_PLAYER } from "../../game/playerOrder";
import { readDeckOrigin } from "./cardMotion";
import {
  GSAP_DURATIONS,
  MOTION_GHOST_Z_INDEX,
  PREMIUM_EASE,
  PREMIUM_EASE_BOUNCE,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";
import { initCardMotion } from "./initMotion";
import { invertFromFirst, rectFromElement, type MotionRect } from "./flip";

/** Per-card travel from deck to seat (calm premium pace). */
export const DEAL_STEP_TRAVEL_MS = 540;
/** Brief settle after each dealt card lands. */
export const DEAL_STEP_SETTLE_MS = 130;
/** Gap between consecutive deal steps. */
export const DEAL_STEP_GAP_MS = 110;

const ACTIVE_DEAL_TIMELINES = new Set<gsap.core.Timeline>();

export interface DealStep {
  playerId: string;
  roundIndex: number;
  stepIndex: number;
}

export function buildClockwiseDealSteps(
  dealOrder: string[],
  cardsPerPlayer = CARDS_PER_PLAYER,
): DealStep[] {
  const steps: DealStep[] = [];
  for (let round = 0; round < cardsPerPlayer; round += 1) {
    for (const playerId of dealOrder) {
      steps.push({ playerId, roundIndex: round, stepIndex: steps.length });
    }
  }
  return steps;
}

export function dealPresentationDurationMs(
  stepCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  if (stepCount <= 0) return 0;
  const scale = reducedMotion ? 0.35 : 1;
  const perStep = Math.round(
    (DEAL_STEP_TRAVEL_MS + DEAL_STEP_SETTLE_MS + DEAL_STEP_GAP_MS) * scale,
  );
  const travel = Math.round(DEAL_STEP_TRAVEL_MS * scale);
  return (stepCount - 1) * perStep + travel + Math.round(DEAL_STEP_SETTLE_MS * scale);
}

export function readDealTargetRect(
  playerId: string,
  roundIndex: number,
  root: ParentNode,
  trumpHolderId?: string | null,
): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const isTrumpDeal =
    trumpHolderId &&
    playerId === trumpHolderId &&
    roundIndex === CARDS_PER_PLAYER - 1;
  if (isTrumpDeal) {
    const trumpTarget = doc.querySelector<HTMLElement>("[data-trump-deal-target]");
    if (trumpTarget) return rectFromElement(trumpTarget);
  }
  const slot =
    doc.querySelector<HTMLElement>(
      `[data-deal-seat="${playerId}"][data-deal-round="${roundIndex}"]`,
    ) ??
    doc.querySelector<HTMLElement>(
      `[data-deal-seat="${playerId}"] [data-deal-round="${roundIndex}"]`,
    );
  const card = slot?.querySelector(".pcard") ?? slot;
  return card ? rectFromElement(card) : null;
}

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.45,
    midY: dy * 0.45 - Math.max(28, Math.hypot(dx, dy) * 0.24),
  };
}

function createDealGhost(origin: MotionRect): HTMLElement {
  const ghost = document.createElement("div");
  ghost.className = "deal-fly-ghost";
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

export function revealDealCard(
  playerId: string,
  roundIndex: number,
  root: ParentNode,
  trumpHolderId?: string | null,
): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const isTrumpDeal =
    trumpHolderId &&
    playerId === trumpHolderId &&
    roundIndex === CARDS_PER_PLAYER - 1;
  if (isTrumpDeal) {
    doc
      .querySelector<HTMLElement>("[data-trump-deal-target]")
      ?.classList.add("deal-card--revealed");
    doc
      .querySelector<HTMLElement>(
        `[data-deal-seat="${playerId}"][data-deal-round="${roundIndex}"]`,
      )
      ?.classList.add("deal-card--revealed");
    return;
  }
  const slot = doc.querySelector<HTMLElement>(
    `[data-deal-seat="${playerId}"][data-deal-round="${roundIndex}"]`,
  );
  slot?.classList.add("deal-card--revealed");
}

export function resetDealRevealMarkers(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  for (const el of doc.querySelectorAll(".deal-card--revealed")) {
    el.classList.remove("deal-card--revealed");
  }
  for (const ghost of doc.querySelectorAll(".deal-fly-ghost")) {
    ghost.remove();
  }
}

export function killDealPresentation(): void {
  for (const tl of ACTIVE_DEAL_TIMELINES) tl.kill();
  ACTIVE_DEAL_TIMELINES.clear();
}

export function hasActiveDealPresentation(): boolean {
  return ACTIVE_DEAL_TIMELINES.size > 0;
}

export interface RunClockwiseDealInput {
  steps: DealStep[];
  root: HTMLElement;
  trumpHolderId?: string | null;
  onStepComplete?: (step: DealStep) => void;
  onComplete?: () => void;
}

/** Sequential deck-origin ghosts — one card per seat per round, clockwise. */
export function runClockwiseDealPresentation({
  steps,
  root,
  trumpHolderId = null,
  onStepComplete,
  onComplete,
}: RunClockwiseDealInput): gsap.core.Timeline {
  initCardMotion(root);
  killDealPresentation();

  const reduced = prefersReducedMotion();
  const travelSec = scaledDuration(DEAL_STEP_TRAVEL_MS / 1000, reduced);
  const settleSec = scaledDuration(DEAL_STEP_SETTLE_MS / 1000, reduced);
  const gapSec = reduced ? 0.04 : DEAL_STEP_GAP_MS / 1000;
  const deck = readDeckOrigin(root);

  const tl = gsap.timeline({
    onComplete: () => {
      ACTIVE_DEAL_TIMELINES.delete(tl);
      onComplete?.();
    },
    onInterrupt: () => {
      ACTIVE_DEAL_TIMELINES.delete(tl);
      for (const ghost of root.querySelectorAll(".deal-fly-ghost")) ghost.remove();
    },
  });
  ACTIVE_DEAL_TIMELINES.add(tl);

  if (!deck || steps.length === 0) {
    for (const step of steps) revealDealCard(step.playerId, step.roundIndex, root, trumpHolderId);
    tl.call(() => onComplete?.());
    return tl;
  }

  steps.forEach((step, i) => {
    const position = i * (travelSec + settleSec + gapSec);
    const target = readDealTargetRect(step.playerId, step.roundIndex, root, trumpHolderId);

    tl.call(
      () => {
        if (!target) {
          revealDealCard(step.playerId, step.roundIndex, root, trumpHolderId);
          onStepComplete?.(step);
          return;
        }

        const ghost = createDealGhost(deck);
        root.appendChild(ghost);
        const ghostRect = rectFromElement(ghost);
        const { x, y } = invertFromFirst(ghostRect, deck);
        const targetCx = target.left + target.width / 2;
        const targetCy = target.top + target.height / 2;
        const ghostCx = ghostRect.left + ghostRect.width / 2;
        const ghostCy = ghostRect.top + ghostRect.height / 2;
        const dx = targetCx - ghostCx;
        const dy = targetCy - ghostCy;
        const { midX, midY } = arcMidpoint(dx, dy);

        gsap.set(ghost, {
          transformOrigin: "50% 80%",
          willChange: "transform,opacity",
          x,
          y,
          rotation: -12,
          rotationY: reduced ? 0 : -68,
          scale: reduced ? 1 : 0.62,
          opacity: reduced ? 1 : 0,
        });

        const inner = gsap.timeline({
          onComplete: () => {
            ghost.remove();
            revealDealCard(step.playerId, step.roundIndex, root, trumpHolderId);
            onStepComplete?.(step);
          },
        });

        if (reduced) {
          inner.to(ghost, {
            x: dx,
            y: dy,
            rotation: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            duration: travelSec,
            ease: PREMIUM_EASE,
          });
        } else {
          inner.to(ghost, {
            motionPath: {
              path: [
                { x, y },
                { x: x + midX, y: y + midY },
                { x: dx, y: dy },
              ],
              curviness: 1.2,
            },
            rotation: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            duration: travelSec,
            ease: PREMIUM_EASE,
          });
        }

        inner.to(
          ghost,
          {
            scale: 1.02,
            duration: settleSec * 0.45,
            yoyo: true,
            repeat: 1,
            ease: PREMIUM_EASE_BOUNCE,
          },
          travelSec,
        );
      },
      undefined,
      position,
    );
  });

  const forceMs = dealPresentationDurationMs(steps.length, reduced) + 120;
  const forceId = window.setTimeout(() => {
    if (tl.progress() < 1) tl.progress(1);
  }, forceMs);
  tl.eventCallback("onComplete", () => window.clearTimeout(forceId));
  tl.eventCallback("onInterrupt", () => window.clearTimeout(forceId));

  return tl;
}

/** @deprecated Hero-only stagger — prefer runClockwiseDealPresentation. */
export { GSAP_DURATIONS as DEAL_GSAP_DURATIONS };
