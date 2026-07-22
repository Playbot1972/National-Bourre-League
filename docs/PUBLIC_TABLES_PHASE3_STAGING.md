# Phase 3 public tables — staging soak signoff

> **Client flag-on rollout**  
> Server flag on · Client flag **ON** (Play Now → public matchmaking) · Post-deploy smoke required

## Signoff record

| | |
|---|---|
| **Owner** | NBL Release Ops |
| **Start** | 2026-07-20 |
| **End** | *(in progress)* |
| **Deploys** | 0 / 2 min |
| **Cycles** | 8 / 50 min |

| Flag | Staging | User-facing |
|------|---------|-------------|
| Server (`MIXED_PUBLIC_TABLES_SERVER_ENABLED`) | ON | Policy decision |
| Client (`MIXED_PUBLIC_TABLES_CLIENT_ENABLED`) | ON | Play Now → `public-matchmaking` via `gameFindOrCreatePublicTable` |

### Open operational confirmations

| Item | Status | Owner action |
|------|--------|--------------|
| Deployed staging `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` | Pending external verify | Check Firebase Functions env on staging project |
| Per-deploy checklist Deploy #1 | Pending next staging deploy | Complete 6-step routine in Section A |
| Soak regression (private rooms / Play Now) | Pending per-deploy | Required at deploy, not daily |
| **Mid-soak checkpoint** | Day 8+ · 8/50 cycles · 7-day min ✓ | Cycles + deploys remain for go/no-go |

---

## A. Soak checklist

### Setup (once, at soak start)

- [x] Server flag on in staging *(verified via `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` soak run; confirm deployed staging Functions env)*
- [x] Client flag on in deployed build *(repo: `MIXED_PUBLIC_TABLES_CLIENT_ENABLED=true`)*
- [x] Public Play Now client path code-complete *(handoff + `gameLeavePublicTable` cleanup in `docs/app.js`)*
- [x] Play Now → public-matchmaking when client flag on *(repo: `resolvePlayNowEntryPath()` → `public-matchmaking`)*
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

### Extended cycle log (cycles 8–50)

After the 7-day table, log one find→join→leave cycle per day. Mark **Pass** or **Fail**; same checks as daily spot-check.

| Cycle | Date | Pass | Initials | Notes |
|------:|------|:----:|:--------:|-------|
| 8 | 2026-07-27 | ☑ | RO | |
| 9 | | ☐ | | |
| 10 | | ☐ | | |
| … | | | | *continue through cycle 50* |

### Automated soak runner (optional)

Back-to-back authenticated callable cycles — default **no delay** between cycles. Appends to `artifacts/public-table-soak/soak-log.csv` (and optional markdown log). See `scripts/public-table-staging-soak.env.example`.

#### Remote soak operator checklist

Use this ordered checklist before remote soak signoff. Emulator validation is already green; remote soak is the remaining gate.

1. **Provision soak accounts** — Firebase Console → **national-bourre-league** → **Authentication** → **Users** → **Add user**. Create **two** dedicated accounts: one **host**, one **guest**. Use **email/password** only. Soak-only addresses — not personal logins.
2. **Create `.env.soak`** — From repo root: `cp scripts/public-table-staging-soak.env.example .env.soak` (gitignored; never commit).
3. **Fill `.env.soak`** — Set: `SOAK_ENV=staging`, `SOAK_ALLOW_PRODUCTION=1`, `SOAK_FIREBASE_PROJECT_ID=national-bourre-league`, Firebase web config (`SOAK_FIREBASE_API_KEY`, `SOAK_FIREBASE_AUTH_DOMAIN`, `SOAK_FIREBASE_APP_ID`), `SOAK_HOST_EMAIL`, `SOAK_HOST_PASSWORD`, `SOAK_GUEST_EMAIL`, `SOAK_GUEST_PASSWORD`. Leave **`SOAK_USE_EMULATOR` unset** (do not set to `1`).
4. **Verify live server flag** — Repo/CI cannot prove the deployed value. Confirm `MIXED_PUBLIC_TABLES_SERVER_ENABLED=true` on the live Functions deployment (Console or `gcloud` below). **Stop if not `true`.**
5. **Run 1-cycle smoke** — `npm run soak:public-table -- --cycles 1`. **Stop if exit code ≠ 0 or CSV shows `pass=false`.**
6. **Inspect smoke logs** — Open `artifacts/public-table-soak/soak-log.csv` and `soak-log.md`. Confirm one row, `pass=true`, empty `error` column.
7. **Run 42-cycle batch** — `npm run soak:public-table -- --cycles 42 --start-cycle 9` (back-to-back, default delay 0). Do not use `--stop-on-fail` unless debugging a single failure.
8. **Inspect batch logs** — `artifacts/public-table-soak/soak-log.csv` must have **42 rows** (cycles **9–50**), all `pass=true`, terminal `pass=42 fail=0`. Each cycle has a **unique** `joinId` (`soak-{timestamp}-{cycle}`). No `different joinId` or host queue carryover errors. Copy passing rows into the extended cycle log (Section A).
9. **Sign off or no-go** — See success signals and no-go conditions below.

