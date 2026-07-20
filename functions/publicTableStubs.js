/**
 * Public mixed-table Cloud Function stubs (Phase 2 — not exported / not wired).
 *
 * Handlers throw until Phase 3+ implements matchmaking and Phase 5+ implements
 * boundary replacement. No runtime behavior changes while stubs stay unexported.
 *
 * @see docs/PUBLIC_TABLES_PHASE2.md
 */

import { HttpsError } from "firebase-functions/v2/https";
import { isMixedPublicTablesRolloutEnabled } from "./vendor/public-table-rollout.js";

const PHASE_STUB = "Public mixed tables are not implemented yet (Phase 3+).";

/** Guard for future callables — respects rollout flag on room doc. */
export function assertPublicTablesRollout(roomData) {
  if (!isMixedPublicTablesRolloutEnabled(roomData)) {
    throw new HttpsError(
      "failed-precondition",
      "Mixed public tables are disabled for this room.",
    );
  }
}

/** Phase 3: findOrCreateTableForPlayer */
export async function handleFindOrCreatePublicTable(_db, _data) {
  throw new HttpsError("unimplemented", PHASE_STUB);
}

/** Phase 3: mid-hand / handoff join as spectator */
export async function handleJoinPublicTable(_db, _data) {
  throw new HttpsError("unimplemented", PHASE_STUB);
}

/** Phase 3: leave queue / cancel pending join */
export async function handleLeavePublicTable(_db, _data) {
  throw new HttpsError("unimplemented", PHASE_STUB);
}

/** Phase 3: rebuild derived publicTableIndex/{sessionKey} from session + scores */
export async function rebuildPublicTableIndex(_db, _roomId, _sessionId) {
  throw new HttpsError("unimplemented", PHASE_STUB);
}

/** Phase 5: hand-boundary bot→human replacement batch */
export async function applyPendingReplacements(_db, _roomId, _sessionId) {
  throw new HttpsError("unimplemented", PHASE_STUB);
}
