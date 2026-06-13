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
  ensurePlayerDoc,
  createRoom,
  joinRoomByCode,
  leaveRoom,
  deleteRoom,
  ensureInviteLookupForRoom,
  subscribeMyRooms,
  subscribeRoom,
  subscribeRoomMembers,
  subscribeSessions,
  subscribeScores,
  createSession,
  updateSessionNotes,
  updateSessionHandStake,
  updateHandTrick,
  recordHand,
  voteCoWinSettlement,
  addSessionPlayer,
  syncSessionWithRoomMembers,
  setHandParticipation,
  ensureCurrentHandParticipants,
  subscribeHands,
  sortScoresForDisplay,
  getPlayers,
  applyRankingResults,
  subscribeLeaderboard,
  BOURRE_TRICKS_TO_WIN,
  MAX_TRICKS_PER_HAND,
} from "./firestore.js";
import { rankMatch, apeClass, apeStatus, newRating } from "./ranking.js";
import { APP_VERSION } from "./version.js";
import {
  RISK_STAKE_OPTIONS,
  riskStakeOptionsFor,
  formatRiskStake,
  formatNet,
} from "./risk-stakes.js";

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
      // Ensure the ranking doc carries the chosen display name (the auth-state
      // listener may have created it with the email-prefix fallback first).
      ensurePlayerDoc(user.uid, user.displayName).catch((e) =>
        console.warn("ensurePlayerDoc:", e),
      );
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
const PROTECTED = new Set(["rooms", "leaderboard", "leagues"]);

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

