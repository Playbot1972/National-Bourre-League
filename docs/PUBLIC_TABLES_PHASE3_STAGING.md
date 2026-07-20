# Phase 3 public tables — staging soak signoff

> **Staging approved · User-facing rollout gated**  
> Server flag on · Client flag off · Play Now private-create only

## Signoff record

| | |
|---|---|
| **Owner** | NBL Release Ops |
| **Start** | 2026-07-20 |
| **End** | *(in progress)* |
| **Deploys** | 0 / 2 min |
| **Cycles** | 7 / 50 min |

| Flag | Staging | User-facing |
|------|---------|-------------|
| Server (`MIXED_PUBLIC_TABLES_SERVER_ENABLED`) | ON | Policy decision |
| Client (`MIXED_PUBLIC_TABLES_CLIENT_ENABLED`) | OFF | OFF until go/no-go |

### Open operational confirmations

| Item | Status | Owner action |
|------|--------|--------------|
| Deployed staging `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` | Pending external verify | Check Firebase Functions env on staging project |
| Per-deploy checklist Deploy #1 | Pending next staging deploy | Complete 6-step routine in Section A |
| Soak regression (private rooms / Play Now) | Pending per-deploy | Required at deploy, not daily |
| **Mid-soak checkpoint** | Day 7/7 min ✓ · 7/50 cycles | Calendar min met; cycles + deploys remain |

---

## A. Soak checklist

### Setup (once, at soak start)

- [x] Server flag on in staging *(verified via `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` soak run; confirm deployed staging Functions env)*
- [x] Client flag off in deployed build *(repo: `MIXED_PUBLIC_TABLES_CLIENT_ENABLED=false`)*
- [x] Play Now → private-create only *(repo: `resolvePlayNowEntryPath()` → `private-create`)*
- [x] Authenticated test accounts or internal tooling only *(Day 1: internal handler soak)*

### Daily spot-check

One find → join → leave per day. Confirm repeat find (same join ID) and repeat leave are safe. Confirm index matches session after leave.

| Date | Find/create | Join | Leave | Idempotency | Index OK | No errors | Initials |
|------|:-----------:|:----:|:-----:|:-----------:|:--------:|:---------:|:--------:|
| 2026-07-20 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-21 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-22 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-23 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-24 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-25 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |
| 2026-07-26 | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | RO |

### Per-deploy full checklist

**Run on next staging deploy** — complete Deploy #1 row below before marking deploy count.

| Step | Action |
|------|--------|
| 1 | Re-verify server flag on + client flag off in deployed build |
| 2 | Confirm daily spot-check items still pass post-deploy |
| 3 | Private rooms — create, join, play unchanged |
| 4 | Play Now still creates private room (not public matchmaking) |
| 5 | Confirm no user-facing public matchmaking exposure |
| 6 | Record deploy date and sign-off initials |

| Deploy # | Date | Setup OK | Daily items pass | Private rooms OK | Play Now private | No user exposure | Sign-off |
|:--------:|------|:--------:|:----------------:|:----------------:|:----------------:|:----------------:|:--------:|
| 1 | *(pending)* | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 2 | | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 3+ | | ☐ | ☐ | ☐ | ☐ | ☐ | |

### Regression (each soak period)

- [ ] Private rooms — create, join, play unchanged
- [ ] Play Now still creates private room
- [ ] No end-user public matchmaking without client flag change

### Duration threshold (before go/no-go)

- [x] ≥ **7 calendar days** with server flag on *(met 2026-07-26)*
- [ ] ≥ **50** find→join→leave cycles — **whichever is longer** *(7/50 — binding gate at 1 cycle/day)*
- [ ] ≥ **2** staging deploys *(0/2)*

---

## B. Rollout gate criteria

Client enablement is a **separate release decision**. Consider only when **all** are checked:

- [ ] Section A complete for full soak period
- [ ] No unresolved runtime blockers (Section C)
- [ ] Harness/fixture issues classified — not treated as production defects
- [ ] Private rooms unchanged during soak
- [ ] Policy signoff recorded
- [ ] Deliberate decision to enable client flag and route Play Now to public matchmaking
- [ ] Rollback plan agreed (Section E)

### Go / no-go

| | |
|---|---|
| **Decision** | ☐ Go · ☐ No-go |
| **Date** | ________________ |
| **Approver** | ________________ |
| **Notes** | |

---

## C. Block conditions

### Runtime blockers — no-go until resolved and re-soaked

| Condition |
|-----------|
| Find, join, or leave fails for valid authenticated requests |
| Leave does not clear queue or pending join |
| Public table index persistently wrong after rebuild |
| Matchmaking errors in staging Functions logs |
| Private-room regression |
| Public matchmaking exposed while client flag should be off |
| Queue or session corruption across users |
| Policy signoff not obtained |
| Soak checklist or duration threshold not met |

### Harness-only — non-blocking

| Issue |
|-------|
| Matchmaking test script cannot run from `scripts/` (import path) — use leave integration test and unit tests |

### Fixture-only — non-blocking for Phase 3 client gate

| Issue |
|-------|
| Phase 5 replacement integration test setup gaps — separate track |

---

## D. Monitoring notes

| When | Action |
|------|--------|
| **Daily** | Log scan + one find→join→leave; fill daily table |
| **Per deploy** | Complete per-deploy checklist row |
| **End of soak** | Complete Section B go/no-go |

**Watch:** callable success vs errors · index after join/leave · client flag still off · private-room spot-checks

**Escalation**

1. Runtime symptom → pause client-enablement; triage blocker vs harness/fixture
2. Harness/fixture only → document; continue soak
3. Any runtime blocker → no-go; fix and re-soak

---

## E. Final recommendation

1. **Now:** Server flag on, client flag off — run Section A daily and per deploy.
2. **During soak:** Monitor Section D; classify issues Section C.
3. **After soak:** Section B go/no-go; policy signoff before client flag change.
4. **Rollback:** Client flag off reverts user exposure without Functions redeploy; server flag can be disabled independently.
5. **Client enablement:** Separate release — staging client flag first, then production.

Phase 3 backend is staging-approved. User-facing public matchmaking is **not** available until soak completes, go/no-go passes, and policy approves client enablement.
