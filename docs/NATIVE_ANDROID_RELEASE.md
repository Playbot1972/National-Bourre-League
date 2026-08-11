# Android native release (Capacitor)

Operator runbook for **Booray** (`win.booray.app`) on Google Play. Mirrors the iOS flow in [`NATIVE_IOS_GOOGLE_AUTH.md`](./NATIVE_IOS_GOOGLE_AUTH.md) and [`RELEASE_V1.md`](./RELEASE_V1.md).

## Repo status (automated)

```bash
npm run verify:cap:android
```

Checks bundle ID, Capacitor plugin wiring, native version sync, and (optionally) `dist/social`. Does **not** require `google-services.json` or signing secrets in git.

After a full web build:

```bash
npm run verify:cap:android -- --require-bundle
```

## App identity

| Field | Value |
| --- | --- |
| Capacitor `appId` | `win.booray.app` |
| Android `applicationId` | `win.booray.app` |
| Web bundle (`webDir`) | `dist/social` |
| Display name | Booray |

## Versioning

`npm run version:sync` (run automatically by `build:cap:web`) stamps:

| Store field | Source |
| --- | --- |
| `versionName` (Android) / `MARKETING_VERSION` (iOS) | `package.json` version (`N.NN.NN`) |
| `versionCode` (Android) / `CURRENT_PROJECT_VERSION` (iOS) | Monotonic integer: `major×10000 + minor×100 + patch` (e.g. `1.04.78` → `10478`) |

Always bump `package.json` (or `npm run version:bump:patch`) before store uploads so build numbers increase.

---

## 1. One-time Firebase Android app

