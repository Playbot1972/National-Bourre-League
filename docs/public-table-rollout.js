/**
 * Rollout guard for mixed public tables (Phase 2).
 *
 * Master switch defaults OFF — current Play Now and private-room flows are unchanged.
 * Phase 3+ will call Cloud Functions only when this guard and room/session flags allow.
 *
 * @see docs/PUBLIC_TABLES_PHASE2.md
 */

import { roomHasMixedPublicTables } from "./public-table-schema.js";

/**
 * Client-side master switch. Intentionally false until Phase 3 rollout.
 * Do not enable in production without matchmaking + rules soak.
 */
export const MIXED_PUBLIC_TABLES_CLIENT_ENABLED = false;

/**
 * Play Now entry path resolver (Phase 2 contract only).
 * @returns {'private-create'|'public-matchmaking'}
 */
export function resolvePlayNowEntryPath() {
  if (!MIXED_PUBLIC_TABLES_CLIENT_ENABLED) {
    return "private-create";
  }
  // Phase 3: optional remote config / server-driven pool selection.
  return "private-create";
}

/**
 * Whether public-table server handlers may run for a room document.
 * @param {object|null|undefined} roomData
 * @returns {boolean}
 */
export function isMixedPublicTablesRolloutEnabled(roomData) {
  if (!MIXED_PUBLIC_TABLES_CLIENT_ENABLED) {
    return false;
  }
  return roomHasMixedPublicTables(roomData);
}

/**
 * Whether a session is tagged as a public-table session.
 * @param {object|null|undefined} sessionData
 * @returns {boolean}
 */
export function isPublicTableSession(sessionData) {
  return sessionData?.publicTable === true;
}
