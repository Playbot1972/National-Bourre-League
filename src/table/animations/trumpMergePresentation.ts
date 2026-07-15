import gsap from "gsap";
import { flipDelta, invertFromFirst, rectFromElement } from "./flip";
import { GSAP_DURATIONS, MOTION_GHOST_Z_INDEX, scaledDuration } from "./motionTokens";
import { initCardMotion } from "./initMotion";
import { tweenAlongArc } from "./arcTween";

let activeMerge: gsap.core.Timeline | null = null;

export function killTrumpMergePresentation(): void {
  activeMerge?.kill();
  activeMerge = null;
}

/** Fly the center trump card into the hero merge slot (one ghost, no duplicate pop). */
export function runTrumpMergeIntoHeroHand(
  root: HTMLElement,
  options: { onComplete?: () => void } = {},
): gsap.core.Timeline | null {
  initCardMotion(root);
  killTrumpMergePresentation();

  const sourceCard = root.querySelector<HTMLElement>("[data-trump-deal-target] .pcard");
  const targetCard = root.querySelector<HTMLElement>(".hand__slot--trump-merge-target .pcard");
  if (!sourceCard || !targetCard) {
    options.onComplete?.();
    return null;
  }

  const sourceRect = rectFromElement(sourceCard);
  const targetRect = rectFromElement(targetCard);
  const { x: dx, y: dy } = flipDelta(sourceRect, targetRect);

  const ghost = sourceCard.cloneNode(true) as HTMLElement;
  ghost.className = `${ghost.className} trump-merge-fly-ghost`.trim();
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.position = "fixed";
  ghost.style.left = `${sourceRect.left}px`;
  ghost.style.top = `${sourceRect.top}px`;
  ghost.style.width = `${sourceRect.width}px`;
  ghost.style.height = `${sourceRect.height}px`;
  ghost.style.margin = "0";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = String(MOTION_GHOST_Z_INDEX + 2);
  ghost.style.transformOrigin = "50% 80%";
  document.body.appendChild(ghost);

  const sourceWrap = sourceCard.closest<HTMLElement>("[data-trump-deal-target]");
  gsap.set(sourceCard, { opacity: 0 });
  if (sourceWrap) gsap.set(sourceWrap, { opacity: 0 });
  gsap.set(targetCard, { opacity: 0 });

  const ghostRect = rectFromElement(ghost);
  const { x: startX, y: startY } = invertFromFirst(ghostRect, sourceRect);
  gsap.set(ghost, { x: startX, y: startY, force3D: true });

  const duration = scaledDuration(GSAP_DURATIONS.trumpMerge);
  const midX = dx * 0.45;
  const midY = dy * 0.45 - Math.max(24, Math.hypot(dx, dy) * 0.18);

  const tl = gsap.timeline({
    onComplete: () => {
      ghost.remove();
      gsap.set(targetCard, { clearProps: "opacity" });
      if (sourceWrap) gsap.set(sourceWrap, { clearProps: "opacity" });
      gsap.set(sourceCard, { clearProps: "opacity" });
      activeMerge = null;
      options.onComplete?.();
    },
    onInterrupt: () => {
      ghost.remove();
      gsap.set(targetCard, { clearProps: "opacity" });
      if (sourceWrap) gsap.set(sourceWrap, { clearProps: "opacity" });
      gsap.set(sourceCard, { clearProps: "opacity" });
      activeMerge = null;
    },
  });

  tl.add(
    tweenAlongArc(ghost, {
      path: [
        { x: startX, y: startY },
        { x: startX + midX, y: startY + midY },
        { x: startX + dx, y: startY + dy },
      ],
      curviness: 1.2,
      rotation: 6,
      scale: 1.02,
      duration,
      ease: "power2.inOut",
    }),
  );

  activeMerge = tl;
  return tl;
}
