/**
 * Public mixed-table Cloud Function stubs (Phase 2 legacy module).
 *
 * Phase 3 handlers live in publicTable.js and are exported from index.js.
 * applyPendingReplacements remains a Phase 5 stub.
 *
 * @see docs/PUBLIC_TABLES_PHASE2.md
 */

import { HttpsError } from "firebase-functions/v2/https";
import { isMixedPublicTablesRolloutEnabled } from "./vendor/public-table-rollout.js";

export {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  handleLeavePublicTable,
  rebuildPublicTableIndex,
} from "./publicTable.js";

/** Guard for room-scoped public flows — respects rollout flag on room doc. */
export function assertPublicTablesRollout(roomData) {
  if (!isMixedPublicTablesRolloutEnabled(roomData)) {
    throw new HttpsError(
      "failed-precondition",
      "Mixed public tables are disabled for this room.",
    );
  }
}

/** Phase 5: hand-boundary bot→human replacement batch */
export async function applyPendingReplacements(_db, _roomId, _sessionId) {
  throw new HttpsError("unimplemented", "Hand-boundary replacement is not implemented yet (Phase 5).");
}