1. [Firebase Console](https://console.firebase.google.com/) → **national-bourre-league**
2. **Project settings** → **Your apps** → **Add app** → **Android**
3. **Package name:** `win.booray.app`
4. Download **`google-services.json`**
5. Copy to **`android/app/google-services.json`** (gitignored — see `google-services.json.example`)
6. **Authentication** → **Sign-in method** → **Google** → **Enable**

Gradle applies the Google Services plugin automatically when `google-services.json` exists.

### Production Firebase web keys (bundled into Capacitor)

The native shell loads `dist/social`, which includes `firebase-config.js`. Release builds **fail** if placeholder web keys would be bundled.

**Local setup (recommended):**

```bash
cp .env.firebase.example .env.firebase
# Fill FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_APP_ID, FIREBASE_AUTH_DOMAIN=booray.win
node scripts/ensure-firebase-config.js
```

Values: Firebase Console → Project settings → Your apps → **Web app** → SDK setup.

**Alternative:** export the same `FIREBASE_*` env vars, or run `npm run setup:webapp -- national-bourre-league booray.win` after `firebase login`.

`npm run build:cap:android:release` runs `ensure-firebase-config` before Gradle and rejects placeholder `dist/social/firebase-config.js`.

Emulator/local dev on `localhost:8080` is unchanged — `docs/firebase-config.js` still switches to emulators on loopback; Capacitor native builds use production keys only.

---

## 2. Google Sign-In — SHA-1 / SHA-256 fingerprints

Native Google sign-in requires registering your signing certificates in Firebase.

### Debug (local device testing)

```bash
cd android
./gradlew signingReport
```

Copy **SHA-1** and **SHA-256** for the `debug` variant → Firebase → Android app → **Add fingerprint**.

### Release (Play Store)

After you create a release keystore (step 3), run `signingReport` again or:

```bash
keytool -list -v -keystore /path/to/release.keystore -alias booray
```

Also add **Play App Signing** certificates from Google Play Console → **Setup** → **App signing** (Google may re-sign your upload key).

---

## 2b. Android App Links (deep links)

The app declares verified App Links for **`https://www.booray.win/social/*`** (`AndroidManifest.xml`, `android:autoVerify="true"`).

App Links are **not production-ready** until hosting serves a valid Digital Asset Links file:

```
https://www.booray.win/.well-known/assetlinks.json
```

Template (do not deploy with placeholder fingerprint):

```
public/.well-known/assetlinks.json.example
```

After the **first Play upload** is processed:

1. Play Console → **Setup** → **App signing** → copy **App signing key certificate** SHA-256
2. Generate the live file locally (gitignored):

```bash
export ANDROID_APP_LINKS_SHA256=AA:BB:CC:...   # Play App Signing SHA-256
node scripts/write-assetlinks-json.js
```

3. Deploy hosting (`npm run deploy:hosting` or CI) so `dist/.well-known/assetlinks.json` is live
4. Verify:

```bash
curl -sS https://www.booray.win/.well-known/assetlinks.json
```

The file must list package **`win.booray.app`** and the **Play App Signing** SHA-256 (not your upload-key SHA-256). Until this file is live and verified, `https://www.booray.win/social/...` links open in the browser instead of the app.

---

## 3. Release keystore (local only — never commit)

```bash
keytool -genkey -v \
  -keystore ~/secrets/booray-release.keystore \
  -alias booray \
  -keyalg RSA -keysize 2048 -validity 10000
```

Configure Gradle signing (gitignored):

```bash
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties`:

```properties
storeFile=/absolute/or/relative/path/to/release.keystore
storePassword=***
keyAlias=booray
keyPassword=***
```

`storeFile` is resolved relative to the **`android/`** directory.

**Secure storage:** password manager, encrypted backup, Play App Signing upload key escrow. Do not commit `.jks`, `.keystore`, or `keystore.properties`.

---

## 4. Build release AAB (local)

Prerequisites: Node 18+, JDK 21+, Android SDK (Android Studio recommended).

```bash
npm ci
cp .env.firebase.example .env.firebase   # fill web app keys (gitignored)
node scripts/ensure-firebase-config.js
npm run build:cap:android:release
```

This runs:

1. `build:cap:release` — web bundles + `verify:cap:*` + `npx cap sync`
2. `./gradlew bundleRelease` — signed release AAB (requires `keystore.properties`)

**Output:**

```
android/app/build/outputs/bundle/release/app-release.aab
```

If signing is missing, the script exits with instructions before Gradle runs.

### Open in Android Studio (optional)

```bash
npm run build:cap:release
npm run cap:open:android
```

Use **Build → Generate Signed Bundle / APK** if you prefer the GUI (same output path).

---

## 5. Google Play Console — internal testing

1. [Google Play Console](https://play.google.com/console/) → create app **Booray**
2. **Release** → **Testing** → **Internal testing** → **Create new release**
3. Upload **`app-release.aab`**
4. Complete **App content** (privacy policy URL, data safety, content rating)
5. **Privacy policy URL:** `https://www.booray.win/social/privacy.html`
6. Add internal testers → **Review release** → **Start rollout**

### Play App Signing

On first upload, enroll in **Play App Signing**. Google holds the app signing key; you keep the upload keystore. Register Play’s app-signing SHA fingerprints in Firebase (step 2).

### Promote to production

After internal/closed testing:

1. **Release** → promote tested track → **Production**
2. Complete store listing (screenshots, descriptions, category)
3. Submit for review

---

## 6. Device verification checklist

On a physical Android device (internal track or sideload debug build):

- [ ] App launches; splash hides; rooms list loads
- [ ] **Continue with Google** — native account picker (not browser redirect)
- [ ] Email sign-in / sign-up works
- [ ] Join or create room → **Go to Table** → full hand (draw → play → settlement)
- [ ] `https://www.booray.win/social/...` opens the app (only after live `assetlinks.json` with Play App Signing SHA-256)
- [ ] Sound + haptics on table (see `AGENTS.md` § Table feedback)
- [ ] Footer shows expected version (`package.json` / `version.js`)
- [ ] Force-quit and relaunch — session persists

Filter logcat / Chrome remote debugging: `[nbl-native]`, `[nbl-auth]`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `build:cap:android:release` — missing `keystore.properties` | Copy example file, set real keystore path/passwords |
| Google sign-in `DEVELOPER_ERROR` / `10:` | Add debug/release SHA-1 to Firebase; ensure `google-services.json` package is `win.booray.app` |
| Stale web UI in native shell | `npm run build:cap:release` then reinstall |
| `verify:cap:android` version mismatch | `npm run version:sync` |
| Gradle JDK errors | Use JDK 21; set `JAVA_HOME` |

---

## Related docs

- iOS native Google auth: [`NATIVE_IOS_GOOGLE_AUTH.md`](./NATIVE_IOS_GOOGLE_AUTH.md)
- Release operator checklist: [`RELEASE_V1.md`](./RELEASE_V1.md)
- Local web + emulator testing: [`TESTING.md`](./TESTING.md)