function normalizeInviteCodeDisplay(code) {
  let c = code.trim().toUpperCase().replace(/\s+/g, "");
  if (/^[A-Z0-9]{6}$/.test(c)) c = `${c.slice(0, 3)}-${c.slice(3)}`;
  return c;
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
let handsUnsub = null;

let myRooms = [];
let currentRoomId = null;
let currentRoom = null;
let currentMembers = [];
let currentSessions = [];
let openSessionId = null;
let openScores = [];
let openHands = [];
let pendingHandStake = 1;
let syncMembersPromise = null;

function mergeScoresWithMembers(scores, members) {
  const map = new Map(scores.map((s) => [s.playerId, s]));
  for (const m of members) {
    if (!m.userId || map.has(m.userId)) continue;
    map.set(m.userId, {
      playerId: m.userId,
      displayName: m.displayName,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }
  return [...map.values()];
}

function scheduleSyncSessionMembers() {
  if (!currentRoomId || !openSessionId || currentMembers.length === 0) return;
  const sObj = currentSessions.find((s) => s.id === openSessionId);
  if (!sObj || sObj.status === "final") return;
  if (syncMembersPromise) return;
  syncMembersPromise = syncSessionWithRoomMembers(
    currentRoomId,
    openSessionId,
    currentMembers,
  )
    .then(() => ensureCurrentHandParticipants(currentRoomId, openSessionId))
    .catch((e) => console.error("syncSessionWithRoomMembers:", e))
    .finally(() => {
      syncMembersPromise = null;
    });
}

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
  if (handsUnsub) {
    handsUnsub();
    handsUnsub = null;
  }
}

function startRoomsSubscription() {
  stopRoomsSubscription();
  if (!session) return;
  ensureUserDoc(session).catch((e) => console.warn("ensureUserDoc:", e));
  // Ensure the signed-in user has a ranking doc so they appear on the leaderboard.
  ensurePlayerDoc(session.uid, session.displayName).catch((e) =>
    console.warn("ensurePlayerDoc:", e),
  );
  myRoomsUnsub = subscribeMyRooms(session.uid, (rooms) => {
    myRooms = rooms;
    for (const r of rooms) {
      if (r.ownerId === session.uid && r.role === "owner") {
        ensureInviteLookupForRoom(r.id).catch((e) =>
          console.warn("ensureInviteLookupForRoom:", e),
        );
      }
    }
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

function isRoomOwner(room, uid) {
  return room.role === "owner" && room.ownerId === uid;
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
    .map((room) => {
      const isOwner = session && isRoomOwner(room, session.uid);
      const actionLabel = isOwner ? "Delete" : "Leave";
      const actionAttr = isOwner ? "data-delete-room" : "data-leave-room";
      return `
      <article class="mini-card mini-card--with-action">
        <div class="mini-card__main mini-card--button" data-open-room="${room.id}" role="button" tabindex="0">
          <span class="mini-card__title">${escapeHtml(room.name)}</span>
          <span class="mini-card__code">${escapeHtml(room.inviteCode)}</span>
          <span class="mini-card__meta">${escapeHtml(room.role || "player")} · ${escapeHtml(room.status)}</span>
        </div>
        <button type="button" class="btn btn--sm btn--danger mini-card__action" ${actionAttr}="${room.id}">${actionLabel}</button>
      </article>`;
    })
    .join("");
}

async function onLeaveRoom(roomId) {
  if (!session) return;
  if (!window.confirm("Leave this room? It will disappear from your list.")) return;
  showRoomsError("");
  try {
    await leaveRoom(roomId, session);
    if (currentRoomId === roomId) closeRoom();
  } catch (err) {
    console.error(err);
    showRoomsError("Could not leave the room. Please try again.");
  }
}

async function onDeleteRoom(roomId) {
  if (!session) return;
  if (
    !window.confirm(
      "Delete this room for everyone? Sessions and scores will no longer be accessible.",
    )
  ) {
    return;
  }
  showRoomsError("");
  try {
    await deleteRoom(roomId, session);
    if (currentRoomId === roomId) closeRoom();
  } catch (err) {
    console.error(err);
    const msg = err?.message || "";
    if (/only the room owner/i.test(msg)) {
      showRoomsError("You can’t delete this room — use Leave instead.");
    } else if (err?.code === "permission-denied") {
      showRoomsError("You can’t delete this room — use Leave instead.");
    } else {
      showRoomsError(msg.slice(0, 120) || "Could not delete the room. Please try again.");
    }
  }
}

$("#create-room").addEventListener("click", async () => {
  if (!session) return;
  showRoomsError("");
  try {
    const roomId = await createRoom({ owner: session, name: "" });
    await ensureInviteLookupForRoom(roomId);
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
      showRoomsError(
        `No room found for code "${normalizeInviteCodeDisplay(code)}". Ask the host to open Private Rooms on their phone (wait a few seconds), then try again.`,
      );
      return;
    }
    $("#join-code").value = "";
    openRoom(roomId);
  } catch (err) {
    console.error("joinRoomByCode:", err);
    const fbCode = err && typeof err === "object" ? err.code : "";
    const msg = err && typeof err === "object" ? err.message : String(err);
    if (fbCode === "permission-denied") {
      showRoomsError(
        "Join blocked by Firestore rules. Deploy firestore:rules, then create a new room.",
      );
    } else if (/offline|network/i.test(msg)) {
      showRoomsError("Network error — check connection and try again.");
    } else {
      showRoomsError(`Could not join (${fbCode || "error"}). ${msg}`.slice(0, 160));
    }
  }
});

// Open a room (event delegation on the list).
$("#rooms-list").addEventListener("click", (e) => {
  if (e.target.closest("[data-delete-room]")) {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRoom(e.target.closest("[data-delete-room]").dataset.deleteRoom);
    return;
  }
  if (e.target.closest("[data-leave-room]")) {
    e.preventDefault();
    e.stopPropagation();
    onLeaveRoom(e.target.closest("[data-leave-room]").dataset.leaveRoom);
    return;
  }
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
      if (room && session?.uid === room.ownerId) {
        ensureInviteLookupForRoom(roomId).catch((e) =>
          console.error("ensureInviteLookupForRoom:", e),
        );
      }
      renderRoomDetail();
    }),
  );
  detailUnsubs.push(
    subscribeRoomMembers(roomId, (members) => {
      currentMembers = members;
      scheduleSyncSessionMembers();
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
  if (handsUnsub) handsUnsub();
  openSessionId = sessionId;
  openScores = [];
  openHands = [];
  scoresUnsub = subscribeScores(currentRoomId, sessionId, (scores) => {
    openScores = scores;
    scheduleSyncSessionMembers();
    renderRoomDetail();
  });
  handsUnsub = subscribeHands(currentRoomId, sessionId, (hands) => {
    openHands = hands;
    renderRoomDetail();
  });
}

function renderRoomDetail() {
  if (!currentRoomId || roomDetailView.hidden) return;
  if (!currentRoom) {
    roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;
    return;
  }

  // Preserve in-progress form state across snapshot re-renders.
  const activeNotes = document.activeElement;
  const editingNotes =
    activeNotes && activeNotes.id === "session-notes"
      ? {
          value: activeNotes.value,
          start: activeNotes.selectionStart,
          end: activeNotes.selectionEnd,
        }
      : null;
  const recordHandState = (() => {
    if (!$("#record-hand", roomDetailView)) return null;
    return {
      participantIds: $$("[data-hand-participant]:checked", roomDetailView).map((cb) => cb.value),
      winnerIds: $$("[data-hand-winner]:checked", roomDetailView).map((cb) => cb.value),
    };
  })();
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
      ${
        session?.uid === currentRoom.ownerId
          ? `<button type="button" class="btn btn--sm btn--danger" id="delete-room">Delete room</button>`
          : `<button type="button" class="btn btn--sm btn--danger" id="leave-room">Leave room</button>`
      }
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
        <div class="session-new">
          ${
            session?.uid === currentRoom.ownerId
              ? `<label class="session-new__stake">
                   <span class="muted">Hand stake</span>
                   <select class="num-select" id="new-session-stake" aria-label="Hand stake for new session">
                     ${RISK_STAKE_OPTIONS.map(
                       (n) =>
                         `<option value="${n}" ${n === pendingHandStake ? "selected" : ""}>${formatRiskStake(n)}</option>`,
                     ).join("")}
                   </select>
                 </label>`
              : ""
          }
          <button class="btn btn--primary btn--sm" id="new-session">+ New session</button>
        </div>
      </div>
      <div class="session-tabs">
        ${currentSessions
          .map(
            (s, i) =>
              `<button class="session-tab ${s.id === openSessionId ? "is-active" : ""}" data-open-session="${s.id}">
                 Session ${currentSessions.length - i} · ${s.handCount ?? 0} hands
               </button>`,
          )
          .join("") || `<p class="muted">No sessions yet. Start one to keep score.</p>`}
      </div>
      ${openSessionObj ? renderSessionPanel(openSessionObj) : ""}
    </section>`;

  // Wire detail controls
  $("#back-to-rooms").addEventListener("click", closeRoom);
  const deleteRoomBtn = $("#delete-room", roomDetailView);
  if (deleteRoomBtn) {
    deleteRoomBtn.addEventListener("click", () => onDeleteRoom(currentRoomId));
  }
  const leaveRoomBtn = $("#leave-room", roomDetailView);
  if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener("click", () => onLeaveRoom(currentRoomId));
  }
  $("#new-session").addEventListener("click", onNewSession);
  const newSessionStake = $("#new-session-stake", roomDetailView);
  if (newSessionStake) {
    newSessionStake.addEventListener("change", () => {
      pendingHandStake = parseInt(newSessionStake.value, 10) || 1;
    });
  }
  $$("[data-open-session]", roomDetailView).forEach((btn) =>
    btn.addEventListener("click", () => openSession(btn.dataset.openSession)),
  );
  wireSessionControls();

  // Restore in-progress form state (see capture above).
  if (recordHandState) {
    $$("[data-hand-participant]", roomDetailView).forEach((cb) => {
      cb.checked = recordHandState.participantIds.includes(cb.value);
    });
    $$("[data-hand-winner]", roomDetailView).forEach((cb) => {
      cb.checked = recordHandState.winnerIds.includes(cb.value);
    });
  } else if (openSessionObj?.pendingCoWinSettlement) {
    const pending = openSessionObj.pendingCoWinSettlement;
    $$("[data-hand-participant]", roomDetailView).forEach((cb) => {
      cb.checked = pending.participantIds?.includes(cb.value) ?? cb.checked;
    });
    $$("[data-hand-winner]", roomDetailView).forEach((cb) => {
      cb.checked = pending.winnerIds?.includes(cb.value) ?? cb.checked;
    });
  }
  if ($("#record-hand", roomDetailView)) {
    updateHandPotPreview();
    updateCoWinnerUI();
  }
  if (editingNotes) {
    const notesEl = $("#session-notes", roomDetailView);
    if (notesEl) {
      notesEl.value = editingNotes.value;
      notesEl.focus();
      try {
        notesEl.setSelectionRange(editingNotes.start, editingNotes.end);
      } catch {
        /* ignore caret restore errors */
      }
    }
  }
}

function renderSessionPanel(s) {
  const isFinal = s.status === "final";
  const disabled = isFinal ? "disabled" : "";
  const isOwner = session?.uid === currentRoom?.ownerId;
  const handStake = s.handStake ?? 1;
  const stakeLocked = Boolean(s.handStakeLocked);
  const handCount = s.handCount ?? 0;
  const nextHand = handCount + 1;
  const carryOverPot = s.carryOverPot ?? 0;
  const tricksThisHand = s.currentHand?.tricksByPlayer || {};
  const mergedScores = mergeScoresWithMembers(openScores, currentMembers);
  const playerOrder = currentMembers.map((m) => ({ playerId: m.userId }));
  const displayScores = sortScoresForDisplay(mergedScores, playerOrder.length ? playerOrder : s.players || []);
  const handParticipantIds = s.currentHand?.participantIds;
  const isInCurrentHand = (playerId) =>
    Array.isArray(handParticipantIds) && handParticipantIds.includes(playerId);
  const checkedParticipantCount = displayScores.filter((sc) => isInCurrentHand(sc.playerId)).length;
  const netTotal = displayScores.reduce((sum, sc) => sum + (Number(sc.net) || 0), 0);
  const netTotalClass = netTotal === 0 ? "" : " net-imbalance";

  const myUid = session?.uid ?? null;

  const rows = displayScores
    .map((sc) => {
      const net = sc.net ?? 0;
      const netClass = net > 0 ? "net-up" : net < 0 ? "net-down" : "";
      const handTricks = tricksThisHand[sc.playerId] ?? 0;
      const playerStake = sc.perHandStake ?? handStake;
      const inHand = isInCurrentHand(sc.playerId);
      const isSelf = sc.playerId === myUid;
      const canEditTricks = !isFinal && inHand && isSelf;
      const trickDisabled = canEditTricks ? "" : "disabled";
      const stakeNote =
        playerStake !== handStake
          ? ` <span class="muted small">(${formatRiskStake(playerStake)} ante)</span>`
          : "";
      const tricksCell = canEditTricks
        ? `<div class="stepper">
            <button class="room__step" data-hand-trick-step="-1" aria-label="Decrease ${escapeHtml(sc.displayName)} tricks this hand" ${trickDisabled}>−</button>
            <input class="num-input" type="number" min="0" max="${MAX_TRICKS_PER_HAND}" value="${handTricks}" data-hand-trick-input aria-label="${escapeHtml(sc.displayName)} tricks this hand" readonly />
            <button class="room__step" data-hand-trick-step="1" aria-label="Increase ${escapeHtml(sc.displayName)} tricks this hand" ${trickDisabled}>+</button>
          </div>`
        : `<span class="num muted">${inHand ? handTricks : "—"}</span>`;
      return `
      <tr data-player-id="${escapeHtml(sc.playerId)}">
        <td>${escapeHtml(sc.displayName)}${stakeNote}</td>
        <td class="num">${sc.handsWon ?? 0}</td>
        <td>${tricksCell}</td>
        <td class="num ${netClass}">${escapeHtml(formatNet(net))}</td>
      </tr>`;
    })
    .join("");

  const stakeControl = stakeLocked
    ? `<div class="session-stake">
         <span class="session-stake__label">Hand stake</span>
         <strong>${escapeHtml(formatRiskStake(handStake))}</strong>
         <span class="badge badge--closed">Locked</span>
         ${carryOverPot > 0 ? `<span class="badge">Carry-over ${escapeHtml(formatRiskStake(carryOverPot))}</span>` : ""}
         <p class="muted small">Set by host · applies to every hand this session.</p>
       </div>`
    : isOwner
      ? `<div class="session-stake">
           <label class="session-stake__label" for="session-hand-stake">Hand stake (per hand)</label>
           <select class="num-select" id="session-hand-stake" aria-label="Hand stake for this session">
             ${riskStakeOptionsFor(handStake)
               .map(
                 (n) =>
                   `<option value="${n}" ${n === handStake ? "selected" : ""}>${formatRiskStake(n)}</option>`,
               )
               .join("")}
           </select>
           <p class="muted small">Host sets the stake for this session. Locks after the first hand.</p>
         </div>`
      : `<div class="session-stake">
           <span class="session-stake__label">Hand stake</span>
           <strong>${escapeHtml(formatRiskStake(handStake))}</strong>
           <p class="muted small">Host set · locks after the first hand.</p>
         </div>`;

  const participantOptions = displayScores
    .map((sc) => {
      const isSelf = sc.playerId === myUid;
      const canToggle = isSelf && !isFinal;
      return `<label class="hand-participant${canToggle ? "" : " hand-participant--readonly"}">
           <input type="checkbox" data-hand-participant value="${escapeHtml(sc.playerId)}" ${isInCurrentHand(sc.playerId) ? "checked" : ""} ${canToggle ? "" : "disabled"} />
           ${escapeHtml(sc.displayName)}
         </label>`;
    })
    .join("");

  const winnerOptions = displayScores
    .filter((sc) => isInCurrentHand(sc.playerId))
    .map(
      (sc) =>
        `<label class="hand-participant">
           <input type="checkbox" data-hand-winner value="${escapeHtml(sc.playerId)}" />
           ${escapeHtml(sc.displayName)}
         </label>`,
    )
    .join("");

  const recordHandBlock =
    isFinal || displayScores.length < 2
      ? ""
      : `<div class="record-hand">
           <h5>Record hand #${nextHand}</h5>
           <p class="muted small">Check <strong>In this hand</strong> for yourself only. Tricks can only be added when you are in the hand. Winner takes the pot; co-winners choose push or split. Or tap + until ${BOURRE_TRICKS_TO_WIN} tricks.</p>
           <fieldset class="record-hand__participants">
             <legend>In this hand (check yourself only)</legend>
             ${participantOptions}
           </fieldset>
           <fieldset class="record-hand__participants">
             <legend>Winner(s)</legend>
             ${winnerOptions || `<span class="muted">Check who played first.</span>`}
           </fieldset>
           <p class="record-hand__pot muted small" id="hand-pot-preview">Pot this hand: ${formatRiskStake(handStake * checkedParticipantCount)}</p>
           <button class="btn btn--primary btn--sm" type="button" id="record-hand">Record hand</button>
           <div class="settlement-actions" id="co-winner-settlement" hidden>
             <p class="muted small">Co-winners vote: <strong>one Decline</strong> ends split (pot pushes, non-winners ante up). <strong>All</strong> must tap Agree to split.</p>
             <div class="settlement-actions__btns">
               <button class="btn btn--sm" type="button" id="settle-push">Decline split</button>
               <button class="btn btn--sm" type="button" id="settle-split">Agree to split</button>
             </div>
             <p class="muted small" id="settlement-hint">Only signed-in co-winners can vote.</p>
             <p class="muted small" id="settlement-votes"></p>
           </div>
         </div>`;

  const handHistory =
    openHands.length === 0
      ? ""
      : `<div class="hand-history">
           <h5>Hand history</h5>
           <ul>
             ${openHands
               .slice(0, 12)
               .map((h) => `<li>${escapeHtml(formatHandHistoryLine(h, openScores))}</li>`)
               .join("")}
           </ul>
         </div>`;

  const resultsBlock =
    isFinal && Array.isArray(s.results)
      ? `<div class="session-results">
           <h5>Ape Score results</h5>
           <ul>
             ${[...s.results]
               .sort((a, b) => a.placement - b.placement)
               .map(
                 (r) =>
                   `<li><span class="place">#${r.placement}</span> ${escapeHtml(r.displayName)}
                      → Ape Score <strong>${r.apeScore}</strong>
                      <span class="momentum ${r.momentum >= 0 ? "up" : "down"}">${r.momentum >= 0 ? "▲" : "▼"} ${Math.abs(r.momentum)}</span></li>`,
               )
               .join("")}
           </ul>
         </div>`
      : "";

  const controls = isFinal
    ? `<span class="badge badge--closed">Session final</span>`
    : `<form class="add-player-form" id="add-player-form">
         <input class="text-input" id="add-player-name" placeholder="Add a player (e.g. Thibodeaux)" aria-label="Add player name" />
         <button class="btn btn--sm" type="submit">Add player</button>
       </form>
       <button class="btn btn--primary btn--sm" id="complete-session">Complete session &amp; update Ape Scores</button>`;

  return `
    <div class="session">
      ${stakeControl}
      ${recordHandBlock}
      <table class="score-table">
        <thead>
          <tr><th>Player</th><th class="num">Hands won</th><th>Tricks this hand</th><th class="num">Net</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="3" class="num"><strong>Session total</strong></td><td class="num ${netTotalClass}"><strong>${escapeHtml(formatNet(netTotal))}</strong></td></tr>
          <tr><td colspan="4" class="muted small">${handCount} hand${handCount === 1 ? "" : "s"} played · ${BOURRE_TRICKS_TO_WIN} tricks wins the hand (of ${MAX_TRICKS_PER_HAND}) · session total should always be ${formatRiskStake(0)}</td></tr>
        </tfoot>
      </table>
      ${handHistory}
      <div class="session-controls">${controls}</div>
      ${resultsBlock}

      <label class="notes-label" for="session-notes">Side notes only — no money movement</label>
      <textarea id="session-notes" class="notes-field" rows="3" ${disabled}
        placeholder="Seating, house-rule tweaks, reminders. Not a ledger.">${escapeHtml(s.notes || "")}</textarea>
      <p class="muted small">Informational ledger only. This app never tracks or moves money.</p>
    </div>`;
}

function formatHandHistoryLine(h, scores) {
  const winnerIds = h.winnerIds?.length
    ? h.winnerIds
    : h.winnerId
      ? [h.winnerId]
      : [];
  const names = winnerIds.map(
    (id) => scores.find((sc) => sc.playerId === id)?.displayName || id,
  );
  const pot = formatRiskStake(h.pot ?? 0);
  const n = h.participantIds?.length ?? 0;
  if (h.settlement === "push") {
    return `#${h.handNumber} Push — ${pot} carries over (${n} players)`;
  }
  if (h.settlement === "non_winner_ante_up" || h.settlement === "ante_up") {
    return `#${h.handNumber} No split agreement — ${pot} pushed, non-winners ante up (${n} players)`;
  }
  if (h.settlement === "split") {
    return `#${h.handNumber} ${names.join(" & ")} split ${pot} (${n} players)`;
  }
  return `#${h.handNumber} ${names[0] || "Unknown"} won ${pot} (${n} players)`;
}

function getHandFormSelection() {
  const participantIds = $$("[data-hand-participant]:checked", roomDetailView).map(
    (cb) => cb.value,
  );
  const winnerIds = $$("[data-hand-winner]:checked", roomDetailView)
    .map((cb) => cb.value)
    .filter((id) => participantIds.includes(id));
  return { participantIds, winnerIds };
}

function renderSettlementVoteStatus(s, displayScores) {
  const pending = s?.pendingCoWinSettlement;
  if (!pending?.winnerIds?.length) return "";
  return pending.winnerIds
    .map((wid) => {
      const name = displayScores.find((sc) => sc.playerId === wid)?.displayName || wid;
      const vote = pending.votes?.[wid];
      if (vote === "split") return `${name}: Agree ✓`;
      if (vote === "push") return `${name}: Decline ✓`;
      return `${name}: waiting…`;
    })
    .join(" · ");
}

function updateCoWinnerUI() {
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  const { participantIds, winnerIds } = getHandFormSelection();
  const recordBtn = $("#record-hand", roomDetailView);
  const settlement = $("#co-winner-settlement", roomDetailView);
  const pushBtn = $("#settle-push", roomDetailView);
  const splitBtn = $("#settle-split", roomDetailView);
  const hint = $("#settlement-hint", roomDetailView);
  const votesEl = $("#settlement-votes", roomDetailView);
  if (!recordBtn) return;

  if (votesEl && openSessionObj) {
    const status = renderSettlementVoteStatus(openSessionObj, mergeScoresWithMembers(openScores, currentMembers));
    votesEl.textContent = status;
  }

  if (winnerIds.length >= 2) {
    recordBtn.hidden = true;
    if (settlement) settlement.hidden = false;
    const isCoWinner = session && winnerIds.includes(session.uid);
    if (pushBtn) pushBtn.disabled = !isCoWinner;
    if (splitBtn) splitBtn.disabled = !isCoWinner;
    if (hint) {
      hint.textContent = isCoWinner
        ? "Tap Agree to split or Decline split — split only if all co-winners agree."
        : "Waiting for co-winners to vote.";
    }
  } else {
    recordBtn.hidden = false;
    if (settlement) settlement.hidden = true;
    recordBtn.disabled = winnerIds.length !== 1 || participantIds.length < 2;
  }
}

function updateHandPotPreview() {
  const preview = $("#hand-pot-preview", roomDetailView);
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  if (!preview || !openSessionObj) return;
  const sessionStake = openSessionObj.handStake ?? 1;
  const carry = openSessionObj.carryOverPot ?? 0;
  const merged = mergeScoresWithMembers(openScores, currentMembers);
  const checked = $$("[data-hand-participant]:checked", roomDetailView);
  const ante = checked.reduce((sum, cb) => {
    const sc = merged.find((s) => s.playerId === cb.value);
    return sum + (sc?.perHandStake ?? sessionStake);
  }, 0);
  preview.textContent =
    carry > 0
      ? `Pot this hand: ${formatRiskStake(ante)} + ${formatRiskStake(carry)} carry = ${formatRiskStake(ante + carry)}`
      : `Pot this hand: ${formatRiskStake(ante)}`;
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
  const stakeEl = $("#new-session-stake", roomDetailView);
  const handStake = stakeEl ? parseInt(stakeEl.value, 10) : pendingHandStake;
  try {
    const sid = await createSession(currentRoomId, players, handStake);
    openSession(sid);
  } catch (err) {
    console.error("createSession:", err);
  }
}

function wireSessionControls() {
  if (!openSessionId) return;

  $$("tr[data-player-id]", roomDetailView).forEach((row) => {
    const playerId = row.dataset.playerId;

    $$("[data-hand-trick-step]", row).forEach((btn) =>
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.handTrickStep);
        updateHandTrick(currentRoomId, openSessionId, playerId, delta, session?.uid).catch(
          (e) => {
            console.error("updateHandTrick:", e);
            showRoomsError(e.message || "Could not update tricks");
          },
        );
      }),
    );
  });

  const handStakeSelect = $("#session-hand-stake", roomDetailView);
  if (handStakeSelect) {
    handStakeSelect.addEventListener("change", () => {
      updateSessionHandStake(
        currentRoomId,
        openSessionId,
        parseInt(handStakeSelect.value, 10),
      ).catch((e) => console.error("updateSessionHandStake:", e));
    });
  }

  $$("[data-hand-participant]:not([disabled])", roomDetailView).forEach((cb) => {
    cb.addEventListener("change", () => {
      if (!session?.uid) return;
      updateHandPotPreview();
      updateCoWinnerUI();
      setHandParticipation(currentRoomId, openSessionId, {
        playerId: cb.value,
        inHand: cb.checked,
        actorId: session.uid,
      }).catch((e) => {
        console.error("setHandParticipation:", e);
        cb.checked = !cb.checked;
        showRoomsError(e.message || "Could not update hand participation");
      });
    });
  });

  $$("[data-hand-winner]", roomDetailView).forEach((cb) => {
    cb.addEventListener("change", updateCoWinnerUI);
  });

  const recordBtn = $("#record-hand", roomDetailView);
  if (recordBtn) {
    recordBtn.addEventListener("click", onRecordHand);
  }

  const pushBtn = $("#settle-push", roomDetailView);
  if (pushBtn) {
    pushBtn.addEventListener("click", () => onSettleHand("push"));
  }

  const splitBtn = $("#settle-split", roomDetailView);
  if (splitBtn) {
    splitBtn.addEventListener("click", () => onSettleHand("split"));
  }

  updateCoWinnerUI();

  const notes = $("#session-notes", roomDetailView);
  if (notes) {
    let t = null;
    notes.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        updateSessionNotes(currentRoomId, openSessionId, notes.value).catch((e) =>
          console.error("updateSessionNotes:", e),
        );
      }, 500);
    });
  }

  const addPlayerForm = $("#add-player-form", roomDetailView);
  if (addPlayerForm) {
    addPlayerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#add-player-name", roomDetailView);
      const name = input.value.trim();
      if (!name) return;
      const guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
      addSessionPlayer(currentRoomId, openSessionId, guestId, name).catch((err) =>
        console.error("addSessionPlayer:", err),
      );
      input.value = "";
    });
  }

  const completeBtn = $("#complete-session", roomDetailView);
  if (completeBtn) {
    completeBtn.addEventListener("click", onCompleteSession);
  }
}

