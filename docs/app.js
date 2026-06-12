// app.js — session handling and UI wiring for the Bourré social app.
//
// Modular vanilla JS. Imports the auth module, reacts to auth state changes,
// toggles logged-out / logged-in UI, drives the profile dropdown, and gates
// the protected Private Rooms and Leagues views.

import {
  onAuthChange,
  currentUser,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  describeAuthError,
  usingEmulator,
} from "./auth.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------
let session = null; // NormalizedUser | null

function isAuthed() {
  return session !== null;
}

// ---------------------------------------------------------------------------
// Auth modal
// ---------------------------------------------------------------------------
const authModal = $("#auth-modal");
const authForm = $("#auth-form");
const nameField = $('[data-field="name"]');
const emailInput = $("#auth-email");
const passwordInput = $("#auth-password");
const errorEl = $("#auth-error");
const submitBtn = $("#auth-submit");
const authTitle = $("#auth-title");
const tabSignin = $("#tab-signin");
const tabSignup = $("#tab-signup");

let mode = "signin"; // "signin" | "signup"

function openAuth(nextMode = "signin") {
  setMode(nextMode);
  clearError();
  authModal.hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => emailInput.focus(), 50);
}

function closeAuth() {
  authModal.hidden = true;
  document.body.classList.remove("modal-open");
  authForm.reset();
  clearError();
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === "signup";
  authTitle.textContent = signup ? "Create account" : "Sign in";
  submitBtn.textContent = signup ? "Create account" : "Sign in";
  nameField.hidden = !signup;
  passwordInput.setAttribute(
    "autocomplete",
    signup ? "new-password" : "current-password",
  );
  tabSignin.classList.toggle("is-active", !signup);
  tabSignup.classList.toggle("is-active", signup);
  clearError();
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = "";
  errorEl.hidden = true;
}

function setBusy(busy) {
  submitBtn.disabled = busy;
  submitBtn.dataset.busy = busy ? "true" : "false";
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const name = $("#auth-name").value.trim();

  if (!email || !password) {
    showError("Please enter your email and password.");
    return;
  }

  setBusy(true);
  try {
    if (mode === "signup") {
      await signUpWithEmail({ name, email, password });
    } else {
      await signInWithEmail({ email, password });
    }
    closeAuth();
  } catch (err) {
    showError(describeAuthError(err));
  } finally {
    setBusy(false);
  }
});

$("#google-signin").addEventListener("click", async () => {
  clearError();
  setBusy(true);
  try {
    await signInWithGoogle();
    closeAuth();
  } catch (err) {
    showError(describeAuthError(err));
  } finally {
    setBusy(false);
  }
});

// Modal open/close triggers
$("#open-signin").addEventListener("click", () => openAuth("signin"));
$("#open-signup").addEventListener("click", () => openAuth("signup"));
$("#hero-signin").addEventListener("click", () => openAuth("signin"));
$("#hero-signup").addEventListener("click", () => openAuth("signup"));
$("#close-auth").addEventListener("click", closeAuth);
tabSignin.addEventListener("click", () => setMode("signin"));
tabSignup.addEventListener("click", () => setMode("signup"));
$$("[data-close-auth]").forEach((el) => el.addEventListener("click", closeAuth));
$$("[data-open-auth]").forEach((el) =>
  el.addEventListener("click", () => openAuth(el.dataset.openAuth || "signin")),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !authModal.hidden) closeAuth();
});

if (usingEmulator) {
  $("#auth-emulator-hint").hidden = false;
}

// ---------------------------------------------------------------------------
// Profile dropdown
// ---------------------------------------------------------------------------
const profileTrigger = $("#profile-trigger");
const profileMenu = $("#profile-menu");

function toggleProfileMenu(force) {
  const open = typeof force === "boolean" ? force : profileMenu.hidden;
  profileMenu.hidden = !open;
  profileTrigger.setAttribute("aria-expanded", open ? "true" : "false");
}

profileTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleProfileMenu();
});
document.addEventListener("click", (e) => {
  if (!profileMenu.hidden && !$("#profile").contains(e.target)) {
    toggleProfileMenu(false);
  }
});
$("#sign-out").addEventListener("click", async () => {
  toggleProfileMenu(false);
  await signOutUser();
});

