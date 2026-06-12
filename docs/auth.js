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
  connectAuthEmulator,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
} = await import(`${CDN}/firebase-auth.js`);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

/** Sign in with Google via a popup. */
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return normalizeUser(cred.user);
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
      return "Your browser blocked the sign-in popup. Allow popups and retry.";
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
