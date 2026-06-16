# E2E UI / UX Pass–Fail Report

**App version:** v1.00.98  
**Report date:** 2026-06-16  
**Automated run:** `npm run test:e2e`  
**Result:** **106 / 106 PASS** (35s, Chromium + Pixel 5 + iPhone 13 + iPad viewports)

Use this document before each release to confirm the product feels correct, not just that tests are green.

---

## How to read this report

| Status | Meaning |
|--------|---------|
| **PASS (auto)** | Covered by Playwright; last run passed |
| **MANUAL** | Requires signed-in user + Firebase (emulator or prod) — not automated yet |
| **FAIL** | Known broken or regressed — fix before release |

---

## Executive summary

| Layer | Pass | Fail | Manual |
|-------|------|------|--------|
| App shell & auth entry | 8 | 0 | 4 |
| Navigation & theme | 3 | 0 | 1 |
| Private rooms & sessions | 0 | 0 | 12 |
| Live table (fixture) | 88 | 0 | 6 |
| Settlement clarity | 4 | 0 | 1 |
| Layout / overflow | 3 | 0 | 2 |
| **Total UX checkpoints** | **106 auto** | **0** | **26 manual** |

**Best-UX verdict:** Table, card play, settlement copy, and app shell are **release-ready** under automation. Room/session flows (**New session**, **Join room**, **Go to Table** in a real room) need a **short manual pass** after deploy until Firebase emulator E2E lands.

---

## 1. App shell & authentication

| UX goal | User action | Auto | Spec |
|---------|-------------|------|------|
| App loads without crash | Open `/` | **PASS** | `social-smoke`, `table-smoke.desktop` |
| Version visible (support/debug) | See footer `vX.XX.XX` | **PASS** | `social-smoke` |
| Sign-in entry obvious when logged out | See Sign in / Create account | **PASS** | `social-smoke`, `social-buttons` |
| Open sign-in modal | Tap Sign in | **PASS** | `social-buttons` |
| Close sign-in modal | Tap × or backdrop | **PASS** | `social-buttons` |
| Switch sign-in ↔ create account tabs | Tap modal tabs | **PASS** | `social-buttons` |
| Hero CTAs open correct modal mode | Hero Sign in / Create account | **PASS** | `social-buttons` |
| Forgot password flow entry | Forgot password? → reset UI | **PASS** | `social-buttons` |
| Protected nav prompts sign-in | Private Rooms / Leagues while logged out | **PASS** | `social-buttons` |
| Google sign-in completes | Tap Google button | MANUAL | Needs real OAuth or Auth emulator |
| Email sign-in / sign-up works | Submit auth form | MANUAL | Needs Auth emulator |
| Password reset email sends | Submit reset form | MANUAL | Needs Auth + email |
| Profile menu & sign out | Avatar → Sign out | MANUAL | Needs signed-in session |

---

## 2. Navigation & appearance

| UX goal | User action | Auto | Spec |
|---------|-------------|------|------|
| Rules page opens | Nav → Rules | **PASS** | `social-buttons` |
| Home page returns | Nav → Home | **PASS** | `social-buttons` |
| Light/dark theme toggles | Theme button | **PASS** | `social-buttons` |
| No horizontal scroll on home | Load `/` on tablet | **PASS** | `table-layout` |
| PWA / mobile browser chrome | Install, safe areas | MANUAL | Device-specific |

---

## 3. Private rooms & sessions *(manual until emulator E2E)*

These flows were recently fixed (duplicate listeners, session create, sticky Join bar). **Re-verify manually after each deploy.**

| UX goal | User action | Auto | Notes |
|---------|-------------|------|-------|
| Create room | + Create a room → submit | MANUAL | Modal UI exists; needs auth |
| Join room by invite code | Enter code → Join room | MANUAL | Sticky bar in room detail (v1.00.97+) |
| Join bar visible inside open room | Scroll room detail | MANUAL | `body.room-detail-open .room-actions` sticky |
| Open room from list | Tap room card | MANUAL | |
| Back to all rooms | ← All rooms | MANUAL | Delegated handler (v1.00.98) |
| + New session | Confirm → regional tab appears | MANUAL | Fixed path + stale-name cap (v1.00.95–97) |
| Session tab switch | Tap regional tab | MANUAL | Delegated handler (v1.00.98) |
| Go to Table | Toolbar button → full-screen table | MANUAL | Sticky toolbar (v1.00.93+) |
| Add player / robot | Add player form | MANUAL | |
| Complete session | Complete session & update Ape Scores | MANUAL | Delegated handler (v1.00.98) |
| Leave / delete room | Leave or Delete room | MANUAL | |
| Invite code visible to host | Room detail header | MANUAL | |

**Manual checklist (5 min, signed in):**

1. Create room → copy invite code  
2. Join room (second account or incognito) with code  
3. **+ New session** → confirm → tab appears with preset name  
4. Add robot → **Go to Table** → table overlay opens → **← Hand results** closes it  
5. Switch session tabs, **← All rooms** — each action fires **once** (no double confirm / stuck UI)

