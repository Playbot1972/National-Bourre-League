/**
 * Rollout guard for mixed public tables (Phase 2–3).
 *
 * Master switch defaults OFF — current Play Now and private-room flows are unchanged.
 * Phase 3 callables check the server flag; the client switch gates Play Now dispatch.
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
 * Server-side master switch (Cloud Functions). Defaults false; set env
 * `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` to enable callables in staging/prod.
 * @returns {boolean}
 */
export function isMixedPublicTablesServerEnabled() {
  if (typeof process !== "undefined" && process.env?.MIXED_PUBLIC_TABLES_SERVER_ENABLED === "true") {
    return true;
  }
  return MIXED_PUBLIC_TABLES_CLIENT_ENABLED;
}

/**
 * Play Now entry path resolver.
 * @returns {'private-create'|'public-matchmaking'}
 */
export function resolvePlayNowEntryPath() {
  if (!MIXED_PUBLIC_TABLES_CLIENT_ENABLED) {
    return "private-create";
  }
  return "public-matchmaking";
}

/**
 * Whether public-table server handlers may run for a room document.
 * @param {object|null|undefined} roomData
 * @returns {boolean}
 */
export function isMixedPublicTablesRolloutEnabled(roomData) {
  if (!isMixedPublicTablesServerEnabled()) {
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
