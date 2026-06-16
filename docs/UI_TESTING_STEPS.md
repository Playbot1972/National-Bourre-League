# UI Testing Steps (in order)

**Current app:** v1.00.99+  
**Run after every deploy.** Mark each step **PASS** or **FAIL**.

Automated gate first: `npm run test:e2e` → expect **106/106 PASS**.

---

## Phase 0 — Preflight

1. Hard-refresh the site (clear cache if needed).
2. Confirm footer version matches your deploy (e.g. `v1.00.99`).
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

## Phase 2 — Host account (normal browser)

13. Sign in as room **owner**.
14. Profile avatar/name visible in top bar.

---

## Phase 3 — Host: room & session

15. **Private Rooms** → **+ Create a room** and **Join room** bar visible at top.
16. Create room → invite code shows in room header.
17. **+ New session** → confirm → regional tab appears (no red error).
18. Scroll room detail → **Join room** bar still sticky at top.
19. Add robot(s) until **Go to Table** enables (≥2 players).
20. **Go to Table** → table opens → **← Hand results** closes it.
21. **← All rooms** → reopen same room.

---

## Phase 4 — Guest join (incognito window #2)

22. Sign in with a **different** account (not the host).
23. **Private Rooms** → paste host invite code → **Join room**.
24. **PASS:** guest lands in room detail (room name + invite code visible).
25. **PASS:** no immediate bounce to room list with “You were removed…”.
26. **PASS:** guest does **not** see **+ New session** (owner only).
27. Guest sees host in **Members** list.

> **Fixed v1.01.00:** Guest join no longer fails when Firestore membership snapshot arrives a moment after join. A grace period prevents false “removed from room” ejection.

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

| Step | Symptom | Likely cause |
|------|---------|--------------|
| 17 | New session error | Pull latest; host needs v1.00.95+ |
| 23–25 | Guest kicked instantly | Fixed v1.01.00 — redeploy |
| 23 | “No room found for code” | Host must open room once so invite lookup syncs |
| 19 | Go to Table disabled | Add second player/robot |
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