---

## 4. Live Bourré table (fixture — automated)

| UX goal | User action | Auto | Spec |
|---------|-------------|------|------|
| Table loads (felt, pot, seats) | Open fixture | **PASS** | `table-smoke.desktop` |
| No console errors on table | Play through controls | **PASS** | `consoleGuard` fixture |
| I'm in / join enrollment | Tap join button | **PASS** | `table-smoke.desktop`, `mobile` |
| Enrollment countdown ticks | Wait 2s | **PASS** | `table-players` |
| Settings opens & closes | Gear → Close | **PASS** | `table-smoke.desktop`, `mobile` |
| Draw: trump + hero hand + draw btn | Draw phase fixture | **PASS** | `table-smoke.desktop`, `mobile` |
| Hero hand not stuck on “Loading…” | After deal | **PASS** | `table-smoke.desktop` |
| Play: cards clickable | Play phase | **PASS** | `table-smoke.desktop` |
| Tap card plays once | Touch tap | **PASS** | `table-card-play` |
| Hold card plays once | Long press | **PASS** | `table-card-play` |
| Swipe-up plays card | Swipe gesture | **PASS** | `table-card-play` |
| Illegal card does not play | Tap blocked card | **PASS** | `table-card-play` |
| No double-play same gesture | Single gesture | **PASS** | `table-card-play` |
| Mobile: no horizontal scroll | Pixel 5 landscape | **PASS** | `table-smoke.mobile` |
| Mobile: join, settings, draw, settlement in viewport | Critical controls | **PASS** | `table-smoke.mobile` |
| 2–8 seats, enrollment/draw/play phases | Player matrix | **PASS** (33 cases) | `table-players` |
| Landscape fixture fits width | iPad viewport | **PASS** | `table-layout` |
| Full hand with Firebase + bots | Live room play | MANUAL | Emulator checklist in `QA_RELEASE.md` |

---

## 5. Co-winner settlement clarity

| UX goal | User action | Auto | Spec |
|---------|-------------|------|------|
| Co-winner sees tie headline & pot rules | Settlement panel | **PASS** | `settlement`, `table-smoke.desktop` |
| Agree / Decline enabled for co-winner | Vote buttons | **PASS** | `settlement` |
| Split preview shows per-winner amount | Copy under pot | **PASS** | `settlement` |
| Observer sees disabled votes + hint | Non-winner view | **PASS** | `settlement` |
| Partial votes show who agreed / waiting | Mid-vote state | **PASS** | `settlement` |
| Votes persist to Firebase & resolve hand | Live co-win hand | MANUAL | Cloud Functions + emulators |

---

## 6. Best UX scorecard (release gate)

Rate each **PASS** only after manual check where marked MANUAL.

| Area | Target UX | Status |
|------|-----------|--------|
| First-time visitor understands how to start | Hero + sign-in visible | **PASS (auto)** |
| Signed-in host can open a table in ≤3 taps | Create room → New session → Go to Table | **MANUAL** |
| Guest can join with code without hunting UI | Sticky Join room bar | **MANUAL** (verify post-deploy) |
| Phone landscape: readable table, tappable cards | No overflow; gestures work | **PASS (auto)** |
| Enrollment feels responsive | Join + countdown | **PASS (auto)** |
| Draw/play never blank or “Loading…” forever | Hero hand smoke | **PASS (auto)** |
| Co-win rules understandable before voting | Settlement copy | **PASS (auto)** |
| Buttons fire once (no double handlers) | Room detail after live updates | **MANUAL** (fixed v1.00.98 — verify) |
| Errors visible (not off-screen) | `rooms-error` scrolls into view | **MANUAL** (fixed v1.00.97 — verify) |

**Release recommendation:** Ship when **106/106 auto PASS** and **manual room/session checklist** (section 3) passes on staging or prod after `npm run deploy:hosting`.

---

## 7. Re-run commands

```bash
# Full automated UI suite (106 tests)
npm run test:e2e

# Social + button entry points only
npx playwright test e2e/social-buttons.spec.ts e2e/social-smoke.spec.ts

# Table UX only
npx playwright test e2e/table-smoke.desktop.spec.ts e2e/table-smoke.mobile.spec.ts e2e/table-card-play.spec.ts

# Full release gate (unit + builds + e2e)
npm run test:release
```

---

## 8. Planned automation (UX gaps)

| Gap | Impact | Priority |
|-----|--------|----------|
| Firebase Auth emulator sign-in in Playwright | Unblocks room/session/button E2E | High |
| Multi-tab “host + guest” join flow | Join room regression safety | High |
| Real-room **Go to Table** overlay open/close | Full journey without fixture | Medium |
| **+ New session** with preset name assertion | Session cap regression | Medium |
| Leaderboard / leagues with test data | Secondary nav confidence | Low |

---

*Generated from Playwright suite in `e2e/`. Update version and re-run after each release.*