// ---------------------------------------------------------------------------
// Render auth-dependent UI
// ---------------------------------------------------------------------------
function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function setAvatar(imgEl, fallbackEl, user) {
  if (user.photoURL) {
    imgEl.src = user.photoURL;
    imgEl.hidden = false;
    fallbackEl.hidden = true;
  } else {
    imgEl.hidden = true;
    fallbackEl.hidden = false;
    fallbackEl.textContent = initials(user.displayName);
  }
}

function renderSession() {
  const authed = isAuthed();

  // Toggle blocks that declare which auth state they belong to.
  $$('[data-auth-state="logged-out"]').forEach((el) => {
    el.hidden = authed;
  });
  $$('[data-auth-state="logged-in"]').forEach((el) => {
    el.hidden = !authed;
  });

  if (authed) {
    $("#profile-name").textContent = session.displayName;
    $("#profile-menu-name").textContent = session.displayName;
    $("#profile-menu-email").textContent = session.email || "";
    setAvatar($("#profile-avatar"), $("#profile-avatar-fallback"), session);
    setAvatar($("#profile-menu-avatar"), $("#profile-menu-avatar-fallback"), session);
    $$("[data-current-name]").forEach((el) => {
      el.textContent = session.displayName;
    });
  } else {
    toggleProfileMenu(false);
  }

  // Gate protected views.
  $$("[data-protected]").forEach((container) => {
    const locked = $("[data-locked]", container);
    const content = $("[data-protected-content]", container);
    if (locked) locked.hidden = authed;
    if (content) content.hidden = !authed;
  });

  // If signed out while on a protected view, bounce to home.
  if (!authed) {
    const current = location.hash.replace("#", "") || "home";
    if (current === "rooms" || current === "leagues") {
      location.hash = "#home";
    }
  }
}

// ---------------------------------------------------------------------------
// Simple hash router
// ---------------------------------------------------------------------------
const PROTECTED = new Set(["rooms", "leagues"]);

function showView() {
  let view = location.hash.replace("#", "") || "home";
  if (PROTECTED.has(view) && !isAuthed()) {
    openAuth("signin");
    view = "home";
    location.hash = "#home";
  }
  $$(".view").forEach((sec) => {
    sec.hidden = sec.id !== `view-${view}`;
  });
  $$(".nav__link").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${view}`);
  });
}

window.addEventListener("hashchange", showView);

// ---------------------------------------------------------------------------
// Protected demo content: in-memory rooms and leagues
// ---------------------------------------------------------------------------
const rooms = [];
const leagues = [];

function makeCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i += 1) s += a[Math.floor(Math.random() * a.length)];
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

function renderRooms() {
  const list = $("#rooms-list");
  list.innerHTML = "";
  if (rooms.length === 0) {
    list.innerHTML = `<p class="muted">No rooms yet. Create one to get an invite code.</p>`;
    return;
  }
  rooms.forEach((room) => {
    const el = document.createElement("article");
    el.className = "mini-card";
    el.innerHTML = `
      <span class="mini-card__title">${room.name}</span>
      <span class="mini-card__code">${room.code}</span>
      <span class="mini-card__meta">Host: ${room.host}</span>`;
    list.appendChild(el);
  });
}

function renderLeagues() {
  const list = $("#leagues-list");
  list.innerHTML = "";
  if (leagues.length === 0) {
    list.innerHTML = `<p class="muted">No leagues yet. Start one to track standings.</p>`;
    return;
  }
  leagues.forEach((league) => {
    const el = document.createElement("article");
    el.className = "mini-card";
    el.innerHTML = `
      <span class="mini-card__title">${league.name}</span>
      <span class="mini-card__meta">Season ${league.season} · ${league.members} members</span>`;
    list.appendChild(el);
  });
}

$("#create-room").addEventListener("click", () => {
  const n = rooms.length + 1;
  rooms.push({
    name: `${session ? session.displayName.split(" ")[0] : "Table"}'s Room ${n}`,
    code: makeCode(),
    host: session ? session.displayName : "You",
  });
  renderRooms();
});

$("#create-league").addEventListener("click", () => {
  const n = leagues.length + 1;
  leagues.push({ name: `Bayou League ${n}`, season: 1, members: 1 });
  renderLeagues();
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
renderRooms();
renderLeagues();
showView();

onAuthChange((user) => {
  session = user;
  renderSession();
  showView();
});

// In case auth resolves synchronously from cache.
session = currentUser();
renderSession();
