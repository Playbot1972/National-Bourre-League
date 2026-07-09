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

Safari Web Inspector: filter `[nbl-auth]` or `[nbl-native]` — expect `google-button-tapped` → `native-branch-selected` → `plugin-call-start` → `plugin-call-resolved` → `firebase-credential-success`.

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
