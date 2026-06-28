// Game setup step labels (pure — safe for node --test).

/** One-line guided step for the in-room table setup panel. */
export function gameSetupStepLabel({ hasActiveSession, ready, isOwner }) {
  if (!hasActiveSession) {
    return isOwner
      ? "Step 1 — Tap Open table to begin"
      : "Waiting for the host to open a table";
  }
  if (!ready) {
    return isOwner
      ? "Step 2 — Add at least one more player (you count as player 1)"
      : "Step 2 — Waiting for more players";
  }
  return "Step 3 — Tap Play to start the game";
}
