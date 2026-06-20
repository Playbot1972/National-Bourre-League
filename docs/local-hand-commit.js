/**
 * Authoritative local overlay until Firestore confirms (or error rolls back).
 * Keeps enrollment / decision / draw / play UI from flashing back to pending CTAs
 * while async writes and presentation animations run.
 */

export const LOCAL_HAND_ACTION = {
  ENROLL_PLAY: "enroll_play",
  ENROLL_PASS: "enroll_pass",
  DECISION_PLAY: "decision_play",
  DECISION_PASS: "decision_pass",
  DRAW: "draw",
  PLAY_CARD: "play_card",
};

export function createLocalHandCommit({ sessionId, handNumber, playerId, kind, discardCount = 0 }) {
  return {
    sessionId,
    handNumber,
    playerId,
    kind,
    discardCount,
    atMs: Date.now(),
  };
}

export function commitMatches(commit, { sessionId, handNumber, playerId }) {
  if (!commit) return false;
  return (
    commit.sessionId === sessionId &&
    commit.handNumber === handNumber &&
    commit.playerId === playerId
  );
}

/**
 * Drop the local commit once the server snapshot reflects the action.
 */
export function reconcileLocalCommit(commit, ctx) {
  if (!commit) return null;
  const { sessionId, handNumber, myUid, enrollment, handPhase, currentHand } = ctx;
  if (!commitMatches(commit, { sessionId, handNumber, playerId: myUid })) return null;

  const enrolled = enrollment?.enrolledIds || [];
  const declined = enrollment?.declinedIds || [];
  const planned = currentHand?.handDecision?.plannedDiscards ?? {};

  switch (commit.kind) {
    case LOCAL_HAND_ACTION.ENROLL_PLAY:
    case LOCAL_HAND_ACTION.DECISION_PLAY:
      if (enrolled.includes(myUid) || planned[myUid] != null) return null;
      if (declined.includes(myUid)) return null;
      break;
    case LOCAL_HAND_ACTION.ENROLL_PASS:
    case LOCAL_HAND_ACTION.DECISION_PASS:
      if (declined.includes(myUid)) return null;
      if (enrolled.includes(myUid)) return null;
      break;
    case LOCAL_HAND_ACTION.DRAW:
      if (currentHand?.drawCompletedIds?.includes(myUid)) return null;
      break;
    case LOCAL_HAND_ACTION.PLAY_CARD: {
      if (handPhase !== "play") return null;
      const trick = currentHand?.currentTrick;
      const played = trick?.plays?.some((p) => p.playerId === myUid);
      if (played || currentHand?.turnPlayerId !== myUid) return null;
      break;
    }
    default:
      break;
  }
  return commit;
}

export function applyLocalCommitToEnrollment(commit, enrollment, myUid) {
  if (!commit || commit.playerId !== myUid || !enrollment) return enrollment;

  const next = { ...enrollment };
  const enrolled = [...(next.enrolledIds || [])];
  const declined = [...(next.declinedIds || [])];

  switch (commit.kind) {
    case LOCAL_HAND_ACTION.ENROLL_PLAY:
    case LOCAL_HAND_ACTION.DECISION_PLAY:
      if (!enrolled.includes(myUid)) enrolled.push(myUid);
      next.enrolledIds = enrolled;
      next.currentIndex = (next.currentIndex ?? 0) + 1;
      break;
    case LOCAL_HAND_ACTION.ENROLL_PASS:
    case LOCAL_HAND_ACTION.DECISION_PASS:
      if (!declined.includes(myUid)) declined.push(myUid);
      next.declinedIds = declined;
      next.currentIndex = (next.currentIndex ?? 0) + 1;
      break;
    default:
      break;
  }
  return next;
}

export function applyLocalCommitPlannedDiscards(commit, plannedDiscards, myUid) {
  if (!commit || commit.playerId !== myUid) return plannedDiscards;
  if (
    commit.kind !== LOCAL_HAND_ACTION.DECISION_PLAY &&
    commit.kind !== LOCAL_HAND_ACTION.ENROLL_PLAY
  ) {
    return plannedDiscards;
  }
  if (commit.kind !== LOCAL_HAND_ACTION.DECISION_PLAY) return plannedDiscards;
  return { ...plannedDiscards, [myUid]: commit.discardCount };
}

export function applyLocalCommitDrawCompleted(commit, drawCompletedIds, myUid) {
  if (!commit || commit.playerId !== myUid || commit.kind !== LOCAL_HAND_ACTION.DRAW) {
    return drawCompletedIds;
  }
  const ids = [...(drawCompletedIds || [])];
  if (!ids.includes(myUid)) ids.push(myUid);
  return ids;
}

export function applyLocalCommitToPlayerFlags(commit, flags, myUid) {
  if (!commit || commit.playerId !== myUid) return flags;

  const next = { ...flags };
  switch (commit.kind) {
    case LOCAL_HAND_ACTION.ENROLL_PLAY:
    case LOCAL_HAND_ACTION.DECISION_PLAY:
      next.canToggleInHand = false;
      next.canPassEnrollment = false;
      next.enrollmentOnClock = false;
      next.enrollmentJoined = true;
      next.inHand = true;
      if (commit.kind === LOCAL_HAND_ACTION.DECISION_PLAY) {
        next.decisionPlannedDiscards = commit.discardCount;
      }
      break;
    case LOCAL_HAND_ACTION.ENROLL_PASS:
    case LOCAL_HAND_ACTION.DECISION_PASS:
      next.canToggleInHand = false;
      next.canPassEnrollment = false;
      next.enrollmentOnClock = false;
      next.enrollmentSatOut = true;
      break;
    case LOCAL_HAND_ACTION.DRAW:
      next.isOnTurn = false;
      next.actionDeclared = true;
      break;
    case LOCAL_HAND_ACTION.PLAY_CARD:
      next.isOnTurn = false;
      next.actionDeclared = true;
      break;
    default:
      break;
  }
  return next;
}
