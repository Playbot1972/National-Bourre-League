/**
 * Table feedback (sound/haptics) — diff snapshots and fire table feedback APIs.
 * Feedback only; does not mutate game truth.
 */

/** Hand-opening trump — client ante/deal presentation owns audio pacing. */
function isOpeningHandSnapshot(next) {
  return (
    (next.myTricks ?? 0) === 0 &&
    (next.drawCompletedIds?.length ?? 0) === 0 &&
    next.handComplete !== true
  );
}

function shouldPlayTrumpRevealShuffle(prev, next) {
  if (prev?.trumpKey || !next?.trumpKey) return false;
  if (next.phase === "reveal") return false;
  if (isOpeningHandSnapshot(next)) return false;
  return true;
}

/**
 * Compare feedback snapshots and invoke table mount feedback APIs.
 * @returns {{ snapshot, clearPendingDrawShuffle: boolean }}
 */
export function applyTableFeedbackDiff(prev, next, { api, myUid, pendingDrawShuffle }) {
  if (!api || !next) {
    return { snapshot: next ?? prev, clearPendingDrawShuffle: false };
  }

  if (!prev || prev.sessionId !== next.sessionId) {
    if (next.trumpKey && next.phase === "draw" && !isOpeningHandSnapshot(next)) {
      api.playShuffleFeedback?.({ delayMs: 80 });
    }
    return { snapshot: next, clearPendingDrawShuffle: false };
  }

  if (shouldPlayTrumpRevealShuffle(prev, next)) {
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

  if (myUid && next.myBourre && !prev.myBourre) {
    api.playBourrePrivatePunishmentFeedback?.({
      sessionId: next.sessionId,
      handNumber: next.handNumber ?? 0,
      isLocalBourredPlayer: true,
    });
  }

  return { snapshot: next, clearPendingDrawShuffle };
}
