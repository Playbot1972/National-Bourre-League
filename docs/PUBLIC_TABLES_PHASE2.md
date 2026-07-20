# Public mixed tables — Phase 2 (schema + rules only)

Phase 2 adds **additive** schema contracts, Firestore rule guards, rollout flags, and
backend stubs. **No matchmaking, replacement, spectator UI, or public money writes**
are implemented yet.

## What changed in Phase 2

- `docs/public-table-schema.js` — field/collection contracts (source of truth vs derived)
- `docs/public-table-rollout.js` — master switch (`MIXED_PUBLIC_TABLES_CLIENT_ENABLED = false`)
- `firestore.rules` — block client writes to new public-only paths
- `functions/publicTableStubs.js` — unexported Phase 3/5 handler placeholders
- Tests: `scripts/public-table-schema.test.mjs`, `scripts/firestore-public-table-rules.test.mjs`

## What remains unchanged

- Play Now (`runPlayNowFlow`) still creates a new **private** invite room when the rollout
  flag is off (default).
- Private room create/join, enrollment, settlement, money events, trick presentation.
- `ensureSessionPlayer`, `addSessionRobot`, owner roster UI.
- All legacy documents without new fields behave exactly as before.

## Schema ownership

| Path | Role | Writer (when implemented) |
|------|------|---------------------------|
| `rooms.visibility`, `rooms.features`, `rooms.targetSeatCount` | Source of truth | Cloud Functions (public create) |
| `sessions.publicTable`, `sessions.pendingJoins`, `sessions.replacementPlan` | Source of truth | Cloud Functions |
| `scores.botRole`, `scores.spectator`, `scores.pendingReplacement` | Source of truth | Cloud Functions |
| `matchQueue/{userId}` | Source of truth (global exclusivity) | Cloud Functions |
| `publicTableIndex/{sessionKey}` | **Derived** cache | Cloud Functions (rebuild) |

## Client write policy (Phase 2 rules)

**Still allowed (private paths):**

- Room create without `visibility: public` / `features.mixedPublicTables`
- Session roster updates (`players`, `liveEnrollment`, `updatedAt`)
- Enrollment / settlement patches (existing `member*` rule helpers)
- Score create/update without `botRole` / `spectator` / `pendingReplacement`

**Blocked from clients (public paths):**

- `matchQueue/*`, `publicTableIndex/*` (all writes)
- `sessions.publicTable`, `pendingJoins`, `replacementPlan`
- `scores.botRole`, `spectator`, `pendingReplacement`
- `rooms.visibility`, `features`, `targetSeatCount` (owner updates)

## Rollout flag

- `MIXED_PUBLIC_TABLES_CLIENT_ENABLED` in `docs/public-table-rollout.js` — **false** by default.
- `resolvePlayNowEntryPath()` returns `"private-create"` until Phase 3 enables the client switch.
- Room-level `features.mixedPublicTables` is only meaningful once server callables exist.

## Not implemented yet

- `gameFindOrCreatePublicTable`, `gameJoinPublicTable`, `gameLeavePublicTable` (not exported)
- `applyPendingReplacements` hand-boundary batch
- Spectator UI, lobby list, mid-hand seat changes
- Public buy-in / ante money events

## Tests

```bash
node --test scripts/public-table-schema.test.mjs
npm run test:rules:firestore   # includes scripts/firestore-public-table-rules.test.mjs
```
