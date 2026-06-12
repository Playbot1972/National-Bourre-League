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
import {
  ensureUserDoc,
  createRoom,
  joinRoomByCode,
  subscribeMyRooms,
  subscribeRoom,
  subscribeRoomMembers,
  subscribeSessions,
  subscribeScores,
  createSession,
  updateScore,
  updateSessionNotes,
  finalizeSession,
} from "./firestore.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------
let session = null; // NormalizedUser | null

function isAuthed() {
  return session !== null;
}

// Apply a session and re-render. Used both by the auth-state listener and
// directly after sign-up (where updateProfile sets the display name but does
// not re-trigger onAuthStateChanged).
function setSession(user) {
  session = user;
  renderSession();
  showView();
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
      const user = await signUpWithEmail({ name, email, password });
      setSession(user);
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
// Helpers
// ---------------------------------------------------------------------------
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
}

// ---------------------------------------------------------------------------
// Private Rooms — persisted in Firestore
// ---------------------------------------------------------------------------
const roomsListView = $("#rooms-list-view");
const roomDetailView = $("#room-detail-view");
const roomsError = $("#rooms-error");

// Subscriptions we must tear down on auth/room changes.
let myRoomsUnsub = null;
const detailUnsubs = [];
let scoresUnsub = null;

let myRooms = [];
let currentRoomId = null;
let currentRoom = null;
let currentMembers = [];
let currentSessions = [];
let openSessionId = null;
let openScores = [];

function showRoomsError(msg) {
  roomsError.textContent = msg;
  roomsError.hidden = !msg;
}

function clearDetailSubs() {
  while (detailUnsubs.length) detailUnsubs.pop()();
  if (scoresUnsub) {
    scoresUnsub();
    scoresUnsub = null;
  }
}

function startRoomsSubscription() {
  stopRoomsSubscription();
  if (!session) return;
  ensureUserDoc(session).catch((e) => console.warn("ensureUserDoc:", e));
  myRoomsUnsub = subscribeMyRooms(session.uid, (rooms) => {
    myRooms = rooms;
    if (!currentRoomId) renderRoomsList();
  });
}

function stopRoomsSubscription() {
  if (myRoomsUnsub) {
    myRoomsUnsub();
    myRoomsUnsub = null;
  }
  clearDetailSubs();
  myRooms = [];
  currentRoomId = null;
  openSessionId = null;
}

function renderRoomsList() {
  roomDetailView.hidden = true;
  roomsListView.hidden = false;
  const list = $("#rooms-list");
  if (myRooms.length === 0) {
    list.innerHTML = `<p class="muted">No rooms yet. Create one to get an invite code.</p>`;
    return;
  }
  list.innerHTML = myRooms
    .map(
      (room) => `
      <article class="mini-card mini-card--button" data-open-room="${room.id}" role="button" tabindex="0">
        <span class="mini-card__title">${escapeHtml(room.name)}</span>
        <span class="mini-card__code">${escapeHtml(room.inviteCode)}</span>
        <span class="mini-card__meta">${escapeHtml(room.role || "player")} · ${escapeHtml(room.status)}</span>
      </article>`,
    )
    .join("");
}

$("#create-room").addEventListener("click", async () => {
  if (!session) return;
  showRoomsError("");
  try {
    const roomId = await createRoom({ owner: session, name: "" });
    openRoom(roomId);
  } catch (err) {
    console.error(err);
    showRoomsError("Could not create the room. Please try again.");
  }
});

$("#join-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!session) return;
  showRoomsError("");
  const code = $("#join-code").value.trim();
  if (!code) return;
  try {
    const roomId = await joinRoomByCode(code, session);
    if (!roomId) {
      showRoomsError("No room found with that invite code.");
      return;
    }
    $("#join-code").value = "";
    openRoom(roomId);
  } catch (err) {
    console.error(err);
    showRoomsError("Could not join that room. Please try again.");
  }
});

// Open a room (event delegation on the list).
$("#rooms-list").addEventListener("click", (e) => {
  const card = e.target.closest("[data-open-room]");
  if (card) openRoom(card.dataset.openRoom);
});
$("#rooms-list").addEventListener("keydown", (e) => {
  const card = e.target.closest("[data-open-room]");
  if (card && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openRoom(card.dataset.openRoom);
  }
});

