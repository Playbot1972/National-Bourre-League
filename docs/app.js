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
  sendPasswordReset,
  completeGoogleRedirectSignIn,
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
  deriveWinnersFromTricks,
  BOURRE_TRICKS_TO_WIN,
} from "./firestore.js";
import { rankMatch, apeClass, apeStatus, newRating } from "./ranking.js";
import { APP_VERSION } from "./version.js";
import {
  RISK_STAKE_OPTIONS,
  riskStakeOptionsFor,
  formatRiskStake,
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
const passwordField = $('[data-field="password"]');
const emailInput = $("#auth-email");
const passwordInput = $("#auth-password");
const errorEl = $("#auth-error");
const successEl = $("#auth-success");
const submitBtn = $("#auth-submit");
const authTitle = $("#auth-title");
const tabSignin = $("#tab-signin");
const tabSignup = $("#tab-signup");
const forgotPasswordBtn = $("#forgot-password");
const passwordManagerHint = $("#password-manager-hint");
const resetGoogleHint = $("#reset-google-hint");
const resetConfirmField = $('[data-field="reset-confirm"]');
const resetConfirmPassword = $("#reset-confirm-password");
const authTabs = $(".modal__tabs", authModal);

let mode = "signin"; // "signin" | "signup" | "reset"

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
  clearSuccess();
  setMode("signin");
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === "signup";
  const reset = mode === "reset";
  authTitle.textContent = reset ? "Reset password" : signup ? "Create account" : "Sign in";
  submitBtn.textContent = reset ? "Send reset email" : signup ? "Create account" : "Sign in";
  nameField.hidden = !signup;
  passwordField.hidden = reset;
  passwordInput.required = !reset;
  forgotPasswordBtn.hidden = signup || reset;
  passwordManagerHint.hidden = signup || reset;
  if (resetGoogleHint) resetGoogleHint.hidden = !reset;
  if (resetConfirmField) resetConfirmField.hidden = !reset;
  if (resetConfirmPassword && !reset) resetConfirmPassword.checked = false;
  if (authTabs) authTabs.hidden = reset;
  // Keep Google sign-in visible on reset — most Gmail users need it instead.
  passwordInput.setAttribute(
    "autocomplete",
    signup ? "new-password" : "current-password",
  );
  tabSignin.classList.toggle("is-active", mode === "signin");
  tabSignup.classList.toggle("is-active", signup);
  clearError();
  clearSuccess();
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = "";
  errorEl.hidden = true;
}

function showSuccess(message) {
  successEl.textContent = message;
  successEl.hidden = false;
}

function clearSuccess() {
  successEl.textContent = "";
  successEl.hidden = true;
}