async function onRecordHand() {
  if (!currentRoomId || !openSessionId || !session) return;
  const { participantIds, winnerIds } = getHandFormSelection();
  if (winnerIds.length !== 1) return;
  try {
    await recordHand(currentRoomId, openSessionId, {
      winnerIds,
      participantIds,
      settlement: "win",
      recordedBy: session.uid,
    });
    showRoomsError("");
  } catch (err) {
    console.error("recordHand:", err);
    showRoomsError(err.message || "Could not record hand");
  }
}

async function onSettleHand(choice) {
  if (!currentRoomId || !openSessionId || !session) return;
  const { participantIds, winnerIds } = getHandFormSelection();
  if (winnerIds.length < 2) return;
  if (!winnerIds.includes(session.uid)) {
    showRoomsError("Only a co-winner can vote.");
    return;
  }
  try {
    const result = await voteCoWinSettlement(currentRoomId, openSessionId, {
      participantIds,
      winnerIds,
      voterId: session.uid,
      choice,
      recordedBy: session.uid,
    });
    if (result.status === "pending") {
      showRoomsError("");
    } else if (result.settlement === "split") {
      showRoomsError("");
    } else if (result.settlement === "non_winner_ante_up") {
      showRoomsError("No split agreement — pot pushed; non-winners ante increased.");
    }
  } catch (err) {
    console.error("voteCoWinSettlement:", err);
    showRoomsError(err.message || "Could not record vote");
  }
}

