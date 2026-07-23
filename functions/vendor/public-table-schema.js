/**
 * Public mixed-table schema contracts (Phase 2 — additive only).
 *
 * Phase 2 defines field/collection shapes and ownership. No matchmaking,
 * replacement, spectator UI, or money movement is implemented yet.
 *
 * @see docs/PUBLIC_TABLES_PHASE2.md
 */

/** Hard cap confirmed in docs/firestore.js (MAX_TABLE_PLAYERS). */
export const PUBLIC_TABLE_MAX_SEATS = 8;

/** Minimum seated players required to deal (existing engine constraint). */
export const PUBLIC_TABLE_MIN_SEATS = 2;

/** Default target seat count for future Play Now public tables (Phase 3+). */
export const PUBLIC_TABLE_DEFAULT_TARGET_SEATS = 6;

/** Stage 1: auto sit-out after this much seated inactivity (ms). */
export const PUBLIC_TABLE_IDLE_SIT_OUT_MS = 45_000;

/** Stage 2: remove seated player after this much total inactivity (ms). */
export const PUBLIC_TABLE_IDLE_REMOVAL_MS = 4 * 60_000;

/** Idle sit-out reason stamped on score rows (server-owned). */
export const PUBLIC_IDLE_SIT_OUT_REASON = "idle_timeout";

/** Idle removal reason for matchQueue / audit (server-owned). */
export const PUBLIC_IDLE_REMOVAL_REASON = "idle_removal";

/** Room visibility values. Absent visibility === private (legacy rooms). */
export const ROOM_VISIBILITY = Object.freeze({
  PRIVATE: "private",
  PUBLIC: "public",
});

/** Score-row bot role for replaceable fill bots (Phase 5+). Absent/null === legacy/private bot. */
export const BOT_ROLE = Object.freeze({
  FILL: "fill",
});

/** Global per-user queue doc (source of truth for exclusivity). */
export const MATCH_QUEUE_COLLECTION = "matchQueue";

/** Derived matchmaking index (rebuildable from session + scores). */
export const PUBLIC_TABLE_INDEX_COLLECTION = "publicTableIndex";

/** matchQueue/{userId} terminal and active statuses. */
export const MATCH_QUEUE_STATUS = Object.freeze({
  QUEUED: "queued",
  SPECTATING: "spectating",
  SEATED: "seated",
  CANCELLED: "cancelled",
});

/** sessions.pendingJoins.{userId}.status values. */
export const PENDING_JOIN_STATUS = Object.freeze({
  SPECTATING: "spectating",
  READY: "ready",
  SEATED: "seated",
  CANCELLED: "cancelled",
});

/**
 * Room-level public-table metadata (source of truth).
 * @typedef {Object} PublicRoomFeatures
 * @property {boolean} [mixedPublicTables] - Gate for public mixed-table flows.
 *
 * @typedef {Object} PublicRoomMetadata
 * @property {'private'|'public'} [visibility] - Absent === private.
 * @property {PublicRoomFeatures} [features]
 * @property {number} [targetSeatCount] - 2–8 preference for public tables.
 */

/**
 * Session-level public-table metadata (source of truth).
 * @typedef {Object} PendingJoinEntry
 * @property {string} joinId - Idempotency key for this join attempt.
 * @property {'spectating'|'ready'|'seated'|'cancelled'} status
 * @property {number} queuedAtHandCount - session.handCount when user queued.
 * @property {import('firebase/firestore').Timestamp|Date} [expiresAt]
 * @property {string} [displayName]
 *
 * @typedef {Object} ReplacementPlanMarker
 * @property {number} handCount - Completed hands at apply boundary (audit/idempotency).
 * @property {string[]} [appliedJoinIds]
 *
 * @typedef {Object} PublicSessionMetadata
 * @property {boolean} [publicTable] - True when session is in the public pool.
 * @property {Record<string, PendingJoinEntry>} [pendingJoins]
 * @property {ReplacementPlanMarker} [replacementPlan]
 */

/**
 * Score-row public-table markers (source of truth on scores/{playerId}).
 * @typedef {Object} PublicScoreMarkers
 * @property {'fill'} [botRole] - Only fill bots are replaceable (Phase 5+).
 * @property {boolean} [spectator] - True while queued/spectating, before seated.
 * @property {boolean} [pendingReplacement] - Reserved for boundary batch (Phase 5+).
 * @property {import('firebase/firestore').Timestamp|Date} [lastActivityTimestamp] - Server heartbeat.
 * @property {boolean} [sitOut] - Idle sit-out (skips hands, keeps seat until removal).
 * @property {import('firebase/firestore').Timestamp|Date} [idleSitOutAt]
 * @property {import('firebase/firestore').Timestamp|Date} [idleRemovedAt]
 */

/**
 * publicTableIndex/{sessionKey} derived cache (NOT source of truth).
 * sessionKey format: `${roomId}_${sessionId}`
 * @typedef {Object} PublicTableIndexDoc
 * @property {string} roomId
 * @property {string} sessionId
 * @property {number} openSeats - Derived
 * @property {number} realPlayerCount - Derived
 * @property {number} botFillCount - Derived
 * @property {number} [spectatorCount] - Derived
 * @property {'open'|'in_hand'|'closed'} status - Derived from session phase
 * @property {number} [buyInAmount]
 * @property {number} [anteAmount]
 * @property {number} [targetSeatCount]
 */

/**
 * matchQueue/{userId} (source of truth for global queue exclusivity).
 * @typedef {Object} MatchQueueDoc
 * @property {string} sessionKey - `${roomId}_${sessionId}`
 * @property {string} roomId
 * @property {string} sessionId
 * @property {string} activeJoinId - Latest accepted joinId (idempotency).
 * @property {typeof MATCH_QUEUE_STATUS[keyof typeof MATCH_QUEUE_STATUS]} status
 * @property {import('firebase/firestore').Timestamp|Date} [expiresAt]
 * @property {import('firebase/firestore').Timestamp|Date} [requestedAt]
 */

/** Build canonical index doc id. */
export function publicTableIndexKey(roomId, sessionId) {
  return `${roomId}_${sessionId}`;
}

/** True when room doc carries the public mixed-table feature flag. */
export function roomHasMixedPublicTables(roomData) {
  return roomData?.features?.mixedPublicTables === true;
}

/** True when visibility is public (absent === private). */
export function isPublicVisibility(roomData) {
  return roomData?.visibility === ROOM_VISIBILITY.PUBLIC;
}
