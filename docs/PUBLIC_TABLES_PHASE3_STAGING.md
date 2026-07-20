# Phase 3 public tables — staging soak signoff

**Release:** Phase 3 server-side matchmaking  
**Status:** Staging approved · User-facing rollout gated  
**Tracked artifact:** use daily during soak; complete go/no-go at end

| Flag | Staging | User-facing |
|------|---------|-------------|
| Server (`MIXED_PUBLIC_TABLES_SERVER_ENABLED`) | **ON** | Policy decision |
| Client (`MIXED_PUBLIC_TABLES_CLIENT_ENABLED`) | **OFF** | **OFF** until go/no-go |

---

## Signoff record

| Field | Value |
|-------|-------|
| **Soak owner** | |
| **Start date** | |
| **End date** | |
| **Deploy count** | / 2 minimum |
| **Cycle count** | / 50 minimum |

---

## A. Soak checklist

### Setup (once, at soak start)

- [ ] Server flag on in staging
- [ ] Client flag off in deployed build
- [ ] Play Now → private-create only (no public matchmaking exposed)
- [ ] Soak uses authenticated test accounts or internal tooling only

### Daily spot-check (mark Pass / Fail + date)

| Date | Find/create | Join | Leave | Idempotency | Index OK | No errors | Initials |
|------|-------------|------|-------|-------------|----------|-----------|----------|
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |

**Daily spot-check means:** one find→join→leave cycle; confirm repeat find (same join ID) and repeat leave are safe; confirm index matches session after leave.

### Per-deploy full checklist

| Deploy # | Date | Setup OK | All daily items | Private rooms OK | Play Now private | No user exposure | Sign-off |
|----------|------|----------|-----------------|------------------|------------------|------------------|----------|
| 1 | | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 2 | | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 3+ | | ☐ | ☐ | ☐ | ☐ | ☐ | |

### Regression (each soak period)

- [ ] Private rooms — create, join, play unchanged
- [ ] Play Now still creates private room
- [ ] No end-user public matchmaking without client flag change

### Duration threshold (required before go/no-go)

- [ ] ≥ **7 calendar days** with server flag on, **or** ≥ **50** find→join→leave cycles (whichever is longer)
- [ ] Soak spans ≥ **2** staging deploys

---

## B. Rollout gate criteria

Client enablement may be **considered** only when **all** are checked:

- [ ] Section A complete for full soak period
- [ ] No unresolved runtime blockers (Section C)
- [ ] Harness/fixture issues classified — not treated as production defects
- [ ] Private rooms unchanged during soak
- [ ] Policy signoff recorded
- [ ] Deliberate decision to enable client flag and route Play Now to public matchmaking
- [ ] Rollback plan agreed (see Section E)

### Go / no-go decision

| Field | Value |
|-------|-------|
| **Decision** | ☐ Go · ☐ No-go |
| **Date** | |
| **Approver** | |
| **Notes** | |

---

## C. Block conditions

### Runtime blockers — no-go until resolved and re-soaked

- Find, join, or leave fails for valid authenticated requests
- Leave does not clear queue or pending join
- Public table index persistently wrong after rebuild
- Matchmaking errors in staging Functions logs
- Private-room regression
- Public matchmaking exposed while client flag should be off
- Queue or session corruption across users
- Policy signoff not obtained
- Soak checklist or duration threshold not met

### Harness-only — non-blocking

- Matchmaking test script fails to run from `scripts/` due to import path — use leave integration test and unit tests for Phase 3 verification

### Fixture-only — non-blocking for Phase 3 client gate

- Phase 5 replacement integration test money-engine setup gaps — separate track; does not gate Phase 3

---

## D. Monitoring notes

### Review cadence

| When | Action |
|------|--------|
| **Daily** | Log scan + one find→join→leave; fill daily spot-check table |
| **Per deploy** | Run per-deploy full checklist |
| **End of soak** | Complete Section B go/no-go |

### What to watch

- Callable success vs errors (find, join, leave)
- Index counts consistent after join and leave
- Client flag remains off in deployed build
- Private-room spot-checks pass

### Escalation

1. **Runtime symptom** → pause client-enablement discussion; triage blocker vs harness/fixture
2. **Harness/fixture only** → document in notes; continue soak
3. **Any runtime blocker** → no-go; fix and re-soak affected period

---

## E. Final recommendation

1. **Now:** Server flag on, client flag off — run Section A daily and per deploy.
2. **During soak:** Monitor per Section D; classify issues per Section C.
3. **After soak:** Complete Section B go/no-go; require policy signoff before client flag change.
4. **Rollback:** Client flag off reverts user exposure without Functions redeploy; server flag can be disabled independently.
5. **Client enablement:** Separate release — staging client flag first, then production.

Phase 3 backend is staging-approved. User-facing public matchmaking is **not** available until soak completes, go/no-go passes, and policy approves client enablement.