async function onCompleteSession() {
  if (!currentRoomId || !openSessionId) return;
  const sObj = currentSessions.find((s) => s.id === openSessionId);
  if (!sObj || sObj.status === "final") return;
  if (openScores.length === 0) return;

  try {
    const ids = openScores.map((sc) => sc.playerId);
    const ratings = await getPlayers(ids);
    const input = openScores.map((sc) => ({
      id: sc.playerId,
      displayName: sc.displayName,
      rating: ratings[sc.playerId]
        ? {
            mu: ratings[sc.playerId].mu,
            sigma: ratings[sc.playerId].sigma,
            matchesPlayed: ratings[sc.playerId].matchesPlayed || 0,
          }
        : newRating(),
      score: sc.tricksWon || 0,
    }));

    const results = rankMatch(input).map((r) => ({
      ...r,
      apeClass: apeClass(r.apeScore),
      apeStatus: apeStatus({
        mu: r.mu,
        sigma: r.sigma,
        matchesPlayed: r.matchesPlayed,
      }),
    }));

    await applyRankingResults(currentRoomId, openSessionId, results);
  } catch (err) {
    console.error("completeSession:", err);
  }
}

// ---------------------------------------------------------------------------
// Leaderboard — Ape Score (TrueSkill), persisted in Firestore
// ---------------------------------------------------------------------------
let leaderboardUnsub = null;
let leaderboard = [];