| Variable | Required | Notes |
|----------|:--------:|-------|
| `SOAK_ENV` | yes | Must be `staging` |
| `SOAK_ALLOW_PRODUCTION` | yes | Required for `national-bourre-league` / `booray.win` |
| `SOAK_FIREBASE_API_KEY` | yes | Web app `apiKey` from Firebase Console |
| `SOAK_FIREBASE_PROJECT_ID` | yes | `national-bourre-league` |
| `SOAK_HOST_EMAIL` | yes | Dedicated soak host account |
| `SOAK_HOST_PASSWORD` | yes | Host password |
| `SOAK_GUEST_EMAIL` | yes | Dedicated soak guest account |
| `SOAK_GUEST_PASSWORD` | yes | Guest password |
| `SOAK_FIREBASE_AUTH_DOMAIN` | recommended | `booray.win` |
| `SOAK_FIREBASE_APP_ID` | recommended | Web app `appId` from Firebase Console |
| `SOAK_FUNCTIONS_REGION` | optional | Default `us-central1` |
| `SOAK_USE_EMULATOR` | must be unset | Remote soak only |

**Example `.env.soak` block** (fill email/password lines):

```bash
SOAK_ENV=staging
SOAK_ALLOW_PRODUCTION=1
SOAK_FIREBASE_PROJECT_ID=national-bourre-league
SOAK_FIREBASE_API_KEY=<from Firebase Console web app>
SOAK_FIREBASE_AUTH_DOMAIN=booray.win
SOAK_FIREBASE_APP_ID=<from Firebase Console web app>
SOAK_FUNCTIONS_REGION=us-central1
SOAK_HOST_EMAIL=<soak-host@your-domain>
SOAK_HOST_PASSWORD=<host-password>
SOAK_GUEST_EMAIL=<soak-guest@your-domain>
SOAK_GUEST_PASSWORD=<guest-password>
SOAK_LOG_CSV=artifacts/public-table-soak/soak-log.csv
SOAK_LOG_MD=artifacts/public-table-soak/soak-log.md
```

#### Verify server flag on live project (step 4)

`MIXED_PUBLIC_TABLES_SERVER_ENABLED` is **not** set by repo deploy CI. It is read at **Cloud Functions runtime** from `process.env` (see `functions/vendor/public-table-rollout.js`). Repo state alone cannot prove the live value — check GCP after each Functions deploy.

**Console:** Firebase Console → **national-bourre-league** → **Functions** → open `gameFindOrCreatePublicTable` (or any Phase 3 callable) → **Configuration** → **Environment variables** → confirm `MIXED_PUBLIC_TABLES_SERVER_ENABLED` = `true`.

**CLI (project Owner or Functions Viewer):**

```bash
gcloud functions describe gameFindOrCreatePublicTable \
  --gen2 --region=us-central1 --project=national-bourre-league \
  --format="yaml(serviceConfig.environmentVariables)"
```

If unset or not `true`, public-table callables return `failed-precondition` / *Mixed public tables are disabled.* and the soak will fail at `gameFindOrCreatePublicTable`.

**Set or update (requires deploy permission):** Firebase Console → Functions → Environment variables, or redeploy with the var set on the Gen2 service. CI (`.github/workflows/deploy.yml`) does not inject this var today.

