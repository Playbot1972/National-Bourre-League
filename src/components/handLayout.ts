/** Compute fan overlap (negative margin-left) from container width and card count. */
export function computeHandFanOverlapPx(
  containerWidth: number,
  cardCount: number,
  cardWidth: number,
  opts?: { minVisiblePx?: number; maxGapPx?: number },
): number {
  const minVisible = opts?.minVisiblePx ?? 30;
  const maxGap = opts?.maxGapPx ?? 6;
  const n = Math.max(0, cardCount);
  const w = Math.max(0, containerWidth);
  const cw = Math.max(1, cardWidth);

  if (n <= 1 || w <= 0) return 0;

  const minStep = Math.max(8, cw - minVisible);
  const maxStep = cw + maxGap;
  const idealStep = (w - cw) / (n - 1);
  const step = Math.min(maxStep, Math.max(minStep, idealStep));
  return Math.round(step - cw);
}

export function cardWidthForHandSize(size: "sm" | "md" | "lg"): number {
  if (size === "lg") return 96;
  if (size === "md") return 72;
  return 52;
}