function openRoom(roomId) {
  clearDetailSubs();
  currentRoomId = roomId;
  currentRoom = null;
  currentMembers = [];
  currentSessions = [];
  openSessionId = null;
  openScores = [];

  roomsListView.hidden = true;
  roomDetailView.hidden = false;
  roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;

  detailUnsubs.push(
    subscribeRoom(roomId, (room) => {
      currentRoom = room;
      renderRoomDetail();
    }),
  );
  detailUnsubs.push(
    subscribeRoomMembers(roomId, (members) => {
      currentMembers = members;
      renderRoomDetail();
    }),
  );
  detailUnsubs.push(
    subscribeSessions(roomId, (sessions) => {
      currentSessions = sessions;
      if (!openSessionId && sessions.length > 0) {
        openSession(sessions[0].id);
      } else {
        renderRoomDetail();
      }
    }),
  );
}

function closeRoom() {
  clearDetailSubs();
  currentRoomId = null;
  openSessionId = null;
  renderRoomsList();
}

function openSession(sessionId) {
  if (scoresUnsub) scoresUnsub();
  openSessionId = sessionId;
  scoresUnsub = subscribeScores(sessionId, (scores) => {
    openScores = scores;
    renderRoomDetail();
  });
}

function renderRoomDetail() {
  if (!currentRoomId || roomDetailView.hidden) return;
  if (!currentRoom) {
    roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;
    return;
  }
  const hr = currentRoom.houseRules || {};
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);

  roomDetailView.innerHTML = `
    <button class="link-back" id="back-to-rooms">← All rooms</button>
    <div class="room-detail__head">
      <div>
        <h3 class="room-detail__title">${escapeHtml(currentRoom.name)}</h3>
        <span class="badge badge--${escapeHtml(currentRoom.status)}">${escapeHtml(currentRoom.status)}</span>
      </div>
      <div class="room-detail__code">
        <span class="muted">Invite code</span>
        <strong>${escapeHtml(currentRoom.inviteCode)}</strong>
      </div>
    </div>

    <div class="room-detail__grid">
      <section class="subpanel">
        <h4>House rules</h4>
        <ul class="kv">
          <li><span>Ante</span><span>${escapeHtml(hr.ante || "—")}</span></li>
          <li><span>Forced play</span><span>${escapeHtml(hr.forcedPlay || "—")}</span></li>
          <li><span>Ties</span><span>${escapeHtml(hr.ties || "—")}</span></li>
          <li><span>Dealing</span><span>${escapeHtml(hr.dealing || "—")}</span></li>
        </ul>
      </section>

      <section class="subpanel">
        <h4>Members (${currentMembers.length})</h4>
        <ul class="members">
          ${currentMembers
            .map(
              (m) =>
                `<li><span class="dot"></span>${escapeHtml(m.displayName)} <em>${escapeHtml(m.role)}</em></li>`,
            )
            .join("")}
        </ul>
      </section>
    </div>

    <section class="subpanel">
      <div class="subpanel__head">
        <h4>Sessions</h4>
        <button class="btn btn--primary btn--sm" id="new-session">+ New session</button>
      </div>
      <div class="session-tabs">
        ${currentSessions
          .map(
            (s, i) =>
              `<button class="session-tab ${s.id === openSessionId ? "is-active" : ""}" data-open-session="${s.id}">
                 Session ${currentSessions.length - i} · ${s.totals?.tricks ?? 0} tricks
               </button>`,
          )
          .join("") || `<p class="muted">No sessions yet. Start one to keep score.</p>`}
      </div>
      ${openSessionObj ? renderSessionPanel(openSessionObj) : ""}
    </section>`;

  // Wire detail controls
  $("#back-to-rooms").addEventListener("click", closeRoom);
  $("#new-session").addEventListener("click", onNewSession);
  $$("[data-open-session]", roomDetailView).forEach((btn) =>
    btn.addEventListener("click", () => openSession(btn.dataset.openSession)),
  );
  wireSessionControls();
}

