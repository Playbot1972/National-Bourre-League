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
} = await import(`${CDN}/firebase-auth.js`);

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

let auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  });
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
  } catch (err) {
    console.warn("Could not connect to the Auth emulator:", err);
  }
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

/** Sign in with Google via full-page redirect (reliable on custom domains + Chrome). */
export async function signInWithGoogle() {
  if (usingEmulator) {
    const cred = await signInWithPopup(auth, googleProvider);
    return normalizeUser(cred.user);
  }

  await signInWithRedirect(auth, googleProvider);
  return null;
}

/** Call on page load to finish a Google redirect sign-in. */
export async function completeGoogleRedirectSignIn() {
  if (usingEmulator) return null;
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
 * Returns { sent, methods } so the UI can explain Google-only accounts.
 */
export async function sendPasswordReset(email) {
  const methods = await lookupSignInMethods(email);
  if (methods?.includes("google.com") && !methods.includes("password")) {
    return { sent: false, methods, reason: "google-only" };
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
