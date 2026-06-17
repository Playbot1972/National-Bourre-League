/** Safe padding inside the gameplay stage before seat anchors are placed. */
export const STAGE_SEAT_INSET = {
  top: 0.07,
  right: 0.06,
  bottom: 0.09,
  left: 0.06,
} as const;

/** Extra viewport pad so avatar/metadata outside the felt stays inside contain-fit. */
export const STAGE_SEAT_OVERFLOW_PAD = 28;

export interface StageFitInput {
  availWidth: number;
  availHeight: number;
  aspect: number;
  userScale: number;
  padX: number;
  padY: number;
  heroMinHeight: number;
  gap: number;
}

export interface StageFitResult {
  stageWidth: number;
  stageHeight: number;
  fitScale: number;
  effectiveScale: number;
  /** Pixel width/height after contain-fit (excludes extra user table scale). */
  displayStageWidth: number;
  displayStageHeight: number;
}

/** Contain-fit the table stage + hero hand inside the available viewport box. */
/** Keep hero budget at peak measured height so draw→play UI changes do not shrink the stage. */
export function stabilizeHeroHeight(
  measured: number,
  peak: number,
  floor: number,
): { height: number; peak: number } {
  const safe = Number.isFinite(measured) && measured > 0 ? measured : 0;
  const nextPeak = safe > 0 ? Math.max(peak, safe) : peak;
  const height = nextPeak > 0 ? nextPeak : floor;
  return { height: Math.max(height, floor), peak: nextPeak };
}

export function computeStageFit(input: StageFitInput): StageFitResult {
  const {
    availWidth,
    availHeight,
    aspect,
    userScale,
    padX,
    padY,
    heroMinHeight,
    gap,
  } = input;

  const scale = Math.max(0.85, Math.min(1.35, userScale || 1));
  const maxW = Math.max(0, availWidth - padX * 2);
  const maxH = Math.max(0, availHeight - padY * 2);
  const stageBudgetH = Math.max(120, maxH - heroMinHeight - gap);

  let stageW = maxW;
  let stageH = stageW / aspect;
  if (stageH > stageBudgetH) {
    stageH = stageBudgetH;
    stageW = stageH * aspect;
  }

  const contentW = stageW;
  const contentH = stageH + gap + heroMinHeight;
  const fitScale = Math.max(
    0,
    Math.min(1, maxW / (contentW * scale), maxH / (contentH * scale)),
  );
  const displayStageWidth = stageW * fitScale;
  const displayStageHeight = stageH * fitScale;

  return {
    stageWidth: stageW,
    stageHeight: stageH,
    fitScale,
    effectiveScale: fitScale * scale,
    displayStageWidth,
    displayStageHeight,
  };
}

export interface BoundsRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function rectFromDomRect(r: DOMRect): BoundsRect {
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

export function isWithinViewport(
  inner: BoundsRect,
  viewport: BoundsRect,
  tolerancePx = 2,
): boolean {
  return (
    inner.left >= viewport.left - tolerancePx &&
    inner.top >= viewport.top - tolerancePx &&
    inner.right <= viewport.right + tolerancePx &&
    inner.bottom <= viewport.bottom + tolerancePx
  );
}
