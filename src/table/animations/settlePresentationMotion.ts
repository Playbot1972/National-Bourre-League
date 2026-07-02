import { gsap } from "gsap";
import { prefersReducedMotion } from "../trickTiming";
import { logPresentationPhase } from "../gameFlowDebug";
import { setSettleMotionActive } from "../presentationMotionBusy";

const CHIP_COUNT = 5;

function settleChipElements(
  fromEl: HTMLElement,
  toEl: HTMLElement,
  count: number,
): HTMLElement[] {
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const chips: HTMLElement[] = [];
  const layer = document.createElement("div");
  layer.className = "btable-settle-chip-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  for (let i = 0; i < count; i += 1) {
    const chip = document.createElement("span");
    chip.className = "btable-settle-chip";
    chip.style.left = `${fromRect.left + fromRect.width / 2}px`;
    chip.style.top = `${fromRect.top + fromRect.height / 2}px`;
    layer.appendChild(chip);
    chips.push(chip);
  }

  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  const toX = toRect.left + toRect.width / 2;
  const toY = toRect.top + toRect.height / 2;

  return chips.map((chip, index) => {
    const spread = (index - (count - 1) / 2) * 6;
    chip.dataset.settleFromX = String(fromX + spread);
    chip.dataset.settleFromY = String(fromY);
    chip.dataset.settleToX = String(toX + spread * 0.4);
    chip.dataset.settleToY = String(toY);
    return chip;
  });
}

function flyChips(
  chips: HTMLElement[],
  duration: number,
  onComplete: () => void,
): gsap.core.Timeline {
  const tl = gsap.timeline({ onComplete });
  chips.forEach((chip, index) => {
    const fromX = Number(chip.dataset.settleFromX);
    const fromY = Number(chip.dataset.settleFromY);
    const toX = Number(chip.dataset.settleToX);
    const toY = Number(chip.dataset.settleToY);
    tl.fromTo(
      chip,
      { x: 0, y: 0, opacity: 0.95, scale: 0.85 },
      {
        x: toX - fromX,
        y: toY - fromY,
        opacity: 0.35,
        scale: 0.55,
        duration,
        ease: "power2.inOut",
        delay: index * 0.04,
      },
      0,
    );
  });
  return tl;
}

function cleanupChips(chips: HTMLElement[]): void {
  const layer = chips[0]?.parentElement;
  chips.forEach((chip) => chip.remove());
  layer?.remove();
}

export type SettleMotionKind = "potPayout" | "bourrePenalty";

export type SettleMotionOptions = {
  kind: SettleMotionKind;
  fromEl: HTMLElement | null;
  toEl: HTMLElement | null;
  durationMs: number;
  onComplete: () => void;
};

/** Pot→winner payout or seat→pot Bourré penalty chip flight. */
export function runSettlePresentationMotion(options: SettleMotionOptions): () => void {
  const { kind, fromEl, toEl, durationMs, onComplete } = options;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    setSettleMotionActive(false);
    onComplete();
  };

  if (!fromEl || !toEl || prefersReducedMotion()) {
    logPresentationPhase("settle-motion-skip", { kind, reason: "missing-target-or-reduced-motion" });
    finish();
    return finish;
  }

  setSettleMotionActive(true);
  logPresentationPhase("settle-motion-start", { kind });

  const chips = settleChipElements(fromEl, toEl, CHIP_COUNT);
  const duration = Math.max(0.2, durationMs / 1000);

  const tl = flyChips(chips, duration, () => {
    cleanupChips(chips);
    logPresentationPhase("settle-motion-complete", { kind });
    finish();
  });

  return () => {
    tl.kill();
    cleanupChips(chips);
    finish();
  };
}
