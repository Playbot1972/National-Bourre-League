# UI Testing Steps (in order)

**Current app:** v1.01.02+  
**Run after every deploy.** Mark each step **PASS** or **FAIL**.

Automated gate first: `npm run test:e2e` → expect **106/106 PASS**.

---

## Phase 0 — Preflight

1. Hard-refresh the site (clear cache if needed).
2. Confirm footer version matches your deploy (e.g. `v1.01.02`).
3. `npm run test:e2e` — all green.

---

## Phase 1 — Logged out (incognito window #1)

4. Home loads with no crash.
5. Footer version visible.
6. **Sign in** opens modal → **×** closes it.
7. Hero **Create account** opens create-account mode.
8. Auth tabs switch Sign in ↔ Create account.
9. **Forgot password?** shows reset UI.
10. Nav **Private Rooms** → sign-in modal (expected when logged out).
11. Nav **Rules** → **Home** works.
12. Theme toggle changes light/dark.

---

## Phase 2 — Host account (incognito or normal browser)

13. Sign in as room **owner**.
14. Profile avatar/name visible in top bar.

> Incognito is fine for the full host pass — use a fresh window so auth and room state are clean.

---

## Phase 3 — Host: room & session

15. **Private Rooms** → **+ Create a room** and **Join room** bar visible at top.
16. Create room → invite code shows in room header.
17. **+ New session** → confirm → regional tab appears (Dirty South, Wild West, etc.; no red error).
18. Scroll room detail → **Join room** bar still sticky at top.
19. **Add robot(s) until Go to Table enables (≥2 players).**
    - Check **Robot** → tap **Add player** (name optional; auto-names e.g. `Robot`).
    - **Go to Table** must become enabled after the second player is on the sheet.
20. **Go to Table** → table opens → **← Hand results** closes it.
21. **← All rooms** → reopen same room.

### Condensed host checklist (steps 1–7)

| # | Action | PASS when |
|---|--------|-----------|
| 1 | Sign in (incognito OK) | Avatar/name in top bar |
| 2 | **Private Rooms** | Create + Join bar visible |
| 3 | **+ Create a room** | Invite code in room header |
| 4 | Scroll room detail | Join bar stays sticky |
| **5** | **+ New session → confirm** | **Regional tab appears (Dirty South, Wild West, …)** |
| 6 | Add robot in **Add guest or robot** panel below tabs → **Go to Table** enables | Form is in session panel (not hidden behind Join bar) |
| 7 | **Go to Table** | Table overlay opens |

> **First reported incognito failure:** condensed step **5** (+ New session — tab never appeared). Fixed **v1.01.02** (stale claimed-name cap, pool refresh before create, optimistic tab render).

---

## Phase 4 — Guest join (incognito window #2)

22. Sign in with a **different** account (not the host).
23. **Private Rooms** → paste host invite code → **Join room**.
24. **PASS:** guest lands in room detail (room name + invite code visible).
25. **PASS:** no immediate bounce to room list with “You were removed…”.
26. **PASS:** guest does **not** see **+ New session** (owner only).
27. Guest sees host in **Members** list.

> **Fixed v1.01.00:** Guest join grace period — membership snapshot race.

---

## Phase 5 — Buttons fire once (host browser)

28. Switch **session tabs** (if multiple) — one panel update per tap.
29. **+ New session** again (if under 4 tables) — one confirm dialog only.
30. **Go to Table** after live score updates — opens once per tap.
31. Session **notes** save (type, wait, refresh).
32. **Complete session** — one confirm, Ape Scores update.
33. Error messages scroll into view (red bar at top).

---

## Phase 6 — Phone table (landscape)

34. **Go to Table** on phone, rotate landscape.
35. No horizontal scroll; felt/pot/seats readable.
36. **I'm in** during enrollment (if applicable).
37. Hero hand shows cards (not stuck “Loading…”).
38. Draw button and trump visible in draw phase.
39. Play a card: tap, hold, or swipe up — once per gesture.
40. Settings gear opens and closes.

---

## Phase 7 — Live hand (optional)

41. Play one full hand with robots through settlement.
42. Hand result appears in room sidebar.

---

## Phase 8 — Cleanup

43. Guest: **Leave room**. Host: **Delete room** (or leave).
44. Sign out → **Private Rooms** prompts sign-in again.

---

## Quick reference — common failures

| Step | Symptom | Likely cause / fix |
|------|---------|-------------------|
| **5 / 17** | **No regional tab after + New session** | **Fixed v1.01.02** — pull, redeploy; stale `claimedSessionNames` blocked create |
| 17 | Red error on New session | Check footer ≥ v1.00.95; read error bar at top |
| 19 | Go to Table stays disabled | Fixed v1.01.01 — check Robot, tap Add (name optional) |
| 23–25 | Guest kicked instantly | Fixed v1.01.00 — redeploy |
| 23 | “No room found for code” | Host must open room once so invite lookup syncs |
| 33 | Error off-screen | Fixed v1.00.97 — scroll should auto-show |

---

## Automated coverage

| Phase | Automated? |
|-------|------------|
| 0 | `npm run test:e2e` |
| 1–2 | `e2e/social-buttons.spec.ts` (partial) |
| 3–5 | Manual (Firebase auth) |
| 6 | `table-smoke.mobile`, `table-card-play` |
| 7–8 | Manual |

See **`docs/E2E_UI_UX_REPORT.md`** for full pass/fail matrix.
