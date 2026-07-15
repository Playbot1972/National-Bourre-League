/**
 * Table feedback (sound/haptics) — diff snapshots and fire table feedback APIs.
 * Feedback only; does not mutate game truth.
 */

/**
 * Compare feedback snapshots and invoke table mount feedback APIs.
 * @returns {{ snapshot, clearPendingDrawShuffle: boolean }}
 */
export function applyTableFeedbackDiff(prev, next, { api, myUid, pendingDrawShuffle }) {
  if (!api || !next) {
    return { snapshot: next ?? prev, clearPendingDrawShuffle: false };
  }

  if (!prev || prev.sessionId !== next.sessionId) {
    if (next.trumpKey && next.phase === "draw") {
      api.playShuffleFeedback?.({ delayMs: 80 });
    }
    return { snapshot: next, clearPendingDrawShuffle: false };
  }

  if (!prev.trumpKey && next.trumpKey) {
    api.playShuffleFeedback?.({ delayMs: 80 });
  }

  let clearPendingDrawShuffle = false;
  if (pendingDrawShuffle && myUid && next.drawCompletedIds.includes(myUid)) {
    if (next.heroCardKeys !== prev.heroCardKeys) {
      clearPendingDrawShuffle = true;
      // Draw audio: count-based cue on Draw button confirm (HeroHand), not snapshot landing.
    }
  }

  // Trick-win audio/haptics: animation-synced via useCardAudio at winnerReveal (not server snapshot).

  if (next.handComplete && !prev.handComplete && next.myIsWinner) {
    api.playBigWinFeedback?.();
  }

  if (next.handComplete && !prev.handComplete && next.botWonHand) {
    api.playBotHandWinFeedback?.();
  }

  if (myUid && next.myBourre && !prev.myBourre) {
    api.playBourreFeedback?.();
  }

  return { snapshot: next, clearPendingDrawShuffle };
}