function renderSessionPanel(s) {
  const rows = openScores
    .map(
      (sc) => `
      <tr data-player="${escapeHtml(sc.playerId)}">
        <td>${escapeHtml(sc.displayName)}</td>
        <td>
          <div class="stepper">
            <button class="room__step" data-score-step="-1" aria-label="Decrease tricks">−</button>
            <input class="num-input" type="number" min="0" value="${sc.tricksWon}" data-score-input aria-label="${escapeHtml(sc.displayName)} tricks won" />
            <button class="room__step" data-score-step="1" aria-label="Increase tricks">+</button>
          </div>
        </td>
        <td>
          <select class="num-select" data-risk-select aria-label="${escapeHtml(sc.displayName)} risk points">
            ${[0, 1, 2, 3, 4, 5]
              .map((n) => `<option value="${n}" ${n === sc.riskPoints ? "selected" : ""}>${n} pt${n === 1 ? "" : "s"}</option>`)
              .join("")}
          </select>
        </td>
        <td class="num">${sc.total}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="session">
      <table class="score-table">
        <thead>
          <tr><th>Player</th><th>Tricks won</th><th>Risk points</th><th class="num">Total</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="3">Total tricks</td><td class="num">${s.totals?.tricks ?? 0}</td></tr>
        </tfoot>
      </table>

      <label class="notes-label" for="session-notes">Side notes only — no money movement</label>
      <textarea id="session-notes" class="notes-field" rows="3"
        placeholder="Seating, house-rule tweaks, reminders. Not a ledger.">${escapeHtml(s.notes || "")}</textarea>
      <p class="muted small">Informational only. This app never tracks or moves money.</p>
    </div>`;
}

async function onNewSession() {
  if (!currentRoomId) return;
  const players = currentMembers.map((m) => ({
    playerId: m.userId,
    displayName: m.displayName,
  }));
  if (players.length === 0 && session) {
    players.push({ playerId: session.uid, displayName: session.displayName });
  }
  try {
    const sid = await createSession(currentRoomId, players);
    openSession(sid);
  } catch (err) {
    console.error("createSession:", err);
  }
}

function wireSessionControls() {
  if (!openSessionId) return;

  $$("tr[data-player]", roomDetailView).forEach((row) => {
    const playerId = row.dataset.player;
    const input = $("[data-score-input]", row);
    const riskSelect = $("[data-risk-select]", row);

    $$("[data-score-step]", row).forEach((btn) =>
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.scoreStep);
        const next = Math.max(0, (parseInt(input.value, 10) || 0) + delta);
        updateScore(openSessionId, playerId, { tricksWon: next }).catch((e) =>
          console.error("updateScore:", e),
        );
      }),
    );
    input.addEventListener("change", () => {
      const next = Math.max(0, parseInt(input.value, 10) || 0);
      updateScore(openSessionId, playerId, { tricksWon: next }).catch((e) =>
        console.error("updateScore:", e),
      );
    });
    riskSelect.addEventListener("change", () => {
      updateScore(openSessionId, playerId, {
        riskPoints: parseInt(riskSelect.value, 10),
      }).catch((e) => console.error("updateScore:", e));
    });
  });

  const notes = $("#session-notes", roomDetailView);
  if (notes) {
    let t = null;
    notes.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        updateSessionNotes(openSessionId, notes.value).catch((e) =>
          console.error("updateSessionNotes:", e),
        );
      }, 500);
    });
  }
}

// ---------------------------------------------------------------------------
// Leagues (in-memory placeholder)
// ---------------------------------------------------------------------------
const leagues = [];

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
      <span class="mini-card__title">${escapeHtml(league.name)}</span>
      <span class="mini-card__meta">Season ${league.season} · ${league.members} members</span>`;
    list.appendChild(el);
  });
}

$("#create-league").addEventListener("click", () => {
  const n = leagues.length + 1;
  leagues.push({ name: `Bayou League ${n}`, season: 1, members: 1 });
  renderLeagues();
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
renderRoomsList();
renderLeagues();
showView();

onAuthChange((user) => {
  const wasAuthed = isAuthed();
  setSession(user);
  if (user) {
    startRoomsSubscription();
  } else if (wasAuthed) {
    stopRoomsSubscription();
    renderRoomsList();
  }
});

// In case auth resolves synchronously from cache.
setSession(currentUser());
if (session) startRoomsSubscription();
