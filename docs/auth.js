// auth.js — Firebase Authentication wrapper (modular, vanilla JS).
//
// Loads the Firebase Web SDK from the gstatic CDN (static-friendly, no bundler)
// and exposes a small, framework-agnostic API used by app.js.

import {
  firebaseConfig,
  FIREBASE_SDK_VERSION,
  AUTH_EMULATOR_URL,
} from "./firebase-config.js";

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

const { initializeApp } = await import(`${CDN}/firebase-app.js`);
const {
  getAuth,
  initializeAuth,
  connectAuthEmulator,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} = await import(`${CDN}/firebase-auth.js`);

export function isCapacitorNative() {
  try {
    return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

/** Native-only auth diagnostics — no secrets or tokens. */
function logNativeAuth(event, detail) {
  if (!isCapacitorNative()) return;
  if (detail !== undefined) {
    console.info("[nbl-auth]", event, detail);
  } else {
    console.info("[nbl-auth]", event);
  }
}

/** Match authDomain to the page host on custom domains (fixes iOS Safari sign-out on refresh). */
function resolveAuthDomain(config) {
  if (typeof location === "undefined") return config.authDomain;
  const host = location.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return config.authDomain;
  if (host.endsWith(".firebaseapp.com") || host.endsWith(".web.app")) {
    return config.authDomain;
  }
  return host;
}

const appConfig = {
  ...firebaseConfig,
  authDomain: resolveAuthDomain(firebaseConfig),
};

// Initialize once and share the FirebaseApp instance with other modules
// (e.g. firestore.js) so they don't call initializeApp again.
export const app = initializeApp(appConfig);

const nativeApp = isCapacitorNative();

let auth;
try {
  // WKWebView (Capacitor iOS): localStorage persistence is more reliable than IndexedDB.
  auth = initializeAuth(
    app,
    nativeApp
      ? { persistence: browserLocalPersistence }
      : {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence],
          popupRedirectResolver: browserPopupRedirectResolver,
        },
  );
} catch (err) {
  if (err?.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw err;
  }
}

// Connect to the local Auth emulator during development.
export const usingEmulator = Boolean(AUTH_EMULATOR_URL);
if (usingEmulator) {
  try {
    connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
    console.info("[nbl-dev] Auth emulator connected:", AUTH_EMULATOR_URL);
  } catch (err) {
    console.warn(
      "[nbl-dev] Could not connect to the Auth emulator:",
      AUTH_EMULATOR_URL,
      err,
    );
  }
} else if (typeof location !== "undefined" && (location.port === "8080" || location.port === "")) {
  console.warn(
    "[nbl-dev] Auth emulator not configured — sign-in will hit production and may fail offline. Use http://localhost:8080 or ?emulators=1",
  );
}

if (nativeApp) {
  logNativeAuth("auth-init", {
    usingEmulator,
    persistence: "browserLocal",
    authDomain: appConfig.authDomain,
  });
}

const googleProvider = new GoogleAuthProvider();

/**
 * Subscribe to auth state changes. The callback receives a normalized user
 * object (or null when signed out).
 * @param {(user: NormalizedUser | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? normalizeUser(user) : null);
  });
}

export function currentUser() {
  return auth.currentUser ? normalizeUser(auth.currentUser) : null;
}

/** Resolves when Firebase Auth has finished its initial state check (token ready for Firestore). */
export function whenAuthReady() {
  return auth.authStateReady();
}

/** Create an account with email + password and set a display name. */
export async function signUpWithEmail({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return normalizeUser(cred.user);
}

/** Sign in with an existing email + password account. */
export async function signInWithEmail({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return normalizeUser(cred.user);
}

/**
 * Native Google sign-in via @capacitor-firebase/authentication (built to auth-google-native.js).
 * Does not use signInWithPopup or signInWithRedirect.
 *
 * Google tap log stages (Safari Web Inspector filter: nbl-auth):
 *   google-button-tapped → busy-set → native-branch-selected → plugin-call-start →
 *   plugin-availability-check → plugin-call-resolved|plugin-call-error →
 *   firebase-credential-start → firebase-credential-success|firebase-credential-error → busy-cleared
 * See docs/NATIVE_IOS_GOOGLE_AUTH.md § Capture auth logs on iPhone.
 */
async function signInWithGoogleNative() {
  logNativeAuth("native-branch-selected");
  let nativeModule;
  try {
    nativeModule = await import("./auth-google-native.js");
  } catch (importErr) {
    const err = new Error(
      "Native Google auth bundle missing. Run npm run build:cap.",
    );
    err.code = "auth/native-google-not-configured";
    logNativeAuth("plugin-call-error", {
      code: err.code,
      message: err.message,
      phase: "import-auth-google-native",
    });
    throw err;
  }

  try {
    const { idToken, accessToken } = await nativeModule.nativeGoogleSignIn();
    logNativeAuth("firebase-credential-start", { hasIdToken: Boolean(idToken) });
    const { signInWithCredential } = await import(`${CDN}/firebase-auth.js`);
    const cred = GoogleAuthProvider.credential(idToken, accessToken);
    const userCred = await signInWithCredential(auth, cred);
    logNativeAuth("firebase-credential-success", {
      hasUser: Boolean(userCred?.user),
    });
    return normalizeUser(userCred.user);
  } catch (err) {
    logNativeAuth("firebase-credential-error", {
      code: err?.code ?? null,
      message: err?.message ?? String(err),
    });
    throw err;
  }
}

/** Sign in with Google — web redirect/popup; native plugin path (no popup/redirect). */
export async function signInWithGoogle() {
  if (usingEmulator) {
    const cred = await signInWithPopup(auth, googleProvider);
    return normalizeUser(cred.user);
  }

  if (isCapacitorNative()) {
    return signInWithGoogleNative();
  }

  await signInWithRedirect(auth, googleProvider);
  return null;
}

/** Call on page load to finish a Google redirect sign-in (web only). */
export async function completeGoogleRedirectSignIn() {
  if (usingEmulator || isCapacitorNative()) return null;
  const result = await getRedirectResult(auth);
  return result?.user ? normalizeUser(result.user) : null;
}

/** Which sign-in providers Firebase has for this email (may be empty if hidden). */
export async function lookupSignInMethods(email) {
  try {
    return await fetchSignInMethodsForEmail(auth, email);
  } catch {
    return null;
  }
}

function passwordResetContinueUrl() {
  if (typeof location === "undefined") return undefined;
  // Packaged app runs at https://localhost — reset links must open production web.
  if (isCapacitorNative()) {
    return "https://www.booray.win/social/";
  }
  const host = location.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") {
    return `${location.origin}${location.pathname}`;
  }
  if (host === "booray.win" || host === "www.booray.win") {
    return `https://www.booray.win/social/`;
  }
  return `${location.origin}${location.pathname}`;
}

/**
 * Email a password reset link. Only works for email/password accounts.
 * Returns { sent, methods, reason } so the UI can explain Google-only accounts.
 */
export async function sendPasswordReset(email, { confirmedPasswordAccount = false } = {}) {
  const methods = await lookupSignInMethods(email);
  if (methods?.includes("google.com") && !methods.includes("password")) {
    return { sent: false, methods, reason: "google-only" };
  }

  // Firebase may hide providers (enumeration protection) — require explicit opt-in.
  if (!methods?.includes("password") && !confirmedPasswordAccount) {
    return { sent: false, methods: methods ?? [], reason: "confirm-needed" };
  }

  const continueUrl = passwordResetContinueUrl();
  await sendPasswordResetEmail(
    auth,
    email,
    continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined,
  );
  return { sent: true, methods: methods ?? [], reason: null };
}

export function signOutUser() {
  return signOut(auth);
}

/**
 * Convert Firebase error codes into short, friendly messages.
 * @param {unknown} error
 */
export function describeAuthError(error) {
  const code = error && typeof error === "object" ? error.code : "";
  switch (code) {
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/email-already-in-use":
      return "An account already exists for that email. Try signing in.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups, or try again — we'll redirect to Google instead.";
    case "auth/unauthorized-domain":
      return "This site isn't authorized for sign-in. Contact the host.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this app.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using email/password. Sign in that way instead.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/invalid-continue-uri":
      return "Could not send reset email (site URL not authorized). Contact the host.";
    case "auth/argument-error":
      return "Google sign-in could not start. Hard refresh and try again.";
    case "auth/native-google-not-configured":
      return "Google sign-in needs a fresh native build (npm run build:cap) and GoogleService-Info.plist in Xcode.";
    case "auth/native-google-no-token":
      return "Google sign-in did not complete. Add GoogleService-Info.plist to the Xcode App target and the REVERSED_CLIENT_ID URL scheme.";
    case "auth/native-firebase-plugin-unavailable":
      return "Native Google plugin is missing. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.";
    case "auth/native-google-timeout":
      return "Google sign-in timed out. In Xcode, add GoogleService-Info.plist to the App target and register the REVERSED_CLIENT_ID URL scheme.";
    case "auth/native-not-capacitor":
    case "auth/native-capacitor-register-missing":
    case "auth/native-capacitor-bridge-missing":
      return "Google sign-in is only available in the native app build.";
    default:
      return (error && error.message) || "Something went wrong. Please try again.";
  }
}

/**
 * @typedef {Object} NormalizedUser
 * @property {string} uid
 * @property {string} displayName
 * @property {string|null} email
 * @property {string|null} photoURL
 */

/** @returns {NormalizedUser} */
function normalizeUser(user) {
  const fallbackName = user.email ? user.email.split("@")[0] : "Player";
  return {
    uid: user.uid,
    displayName: user.displayName || fallbackName,
    email: user.email || null,
    photoURL: user.photoURL || null,
  };
}
