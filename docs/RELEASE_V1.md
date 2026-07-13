# v1.0 release operator runbook

Branch: **`release/v1.0`** · Compliance baseline: **`e4da4cd`** (or later on that branch).

Automated repo checks:

```bash
npm run verify:release
npm run verify:release:prod   # after hosting deploy
```

## 1. Deploy and verify

```bash
git fetch origin
git checkout release/v1.0
git pull origin release/v1.0
npm ci
```

**Deploy hosting** (privacy/support under `/social/`):

| Path | Command |
| --- | --- |
| **CI (preferred)** | Merge `release/v1.0` → `main`, push; wait for **Deploy to Firebase** green |
| **Manual login** | `BUILD_CHANNEL=production npm run deploy:hosting` |
| **Service account** | `FORCE_DEPLOY=1 npm run deploy:hosting:sa` |

**Verify:**

```bash
npm run verify:prod
curl -sS -o /dev/null -w "%{http_code}\n" "https://booray.win/social/privacy.html"
curl -sS -o /dev/null -w "%{http_code}\n" "https://booray.win/social/support.html"
```

Both URLs must return **200** and real policy/support HTML (not the SPA shell).

**App Store Connect URLs (after deploy):**

- Privacy: `https://www.booray.win/social/privacy.html`
- Support: `https://www.booray.win/social/support.html`

## 2. iOS release build

```bash
git checkout release/v1.0 && git pull && npm ci
node scripts/ensure-firebase-config.js
npm run build:cap:release
npm run verify:cap:ios-google
npx cap open ios
```

**One-time Xcode (per Mac):** add `GoogleService-Info.plist` + `REVERSED_CLIENT_ID` URL scheme — see [`NATIVE_IOS_GOOGLE_AUTH.md`](./NATIVE_IOS_GOOGLE_AUTH.md).

Archive: Clean Build Folder → scheme **App** → **Archive** → TestFlight/internal.

## 3. Native Google Sign-In (physical iPhone)

See [`NATIVE_IOS_GOOGLE_AUTH.md`](./NATIVE_IOS_GOOGLE_AUTH.md). Summary: fresh install → **Continue with Google** (native picker) → signed in → sign out → sign in again → force-quit → still signed in.

## 4. Physical iPhone gameplay smoke

Prod URL with debug: `https://www.booray.win/social/?handTransitionDebug=1`

Sign in → room → bots → Go to Table → enrollment → draw → Best Play → pre-play queue → portrait/landscape avatars → full hand → bust → **I'm out** → next hand within ~20s.

If stall: export `JSON.stringify(window.__nblHandTransitionTimeline, null, 2)` — **do not merge PR #459** without timeline.

## 5. App Store Connect

- Bundle ID `win.booray.app`
- Privacy + Support URLs (above)
- Export compliance: **No** custom encryption (`ITSAppUsesNonExemptEncryption=false`)
- Privacy nutrition labels, age rating, screenshots, review notes
- `support@booray.win` mailbox live

## Internal RC gate

All required:

1. `npm run verify:release:prod` PASS
2. `build:cap:release` archive on physical iPhone
3. Native Google Sign-In device checklist PASS
4. Gameplay smoke with `handTransitionDebug=1` complete (stall not repro’d or timeline captured)