#### Remote soak success signals

**1-cycle smoke (`--cycles 1`):**

- Terminal: `[soak] cycle 1 PASS room=…` and `[soak] done. … pass=1 fail=0`
- Exit code `0`
- `soak-log.csv`: one data row with `pass=true`, populated `roomId`/`sessionId`/`joinId`, empty `error`
- `soak-log.md`: one row with ☑

**42-cycle batch (`--cycles 42 --start-cycle 9`):**

- Terminal: cycles `9..50` each log `PASS`, summary `pass=42 fail=0`
- Exit code `0`
- `soak-log.csv`: 42 rows, all `pass=true`, no `different joinId` or `host matchQueue` errors
- Unique `joinId` per cycle (`soak-{timestamp}-{cycle}`)

#### Remote soak no-go stop conditions

**Stop before running** if any of:

- `SOAK_USE_EMULATOR=1` is set
- `SOAK_ENV` is not `staging`
- `SOAK_ALLOW_PRODUCTION` is not `1` (runner refuses `national-bourre-league` without it)
- Any required `SOAK_*` email/password var is missing
- Live `MIXED_PUBLIC_TABLES_SERVER_ENABLED` is not `true`

**Stop after 1-cycle smoke** (do not run batch) if:

- Exit code ≠ `0`
- Callable error *Mixed public tables are disabled.*
- Auth/sign-in failure
- CSV row has `pass=false` or non-empty `error`

**Stop / no-go after batch** if:

- Any cycle has `pass=false` in CSV
- Terminal reports `fail > 0`
- Errors mention `active public table queue with a different joinId` (host queue carryover)
- Errors mention `host matchQueue still exists` or guest cleanup verification failures (`matchQueue`, `pendingJoins`, `publicTableIndex`)

Default runner behavior: log all cycles, exit `1` at end if any failed (`--stop-on-fail` optional for early abort while debugging).

```bash
# Staging: 42 cycles in one session (e.g. cycles 9–50 after manual Days 1–8)
npm run soak:public-table -- --cycles 42 --start-cycle 9

# Single cycle
npm run soak:public-table -- --cycles 1

# Local emulator smoke
npm run soak:public-table:emulator

# Optional: pause between cycles (ms) or stop on first failure
npm run soak:public-table -- --cycles 10 --delay 200 --stop-on-fail
```

Copy passing rows into the extended cycle log above. Client flag must remain off; staging server flag must be on.

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
- [ ] ≥ **50** find→join→leave cycles — **whichever is longer** *(8/50)*
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
| **Daily** | Log scan + one find→join→leave; fill 7-day table or extended cycle log |
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

Phase 3 backend is staging-approved. **Run Section F production smoke after each client-flag-on hosting deploy** before policy signoff.

---

## F. Client flag-on production smoke (post-deploy)

Run on **https://booray.win/social/** immediately after hosting deploy merges this flag-on build.

| Step | Action | Pass signal |
|------|--------|-------------|
| 1 | Sign in with a real account | Session shows display name; no auth errors |
| 2 | Tap **Play Now** | Live table opens (not stuck on silent/blank room detail); enrollment or play UI visible |
| 3 | Tap **Back to rooms** (or leave table overlay) | Returns to room list without error toast |
| 4 | Tap **Play Now** again | Succeeds — no `different joinId` / queue carryover error |
| 5 | Open the public table room → **Leave room** → confirm | Room removed from list |
| 6 | Tap **Play Now** again | Succeeds — fresh table |
| 7 | **Private room regression** — Create room + invite join (or join-by-code) | Private create/join/play unchanged |

**Stop / rollback** if any step fails. Do not record policy signoff until all seven pass.

---

## G. Client flag-on rollback

If public Play Now misbehaves after enablement:

1. Set `MIXED_PUBLIC_TABLES_CLIENT_ENABLED = false` in `docs/public-table-rollout.js`.
2. Redeploy **hosting only** (`npm run build:hosting` + CI deploy, or hosting workflow).
3. **Do not** change `MIXED_PUBLIC_TABLES_SERVER_ENABLED` on Functions — server callables and soak remain valid; users revert to private-create Play Now only.

No Functions redeploy required for client rollback.