function startLeaderboardSubscription() {
  stopLeaderboardSubscription();
  leaderboardUnsub = subscribeLeaderboard((players) => {
    leaderboard = players;
    renderLeaderboard();
  });
}

function stopLeaderboardSubscription() {
  if (leaderboardUnsub) {
    leaderboardUnsub();
    leaderboardUnsub = null;
  }
  leaderboard = [];
}

const APE_CLASS_EMOJI = {
  Gibbon: "🐒",
  Bonobo: "🐒",
  Chimp: "🦧",
  Orangutan: "🦧",
  Gorilla: "🦍",
  Silverback: "🦍",
};

function renderLeaderboard() {
  const list = $("#leaderboard-list");
  if (!list) return;
  if (leaderboard.length === 0) {
    list.innerHTML = `<p class="muted">No ranked players yet. Complete a session to put apes on the board.</p>`;
    return;
  }
  list.innerHTML = leaderboard
    .map((p, i) => {
      const cls = p.apeClass || "Gibbon";
      const status = p.apeStatus || "Provisional";
      const momentum = p.momentum || 0;
      const statusKey = status.toLowerCase().replace(/\s+/g, "-");
      return `
      <article class="rank-card">
        <div class="rank-card__rank">#${i + 1}</div>
        <div class="rank-card__main">
          <div class="rank-card__name">${escapeHtml(p.displayName || "Player")}</div>
          <div class="rank-card__labels">
            <span class="ape-class">${APE_CLASS_EMOJI[cls] || "🐒"} ${escapeHtml(cls)}</span>
            <span class="ape-status ape-status--${statusKey}">${escapeHtml(status)}</span>
          </div>
          <div class="rank-card__meta">
            ${p.matchesPlayed || 0} match${(p.matchesPlayed || 0) === 1 ? "" : "es"} ·
            <span class="momentum ${momentum >= 0 ? "up" : "down"}">
              ${momentum >= 0 ? "▲" : "▼"} ${Math.abs(momentum)}
            </span> momentum
          </div>
        </div>
        <div class="rank-card__score">
          <span class="rank-card__score-num">${p.apeScore ?? 0}</span>
          <span class="rank-card__score-label">Ape Score</span>
        </div>
      </article>`;
    })
    .join("");
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
const versionEl = $("#app-version");
if (versionEl) versionEl.textContent = `v${APP_VERSION}`;

renderRoomsList();
renderLeagues();
showView();

onAuthChange((user) => {
  const wasAuthed = isAuthed();
  setSession(user);
  if (user) {
    startRoomsSubscription();
    startLeaderboardSubscription();
  } else if (wasAuthed) {
    stopRoomsSubscription();
    stopLeaderboardSubscription();
    renderRoomsList();
    renderLeaderboard();
  }
});

// In case auth resolves synchronously from cache.
setSession(currentUser());
if (session) {
  startRoomsSubscription();
  startLeaderboardSubscription();
}