function setBusy(busy) {
  submitBtn.disabled = busy;
  submitBtn.dataset.busy = busy ? "true" : "false";
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  clearSuccess();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const name = $("#auth-name").value.trim();

  if (!email) {
    showError("Please enter your email.");
    return;
  }

  if (mode === "reset") {
    setBusy(true);
    try {
      const result = await sendPasswordReset(email, {
        confirmedPasswordAccount: resetConfirmPassword?.checked === true,
      });
      if (result.reason === "google-only") {
        showError(
          "This email uses Google sign-in, not a Bourré password. Use Continue with Google below.",
        );
        return;
      }
      if (result.reason === "confirm-needed") {
        showError(
          "This may be a Google account. Use Continue with Google below, or check the box if you truly signed up with email & password.",
        );
        return;
      }
      showSuccess(`Reset link sent to ${email}. Check inbox and spam.`);
    } catch (err) {
      showError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
    return;
  }

  if (!password) {
    showError("Please enter your password.");
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
    const user = await signInWithGoogle();
    if (user) closeAuth();
    else submitBtn.textContent = "Redirecting to Google…";
  } catch (err) {
    showError(describeAuthError(err));
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
forgotPasswordBtn.addEventListener("click", () => setMode("reset"));
$$("[data-close-auth]").forEach((el) => el.addEventListener("click", closeAuth));
$$("[data-open-auth]").forEach((el) =>
  el.addEventListener("click", () => openAuth(el.dataset.openAuth || "signin")),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !authModal.hidden) closeAuth();
});

if (usingEmulator) {
  $("#auth-emulator-hint").hidden = false;
} else {
  const googleRedirectHint = $("#google-redirect-hint");
  if (googleRedirectHint) googleRedirectHint.hidden = false;
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
  unmountTableSessionHost();
  currentRoomId = null;
  openSessionId = null;
  renderRoomsList();
}

/** Lazy-loaded React card table bundle (built via npm run build:table). */
let tableMountApi = null;

async function loadTableMount() {
  if (!tableMountApi) {
    tableMountApi = await import("./table-session.js");
  }
  return tableMountApi;
}

function unmountTableSessionHost() {
  if (tableMountApi) {
    tableMountApi.unmountTableSession();
  }
}

function buildTableLeaderLabel(displayScores, participantIds, tricksThisHand, activeWinnerIds, handReady, maxTricks) {
  if (!participantIds.length) return "Tap I'm in when you're ready to play.";
  if (handReady && activeWinnerIds.length === 1) {
    const name =
      displayScores.find((sc) => sc.playerId === activeWinnerIds[0])?.displayName || "Winner";
    return `${name} wins (${maxTricks} tricks)`;
  }
  if (handReady && activeWinnerIds.length >= 2) {
    const names = activeWinnerIds
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Tie — ${names} (${maxTricks} tricks each)`;
  }
  if (maxTricks > 0) {
    const leaders = participantIds.filter((id) => (tricksThisHand[id] || 0) === maxTricks);
    const names = leaders
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Leader: ${names} (${maxTricks} — need ${BOURRE_TRICKS_TO_WIN} to win)`;
  }
  return `Tap + when you take a trick (first to ${BOURRE_TRICKS_TO_WIN} wins).`;
}

function buildTableSessionProps(s) {
  const mergedScores = mergeScoresWithMembers(openScores, currentMembers);
  const playerOrder = currentMembers.map((m) => ({ playerId: m.userId }));
  const displayScores = sortScoresForDisplay(
    mergedScores,
    playerOrder.length ? playerOrder : s.players || [],
  );
  const handParticipantIds = s.currentHand?.participantIds || [];
  const tricksThisHand = s.currentHand?.tricksByPlayer || {};
  const handStake = s.handStake ?? 1;
  const isFinal = s.status === "final";
  const myUid = session?.uid ?? null;
  const dealerId = s.dealerId ?? null;

  const { ready: handReady, winnerIds: derivedWinnerIds, maxTricks } = deriveWinnersFromTricks(
    tricksThisHand,
    handParticipantIds,
  );
  const pendingWinners = s.pendingCoWinSettlement?.winnerIds;
  const activeWinnerIds =
    handReady && derivedWinnerIds.length > 0
      ? derivedWinnerIds
      : pendingWinners?.length
        ? pendingWinners
        : [];

  const antePot = handParticipantIds.reduce((sum, pid) => {
    const sc = displayScores.find((x) => x.playerId === pid);
    return sum + (sc?.perHandStake ?? handStake);
  }, 0);
  const potAmount = antePot + (s.carryOverPot ?? 0);

  const showCoWinSettlement =
    (handReady && derivedWinnerIds.length >= 2) ||
    (s.pendingCoWinSettlement?.winnerIds?.length >= 2 && activeWinnerIds.length >= 2);
  const coWinnerCount = showCoWinSettlement ? activeWinnerIds.length : 0;
  const splitSharePerWinner = coWinnerCount >= 2 ? potAmount / coWinnerCount : 0;

  return {
    session: {
      sessionId: s.id,
      handNumber: (s.handCount ?? 0) + 1,
      handStake,
      carryOverPot: s.carryOverPot ?? 0,
      isFinal,
      dealerId,
      participantIds: handParticipantIds,
      tricksByPlayer: tricksThisHand,
      pendingCoWinSettlement: s.pendingCoWinSettlement,
    },
    players: displayScores.map((sc) => ({
      playerId: sc.playerId,
      displayName: sc.displayName,
      photoURL: sc.playerId === myUid ? session?.photoURL : null,
      handsWon: sc.handsWon ?? 0,
      net: sc.net ?? 0,
      perHandStake: sc.perHandStake,
      inHand: handParticipantIds.includes(sc.playerId),
      tricksThisHand: tricksThisHand[sc.playerId] ?? 0,
      isSelf: sc.playerId === myUid,
      isDealer: sc.playerId === dealerId,
      isWinner: handReady && activeWinnerIds.includes(sc.playerId),
      canToggleInHand: sc.playerId === myUid && !isFinal,
      canEditTricks:
        !isFinal && handParticipantIds.includes(sc.playerId) && sc.playerId === myUid,
    })),
    potAmount,
    netTotal: displayScores.reduce((sum, sc) => sum + (Number(sc.net) || 0), 0),
    leaderLabel: buildTableLeaderLabel(
      displayScores,
      handParticipantIds,
      tricksThisHand,
      activeWinnerIds,
      handReady,
      maxTricks,
    ),
    showCoWinSettlement,
    splitSharePerWinner,
    voteStatus: renderSettlementVoteStatus(s, displayScores, activeWinnerIds),
    currentUserId: myUid,
    actions: {
      onToggleInHand: (inHand) => {
        if (!session?.uid || !currentRoomId || !openSessionId) return;
        setHandParticipation(currentRoomId, openSessionId, {
          playerId: session.uid,
          inHand,
          actorId: session.uid,
        }).catch((e) => showRoomsError(e.message || "Could not update hand participation"));
      },
      onTrickDelta: (delta) => {
        if (!session?.uid || !currentRoomId || !openSessionId) return;
        updateHandTrick(currentRoomId, openSessionId, session.uid, delta, session.uid).catch(
          (e) => showRoomsError(e.message || "Could not update tricks"),
        );
      },
      onSettle: (choice) => onSettleHand(choice),
    },
  };
}

async function syncTableSession(openSessionObj) {
  const host = $("#table-session-root", roomDetailView);
  if (!host) return;

  if (!openSessionObj || openSessionObj.status === "final" || openScores.length < 2) {
    unmountTableSessionHost();
    if (host && openSessionObj?.status !== "final" && openScores.length < 2) {
      host.innerHTML = `<p class="muted small">Need at least two players for the table.</p>`;
    }
    return;
  }

  try {
    const api = await loadTableMount();
    api.mountTableSession(host, buildTableSessionProps(openSessionObj));
  } catch (err) {
    console.error("table-session mount:", err);
    host.innerHTML = `<p class="muted small">Table UI failed to load. Run <code>npm run build:table</code> and redeploy.</p>`;
  }
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
  syncTableSession(openSessionObj);
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
  const carryOverPot = s.carryOverPot ?? 0;

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

  const tableHost =
    isFinal || openScores.length < 2
      ? ""
      : `<div id="table-session-root" class="table-session-root" aria-label="Live card table"></div>`;

  return `
    <div class="session session--table">
      ${isFinal ? resultsBlock : tableHost}
      <aside class="session-sidebar">
        ${stakeControl}
        ${handHistory}
        <div class="session-controls">${controls}</div>
        <label class="notes-label" for="session-notes">Side notes only — no money movement</label>
        <textarea id="session-notes" class="notes-field" rows="3" ${disabled}
          placeholder="Seating, house-rule tweaks, reminders. Not a ledger.">${escapeHtml(s.notes || "")}</textarea>
        <p class="muted small">${handCount} hand${handCount === 1 ? "" : "s"} played · informational ledger only</p>
      </aside>
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

function getCurrentHandState() {
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  const participantIds = openSessionObj?.currentHand?.participantIds || [];
  const tricksByPlayer = openSessionObj?.currentHand?.tricksByPlayer || {};
  const derived = deriveWinnersFromTricks(tricksByPlayer, participantIds);
  const pending = openSessionObj?.pendingCoWinSettlement;
  const winnerIds =
    derived.ready && derived.winnerIds.length > 0
      ? derived.winnerIds
      : pending?.winnerIds?.length
        ? pending.winnerIds
        : [];
  return {
    participantIds,
    winnerIds,
    ready: derived.ready,
    maxTricks: derived.maxTricks,
  };
}

function renderSettlementVoteStatus(s, displayScores, activeWinnerIds) {
  if (activeWinnerIds.length < 2) return "";
  const pending = s?.pendingCoWinSettlement;
  return activeWinnerIds
    .map((wid) => {
      const name = displayScores.find((sc) => sc.playerId === wid)?.displayName || wid;
      const vote = pending?.votes?.[wid];
      if (vote === "split") return `${name}: Agree ✓`;
      if (vote === "push") return `${name}: Decline ✓`;
      return `${name}: waiting…`;
    })
    .join(" · ");
}

function wireSessionControls() {
  if (!openSessionId) return;

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

async function onSettleHand(choice) {
  if (!currentRoomId || !openSessionId || !session) return;
  const { participantIds, winnerIds } = getCurrentHandState();
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
      showRoomsError("Vote recorded — waiting for other co-winner(s) to agree.");
    } else if (result.settlement === "split") {
      showRoomsError("Pot split recorded — next hand ready.");
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

completeGoogleRedirectSignIn().catch((err) => {
  console.error("Google redirect sign-in:", err);
  openAuth("signin");
  showError(describeAuthError(err));
});

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
