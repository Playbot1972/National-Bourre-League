/**
 * Table feedback (sound/haptics) — diff snapshots and fire procedural events.
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
      api.playShuffleFeedback?.({ delayMs: 120 });
    }
  }

  if (myUid && next.myTricks > prev.myTricks) {
    api.playTrickWinFeedback?.();
  }

  if (next.handComplete && !prev.handComplete && next.myIsWinner) {
    api.playBigWinFeedback?.();
  }

  return { snapshot: next, clearPendingDrawShuffle };
}
