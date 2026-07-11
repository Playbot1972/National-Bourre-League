/** Reserve trick row width for the full table, not per-card arrivals. */
export function resolveTrickLayoutCardCount(
  displayCount: number,
  peakCardCount: number,
  participantCount: number,
): { layoutCardCount: number; trickActive: boolean } {
  const trickActive = displayCount > 0 || peakCardCount > 0;
  const layoutCardCount = Math.max(
    displayCount,
    peakCardCount,
    trickActive ? participantCount : 0,
    1,
  );
  return { layoutCardCount, trickActive };
}
