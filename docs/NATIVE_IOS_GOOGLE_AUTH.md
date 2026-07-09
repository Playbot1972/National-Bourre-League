# Native iOS Google Sign-In (Capacitor)

Checklist for **National Bourré League** native app (`win.booray.app`).

## Repo status (automated)

```bash
npm run verify:cap:ios-google
```

This confirms plugin wiring, native auth code path, and bundled `auth-google-native.js`. It does **not** replace the manual Firebase/Xcode steps below.

## Auth behavior

| Platform | Google sign-in | Email/password |
| --- | --- | --- |
| Web (`booray.win/social/`) | `signInWithRedirect` | Firebase JS SDK |
| Emulator (`localhost:8080`) | `signInWithPopup` | Firebase JS SDK |
| Capacitor iOS/Android | `@capacitor-firebase/authentication` plugin only | Firebase JS SDK |

Native **never** uses `signInWithPopup` or `signInWithRedirect` for Google.

## Manual setup (required once per machine)

### 1. Firebase Console — register iOS app

1. Open [Firebase Console](https://console.firebase.google.com/) → project **national-bourre-league**
2. **Project settings** → **Your apps** → **Add app** → **iOS**
3. **Bundle ID:** `win.booray.app`
4. Download **GoogleService-Info.plist** (do not commit this file to git)

### 2. Firebase Console — enable Google provider

1. **Authentication** → **Sign-in method**
2. **Google** → **Enable** → Save

### 3. Xcode — add plist to App target

1. `npx cap open ios` (opens `ios/App/App.xcodeproj`)
2. Drag **GoogleService-Info.plist** into the **App** group
3. Check **Copy items if needed**
4. Target membership: **App** ✓

See `ios/App/App/GoogleService-Info.plist.example` for field reference only.

### 4. Xcode — URL scheme (REVERSED_CLIENT_ID)

1. Open **GoogleService-Info.plist** in Xcode
2. Copy the **REVERSED_CLIENT_ID** value (e.g. `com.googleusercontent.apps.XXXX`)
3. Select **App** target → **Info** → **URL Types** → **+**
4. **URL Schemes:** paste **REVERSED_CLIENT_ID** exactly

Required for Google OAuth return to the app.

### 5. Build and run on device

```bash
npm run build:cap
npx cap open ios
```

In Xcode: scheme **App** → your **iPhone** → **⌘R**

**Device prerequisites:** Developer Mode on, developer cert trusted (**Settings → General → VPN & Device Management**).

## Verify on device

1. **Continue with Google** — native Google account picker appears
2. Return to app signed in (rooms list loads)
3. **Create account** / **Sign in** (email) — submit button enables after typing; not stuck on “Redirecting to Google…”

## Capture auth logs on iPhone

**Use Safari Web Inspector, not the Xcode console.** Xcode shows native/iOS noise; `[nbl-auth]` / `[nbl-native]` logs come from the Capacitor WebView JavaScript layer.

### Setup (once per session)

1. **iPhone:** Settings → Safari → Advanced → **Web Inspector** ON
2. Connect iPhone to Mac with USB; trust the computer if prompted
3. **Mac Safari:** Safari → Settings → Advanced → enable **Show features for web developers**
4. Run the app from Xcode on the iPhone (leave it on the sign-in screen)

**iOS 16.4+ WebView inspectability:** Capacitor sets `WKWebView.isInspectable` from `ios.webContentsDebuggingEnabled` in `capacitor.config.ts` (on by default; set `CAPACITOR_WEB_DEBUG=0` before `cap sync` to disable). After changing this, run `npm run build:cap` and rebuild in Xcode. If the Develop menu shows the app but the console is empty, the WebView was not inspectable — rebuild with the updated config.

**`plugin-check` at boot:** `jsPluginsEntry: false` is normal before Google sign-in. Look for `nativeHeader: true`. If both are `false`, the Firebase auth plugin is not linked in Xcode — run `npm run build:cap` and rebuild.

### Capture after tapping Continue with Google

1. **Mac Safari:** menu **Develop** → **[Your iPhone]** → select **Booray** / `capacitor://localhost`
2. Open the **Console** tab
3. Click **Clear** (trash icon)
4. In the filter box, type exactly: **`nbl-auth`**
5. On iPhone, tap **Continue with Google** once
6. Copy the **first 5–10 lines** that appear (right-click → Copy or select text)

**Boot / plugin check only:** clear console, filter **`nbl-native`**, reload the app, confirm `plugin-check` shows `FirebaseAuthentication: true` before tapping Google.

### Expected `[nbl-native]` boot sequence

In order (filter `nbl-native`):

1. `bridge-loading`
2. `plugin-check` — must show `FirebaseAuthentication: true`
3. `dom-content-loaded` or `dom-already-ready`
4. `app-boot-start`
5. `app-boot-ready`
6. `splash-hidden`

Also on boot (filter `nbl-auth`): `auth-init`

### Expected `[nbl-auth]` sequence after Google tap

In order (filter `nbl-auth`):

1. `google-button-tapped`
2. `busy-set`
3. `native-branch-selected`
4. `plugin-call-start`
5. `plugin-availability-check` — `available` should be `true`
6. `plugin-call-resolved` **or** `plugin-call-error`
7. `firebase-credential-start`
8. `firebase-credential-success` **or** `firebase-credential-error`
9. `busy-cleared`

### Interpret the last visible stage

| Last `[nbl-auth]` line you see | Meaning |
| --- | --- |
| *(none)* | Wrong inspector target, old build, or filter typo — see paste line below |
| `google-button-tapped` only | Handler ran; check `busy-set` and whether button was already disabled |
| Stops before `native-branch-selected` | Tap handler did not reach `signInWithGoogle()` |
| Stops at `plugin-call-start` / `plugin-availability-check` | Native plugin missing or misconfigured — rebuild + `cap sync ios` |
| `plugin-call-error` | Read `code` and `message` in the log object |
| Stops at `plugin-call-resolved`, no `firebase-credential-*` | JS bridge returned; Firebase credential step not reached |
| `firebase-credential-error` | Plugin OK; Firebase `signInWithCredential` failed — read `code` / `message` |
| `firebase-credential-success` | Sign-in completed in JS — UI should close auth modal |

### What to paste back

**If logs appear** — paste the first 5–10 `[nbl-auth]` lines after the tap (include the stage name and any `{ code, message }` object on errors).

**If no logs appear** — paste exactly this single line:

```
no [nbl-auth] lines appear
```

Also note whether `nbl-native` filter shows `plugin-check` with `FirebaseAuthentication: true` or `false` on app reload.

## iOS dependency model

This project uses **Swift Package Manager** (Capacitor 8), not CocoaPods. No `Podfile` changes are required — `npx cap sync ios` links `@capacitor-firebase/authentication` via `ios/App/CapApp-SPM/Package.swift`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `[nbl-native] plugin-check` → `FirebaseAuthentication: false` | Run `npm run build:cap`, `npx cap sync ios`, rebuild in Xcode |
| `plugin-call-error` or 45s timeout, no Google picker | Add **GoogleService-Info.plist** to App target + **REVERSED_CLIENT_ID** URL scheme |
| Google tap shows config error | Run `npm run build:cap`; add **GoogleService-Info.plist** to Xcode target |
| Google picker then fails / no return | Add **REVERSED_CLIENT_ID** URL scheme |
| Create account button disabled | Fixed in PR #448 — rebuild; don’t tap Google first without dismissing busy state |
| `auth/unauthorized-domain` | Firebase **Authorized domains** must include `localhost` (Capacitor) and `booray.win` |
