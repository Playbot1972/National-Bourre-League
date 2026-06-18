// Pure enrollment roster helpers (no Firebase imports — safe for node --test).
import { playerOrderFromDealer } from "./game-engine.js";

/** Remove a player from enrollment rotation when they leave mid-signup. */
export function removePlayerFromEnrollment(enrollment, removedId, dealerId, sortedPlayerIds) {
  if (!enrollment?.active) return enrollment;
  const orderedPlayerIds = playerOrderFromDealer(dealerId, sortedPlayerIds);
  const enrolledIds = (enrollment.enrolledIds || []).filter((id) => id !== removedId);
  const declinedIds = (enrollment.declinedIds || []).filter((id) => id !== removedId);
  const previousId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
  let currentIndex =
    previousId === removedId ? 0 : orderedPlayerIds.indexOf(previousId ?? "");
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= orderedPlayerIds.length) currentIndex = 0;
  return {
    ...enrollment,
    orderedPlayerIds,
    currentIndex,
    enrolledIds,
    declinedIds,
  };
}
