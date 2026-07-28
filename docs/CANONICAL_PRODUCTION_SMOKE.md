# Canonical production smoke — two-device manual checklist

Automated baseline (`npm run verify:baseline`) proves server join policy, Firestore guards, and emulator two-client flows. **This checklist is the final human confirmation on production** after deploy — it is not replaced by automation.

Run on **two physical devices** (or one phone + one desktop) against **https://booray.win** (or staging) with distinct accounts.

## Preconditions

- [ ] Production version ≥ repo release (footer matches or exceeds `package.json` version; post-**v1.04.47** spectator layout fixes deployed)
- [ ] Both devices signed in (not guest-only on production unless explicitly testing guest path)
- [ ] Stable network; disable low-power / background tab throttling during the hand

## 1. Mixed Play Now — same table

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Host | Tap **Play Now** → **Mixed** | Table opens; bots fill empty seats |
| 2 | Guest | Tap **Play Now** → **Mixed** within ~30s | Lands in **same** session as host (not a new empty table) |
| 3 | Both | Observe roster for 30s | Roster stable — no flicker, no duplicate humans, no unexpected kick |
| 4 | Both | Table stays open | No mount/unmount loop; felt and seats remain visible |

## 2. Mid-hand join — watch-only

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Host | Start a hand (enrollment → deal → play) | Hand in progress |
| 2 | Guest | **Play Now** while hand active | **Watch-only** banner; no hole cards; cannot act |
| 3 | Guest | Seat layout | **No bot avatar in table center** (spectator layout; last fill bot not bottom-center) |
| 4 | Host | Finish current hand | Hand settles normally |

## 3. Next-hand seat / promotion

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Guest | After hand boundary | Watch-only clears; guest **seated** for next deal (or clear "next hand" messaging) |
| 2 | Guest | Next enrollment | Can tap **I'm in** / participate — not stuck spectating |
| 3 | Both | Play one full trick | Turn order sane; no stuck turn timer on spectator device |

## 4. Regression guards (post v1.04.47)

| Check | Expected |
|-------|----------|
| Center-bot bug | No fill bot overlapping center cluster / pot on watch-only **mobile** or desktop |
| Table loop | No rapid open/close of `#table-play-overlay`; no reload banner loop |
| Mixed banner | Play Now mode banner truthful (mixed vs bots-only if toggled) |
| Leave / re-join | Guest can leave room; re-join does not corrupt host session |

## 5. Sign-off

| Field | Value |
|-------|-------|
| Date | |
| App version (footer) | |
| Host device / browser | |
| Guest device / browser | |
| Mixed Play Now same session | ☐ Pass ☐ Fail |
| Mid-hand watch-only | ☐ Pass ☐ Fail |
| Next-hand promotion | ☐ Pass ☐ Fail |
| No center-bot / no table loop | ☐ Pass ☐ Fail |
| Notes | |

## Related automation

| Command | What it proves |
|---------|----------------|
| `npm run verify:baseline` | Prod version + `publicTableJoin.integration` + Firestore public-table rules |
| `PLAYWRIGHT_EMULATORS=1 npm run test:e2e:public-table` | Two-browser Play Now join, watch-only mid-hand, boundary promotion (emulator) |
| `npm run test:rules:firestore` | Full Firestore rules suite under isolated emulator |
