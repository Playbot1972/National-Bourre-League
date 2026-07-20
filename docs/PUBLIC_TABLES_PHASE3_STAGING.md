# Phase 3 public tables — staging soak & rollout gate

**Status:** Server-side matchmaking approved for staging. User-facing rollout gated.

| Flag | Staging posture | Production user-facing |
|------|-----------------|------------------------|
| `MIXED_PUBLIC_TABLES_SERVER_ENABLED` | `true` | Policy decision (backend-only OK without client flag) |
| `MIXED_PUBLIC_TABLES_CLIENT_ENABLED` | `false` | `false` until go/no-go passes |

**Verified (pre-soak):** find/create (idempotent), join (spectating), leave (idempotent), index rebuild, prior runtime blockers resolved. Private rooms and Play Now unchanged while client flag is off.

---

## A. Soak checklist

Track each item per deploy and at end of soak period. Mark **Pass / Fail / N/A** and date.

### Preconditions

- [ ] Staging Functions deployed with `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true`
- [ ] `MIXED_PUBLIC_TABLES_CLIENT_ENABLED=false` in deployed client/build
- [ ] Play Now routes to private-create (no public matchmaking exposed)
- [ ] Soak uses authenticated test accounts or controlled internal tooling only

### Callable path (per deploy + daily spot-check)

- [ ] **Find/create** — succeeds; structured response; same join ID → same table
- [ ] **Join** — succeeds; spectating state recorded; guest not seated immediately
- [ ] **Leave** — succeeds; queue and pending join cleared
- [ ] **Idempotent retries** — repeat find (same join ID) and repeat leave (after clear) do not throw or corrupt state
- [ ] **Index consistency** — public table index matches session data after find, join, and leave
- [ ] **No runtime exceptions** — no callable failures attributable to matchmaking handlers in Functions logs

### Regression (each soak period)

- [ ] **Private rooms** — create, join, and play still work
- [ ] **Play Now (client flag off)** — still creates private room, not public matchmaking
- [ ] **No user-facing exposure** — end users cannot reach public matchmaking without explicit client flag change

### Soak duration threshold

- [ ] **7 calendar days** minimum with server flag on, **or**
- [ ] **50+** successful find → join → leave cycles (whichever is longer)
- [ ] Soak spans **at least 2** staging deploys

**Soak owner:** _______________ **Start date:** __________ **End date:** __________

---

## B. Rollout gate criteria (go / no-go for client enablement)

Client enablement may be **considered** only when **all** are true:

- [ ] Soak checklist (Section A) complete for full duration
- [ ] No unresolved **runtime blockers** in server-flag path (Section C)
- [ ] Harness-only and fixture-only issues classified; none mistaken for Phase 3 production defects
- [ ] No Phase 3 fixture gap affects staging callable behavior
- [ ] Private rooms verified unchanged during soak
- [ ] **Policy signoff** recorded (written approval for user-facing public matchmaking)
- [ ] **Deliberate client wiring decision** — team agrees to enable `MIXED_PUBLIC_TABLES_CLIENT_ENABLED` and route Play Now to public matchmaking
- [ ] **Rollback plan** agreed — client flag off reverts user exposure without requiring Functions redeploy; server flag can be disabled independently if needed

**Go/no-go decision:** __________ **Date:** __________ **Approver:** __________

---

## C. Block conditions

### Runtime blockers (block client enablement)

| Condition | Track |
|-----------|-------|
| Find/create, join, or leave fails for valid authenticated requests | |
| Leave does not clear queue or pending join | |
| Public table index persistently wrong after rebuild | |
| Callable or Firestore errors in staging Functions logs tied to matchmaking | |
| Private-room regression | |
| Play Now routes to public matchmaking while client flag should be off | |
| Cross-user or unauthenticated queue/session corruption | |
| Policy signoff not obtained | |
| Soak checklist or duration threshold not met | |

### Harness-only (non-blocking for client gate)

| Issue | Classification |
|-------|----------------|
| `scripts/public-table-matchmaking.test.mjs` — `firebase-admin` import fails from `scripts/` | Harness-only |
| Use `functions/publicTableLeave.integration.test.mjs` and unit tests for Phase 3 verification | |

### Fixture-only (non-blocking for Phase 3 client gate)

| Issue | Classification |
|-------|----------------|
| `functions/publicTableReplacement.integration.test.mjs` — money-engine buy-in setup gaps | Fixture-only (Phase 5, separate track) |
| Phase 5 replacement verified separately; does not gate Phase 3 client enablement | |

---

## D. Monitoring notes

### Review cadence

| When | Action |
|------|--------|
| **Daily** (active soak) | Scan Functions error logs; one manual find → join → leave cycle |
| **Per staging deploy** | Run full Section A callable + regression checks |
| **End of soak** | Roll up results against Section B go/no-go |

### What to observe

| Area | Look for |
|------|----------|
| Success rates | Find/create, join, leave completions vs errors |
| Errors | Unauthenticated, already-exists, failed-precondition; uncaught exceptions |
| Index health | Spectator/open-seat counts consistent after join and leave |
| Idempotency | Duplicate find and leave safe |
| Client flag | Deployed build keeps `MIXED_PUBLIC_TABLES_CLIENT_ENABLED=false` |
| Private rooms | Spot-check unchanged behavior |

### Escalation

1. **Runtime symptom** → stop client-enablement discussion; triage as blocker vs harness/fixture
2. **Harness/fixture only** → document; continue soak; do not fail staging on these alone
3. **Any Section C runtime blocker** → no-go until resolved and re-soaked

---

## E. Final recommendation

1. **Now:** Keep server flag on in staging; client flag off. Execute Section A checklist.
2. **During soak:** Monitor per Section D; classify issues using Section C.
3. **After soak:** Section B go/no-go; require policy signoff before client flag change.
4. **Client enablement:** Separate release step — staging client flag first, then production, with rollback = client flag off.

Phase 3 backend is staging-approved. User-facing public matchmaking is **not** available until soak completes, go/no-go passes, and policy approves client enablement.

---

*Related: `docs/public-table-rollout.js`, `docs/PUBLIC_TABLES_PHASE2.md`, PR #622 (leave transaction fix).*
