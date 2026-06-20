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
import { SERVER_HAND_AUTHORITY } from "./firebase-config.js";
import {
  ensureUserDoc,
  ensurePlayerDoc,
  createRoom,
  joinRoomByCode,
  leaveRoom,
  kickRoomMember,
  deleteRoom,
  ensureInviteLookupForRoom,
  ensureRoomSessionNamePool,
  refreshRoomSessionCap,
  formatInviteCodeDisplay,
  isValidInviteCodeFormat,
  subscribeMyRooms,
  subscribeRoom,
  subscribeRoomMembers,
  subscribeSessions,
  subscribeScores,
  createSession,
  updateSessionNotes,
  updateSessionLimEnabled,
  updateHandTrick,
  submitHandDraw,
  playHandCard,
  robotSubmitDraw,
  robotPlayCard,
  voteCoWinSettlement,
  addSessionPlayer,
  addSessionRobot,
  removeSessionPlayer,
  syncSessionWithRoomMembers,
  setHandParticipation,
  ensureHandEnrollment,
  prepareSessionForTableOpen,
  timeoutHandEnrollmentTurn,
  ensureCurrentHandParticipants,
  advanceSessionBots,
  subscribeHands,
  subscribePrivateHand,
  subscribeLeaderboard,
  sortScoresForDisplay,
  getPlayers,
  applyRankingResults,
  deleteSession,
  finalizeSession,
  getSession,
  getSessionScores,
  computeHandPotState,
  normalizeBourreSettings,
  updateRoomBourreSettings,
  updateRoomHouseRules,
  DEFAULT_BOURRE_SETTINGS,
  DEFAULT_HOUSE_RULES,
  HOUSE_RULE_FIELDS,
  normalizeHouseRules,
  readHouseRulesFromForm,
  deriveWinnersFromTricks,
  tricksToWinHint,
  playerHandStake,
  scoreBankroll,
  rebuySessionPlayer,
  MAX_TRICKS_PER_HAND,
  totalTricksPlayed,
  isHandComplete,
  isRobotPlayerId,
  getSessionEnrollment,
  getSessionCurrentHand,
  HAND_ENROLLMENT_MS,
  enrollmentDeadlineMs,
  tricksForPlayer,
} from "./firestore.js";
import {
  MAX_ROOM_SESSIONS,
  canCreateAnotherSession,
  createdSessionsForTabs,
  isValidSessionNamePool,
  sessionTabLabel,
} from "./session-presets.js";
import {
  getLegalPlayIndices,
  deserializeCards,
  effectivePlayerHand,
  serializeCards,
  cardsRemainingInHand,
  displayHoleCardCount,
} from "./game-engine.js";
import {
  bourrePlayerIds,
  formatHandHistoryPublicLine,
  formatVoteRecordedMessage,
} from "./settlement-copy.js";
import { rankMatch, apeClass, apeStatus, newRating } from "./ranking.js";
import { VERSION_DISPLAY_LABEL, BUILD_STAMPED_AT } from "./version.js";
import {
  mountVersionFooter,
  startVersionUpdateWatcher,
} from "./version-update.js";
import { renderRulesView } from "./rules-view.js";
import { initTheme, wireThemeToggle } from "./theme.js";
import { renderFeedbackSettingsHtml, saveFeedbackPrefs } from "./feedback-prefs.js";
import {
  RISK_STAKE_OPTIONS,
  formatRiskStake,
  formatNet,
} from "./risk-stakes.js";
import { analyzeTableStartup, tableStartupUserMessage } from "./session-startup.js";

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
  location.hash = "#home";
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
  if (view === "rules") {
    renderRulesView($("#rules-root"));
  }
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

function renderHouseRulesEditor(houseRules) {
  const hr = normalizeHouseRules(houseRules);
  return `
    <form class="house-rules-form" id="house-rules-form">
      <p class="muted small"><a href="#rules">Full rules reference</a> · saved automatically.</p>
      ${HOUSE_RULE_FIELDS.map(
        (field) => `
          <label class="house-rules__field">
            <span class="house-rules__label">${escapeHtml(field.label)}</span>
            <textarea
              class="text-input house-rules__input"
              id="house-rule-${field.id}"
              data-house-rule="${field.id}"
              rows="2"
              maxlength="400"
              aria-label="${escapeHtml(field.label)}"
            >${escapeHtml(hr[field.id])}</textarea>
            <span class="muted small house-rules__hint">${escapeHtml(field.hint)}</span>
          </label>`,
      ).join("")}
      <button type="button" class="btn btn--sm" id="house-rules-reset">Reset to app defaults</button>
    </form>`;
}

function renderHouseRulesReadOnly(houseRules) {
  const hr = normalizeHouseRules(houseRules);
  return `
    <p class="muted small"><a href="#rules">Full rules reference</a></p>
    <ul class="kv">
      ${HOUSE_RULE_FIELDS.map(
        (field) =>
          `<li><span>${escapeHtml(field.label)}</span><span>${escapeHtml(hr[field.id])}</span></li>`,
      ).join("")}
    </ul>`;
}

function saveHouseRulesFromDetailForm() {
  if (!currentRoomId || session?.uid !== currentRoom?.ownerId) return Promise.resolve();
  const form = $("#house-rules-form", roomDetailView);
  if (!form) return Promise.resolve();
  return updateRoomHouseRules(currentRoomId, readHouseRulesFromForm(form)).catch((err) => {
    console.error("updateRoomHouseRules:", err);
    showRoomsError(err.message || "Could not save house rules");
  });
}

// ---------------------------------------------------------------------------
// Private Rooms — persisted in Firestore
// ---------------------------------------------------------------------------
const roomsListView = $("#rooms-list-view");
const roomDetailView = $("#room-detail-view");
const roomsIntro = $("#rooms-intro");
const roomsError = $("#rooms-error");

function syncOpenSessionLimEnabled(limEnabled) {
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  if (
    !currentRoomId ||
    !openSessionId ||
    !openSessionObj ||
    openSessionObj.status === "final" ||
    openSessionObj.handStakeLocked ||
    session?.uid !== currentRoom?.ownerId
  ) {
    return Promise.resolve();
  }
  return updateSessionLimEnabled(currentRoomId, openSessionId, limEnabled);
}

function bindRoomDetailDelegatedControls() {
  if (roomDetailView.dataset.controlsBound) return;
  roomDetailView.dataset.controlsBound = "1";

  let houseRulesSaveTimer = null;
  let sessionNotesSaveTimer = null;

  roomDetailView.addEventListener("input", (e) => {
    const el = e.target;
    if (el instanceof HTMLTextAreaElement && el.id === "session-notes") {
      if (!currentRoomId || !openSessionId) return;
      clearTimeout(sessionNotesSaveTimer);
      sessionNotesSaveTimer = setTimeout(() => {
        updateSessionNotes(currentRoomId, openSessionId, el.value).catch((err) =>
          console.error("updateSessionNotes:", err),
        );
      }, 500);
      return;
    }
    if (!(el instanceof HTMLTextAreaElement) || !el.dataset.houseRule) return;
    if (session?.uid !== currentRoom?.ownerId) return;
    clearTimeout(houseRulesSaveTimer);
    houseRulesSaveTimer = setTimeout(() => {
      saveHouseRulesFromDetailForm();
    }, 600);
  });

  roomDetailView.addEventListener("click", (e) => {
    if (e.target.closest("#back-to-rooms")) {
      e.preventDefault();
      closeRoom();
      return;
    }
    const deleteRoomBtn = e.target.closest("#delete-room");
    if (deleteRoomBtn) {
      e.preventDefault();
      if (currentRoomId) onDeleteRoom(currentRoomId);
      return;
    }
    const leaveRoomBtn = e.target.closest("#leave-room");
    if (leaveRoomBtn) {
      e.preventDefault();
      if (currentRoomId) onLeaveRoom(currentRoomId);
      return;
    }
    const sessionTab = e.target.closest("[data-open-session]");
    if (sessionTab?.dataset.openSession) {
      e.preventDefault();
      openSession(sessionTab.dataset.openSession);
      return;
    }
    if (e.target.closest("#complete-session")) {
      e.preventDefault();
      onCompleteSession();
      return;
    }
    const kickBtn = e.target.closest("[data-kick-member]");
    if (kickBtn) {
      e.preventDefault();
      onKickMember(kickBtn.dataset.kickMember, kickBtn.dataset.kickName);
      return;
    }
    const removePlayerBtn = e.target.closest("[data-remove-session-player]");
    if (removePlayerBtn) {
      e.preventDefault();
      onRemoveSessionPlayer(
        removePlayerBtn.dataset.removeSessionPlayer,
        removePlayerBtn.dataset.removeSessionName,
      );
      return;
    }
    const newSessionBtn = e.target.closest("#new-session");
    if (newSessionBtn) {
      e.preventDefault();
      if (newSessionBtn.disabled) {
        showRoomsError(
          newSessionBtn.title || "Cannot open another regional table right now.",
        );
        return;
      }
      onNewSession();
      return;
    }
    if (e.target.id !== "house-rules-reset") return;
    e.preventDefault();
    const form = $("#house-rules-form", roomDetailView);
    if (!form || session?.uid !== currentRoom?.ownerId) return;
    for (const { id } of HOUSE_RULE_FIELDS) {
      const field = form.querySelector(`#house-rule-${id}`);
      if (field) field.value = DEFAULT_HOUSE_RULES[id];
    }
    saveHouseRulesFromDetailForm();
  });

  roomDetailView.addEventListener("submit", (e) => {
    if (!e.target.closest("#add-player-form")) return;
    e.preventDefault();
    if (!currentRoomId || !openSessionId) {
      showRoomsError("Open a regional session tab first, then add a guest or robot.");
      return;
    }
    const input = $("#add-player-name", roomDetailView);
    const isRobot = $("#add-player-robot", roomDetailView)?.checked === true;
    let name = input?.value.trim() || "";
    if (!name) {
      if (isRobot) {
        name = nextDefaultRobotName();
      } else {
        showRoomsError("Enter a player name, or check Robot to add a bot with an auto name.");
        input?.focus();
        return;
      }
    }
    const addPromise = isRobot
      ? addSessionRobot(currentRoomId, openSessionId, name)
      : addSessionPlayer(
          currentRoomId,
          openSessionId,
          `guest_${Math.random().toString(36).slice(2, 10)}`,
          name,
        );
    addPromise
      .catch((err) => {
        console.error(isRobot ? "addSessionRobot:" : "addSessionPlayer:", err);
        showRoomsError(err.message || `Could not add ${isRobot ? "robot" : "player"}`);
      })
      .then((added) => {
        if (added === false) {
          showRoomsError("That name is already on the score sheet.");
          return;
        }
        if (added !== true) return;
        showRoomsError("");
      });
    if (input) input.value = "";
    const robotCheckbox = $("#add-player-robot", roomDetailView);
    if (robotCheckbox) robotCheckbox.checked = true;
  });

  roomDetailView.addEventListener("change", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;

    if (el.id === "new-session-stake") {
      pendingHandStake = parseInt(el.value, 10) || 1;
      userPickedNewSessionStake = true;
      return;
    }

    if (el.id === "feedback-sound-enabled") {
      saveFeedbackPrefs({ soundEnabled: el.checked });
      return;
    }

    if (el.name === "feedback-haptics" && el.checked) {
      saveFeedbackPrefs({ hapticsMode: el.value });
      return;
    }

    if (el.id === "room-buy-in-amount" || el.id === "room-ante-amount" || el.id === "room-lim-enabled" || el.id === "room-rebuy-enabled") {
      const buyInEl = $("#room-buy-in-amount", roomDetailView);
      const anteEl = $("#room-ante-amount", roomDetailView);
      const limEl = $("#room-lim-enabled", roomDetailView);
      const rebuyEl = $("#room-rebuy-enabled", roomDetailView);
      if (!buyInEl || !anteEl || !limEl || !currentRoomId) return;
      pendingRoomBuyInOverride = parseInt(buyInEl.value, 10) || 1;
      pendingRoomAnteOverride = parseInt(anteEl.value, 10) || 1;
      const limEnabled = limEl.checked;
      const rebuyEnabled = rebuyEl?.checked === true;
      updateRoomBourreSettings(currentRoomId, {
        buyInAmount: pendingRoomBuyInOverride,
        anteAmount: pendingRoomAnteOverride,
        limEnabled,
        rebuyEnabled,
      })
        .then(() => {
          pendingRoomBuyInOverride = null;
          pendingRoomAnteOverride = null;
          pendingHandStake = parseInt(anteEl.value, 10) || 1;
          userPickedNewSessionStake = false;
          return syncOpenSessionLimEnabled(limEnabled);
        })
        .then(() => {
          const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
          if (openSessionObj) {
            syncTableSession({ ...openSessionObj, limEnabled });
          }
        })
        .catch((err) => {
          console.error("updateRoomBourreSettings:", err);
          showRoomsError(err.message || "Could not save Bourré settings");
        });
    }
  });
}

// Subscriptions we must tear down on auth/room changes.
let myRoomsUnsub = null;
const detailUnsubs = [];
let scoresUnsub = null;
let handsUnsub = null;
let privateHandUnsub = null;

let myRooms = [];
let currentRoomId = null;
let currentRoom = null;
let currentMembers = [];
let currentSessions = [];
let creatingSession = false;
/** Optimistic session stubs until Firestore snapshot includes them. */
const pendingOpenSessions = new Map();
let openSessionId = null;
function rememberPendingSession(sessionStub) {
  if (!sessionStub?.id) return;
  pendingOpenSessions.set(sessionStub.id, sessionStub);
}

function mergeSessionsWithPending(sessions) {
  const merged = [...sessions];
  const ids = new Set(sessions.map((s) => s.id));
  for (const stub of pendingOpenSessions.values()) {
    if (!ids.has(stub.id)) merged.push(stub);
  }
  return merged.sort((a, b) => {
    const as = a.createdAt?.seconds ?? a.createdAt ?? 0;
    const bs = b.createdAt?.seconds ?? b.createdAt ?? 0;
    return bs - as;
  });
}

function resolveActiveSession() {
  if (!openSessionId) return null;
  const found = currentSessions.find((s) => s.id === openSessionId);
  if (found) return found;
  const pending = pendingOpenSessions.get(openSessionId);
  if (pending) return pending;
  return {
    id: openSessionId,
    sessionName: "Session",
    status: "in_progress",
    handCount: 0,
  };
}

function buildSessionPlayerSectionHtml(s, isOwner) {
  if (!s || s.status === "final") return "";
  if (!isOwner) {
    return `<p class="muted small session-add-players__guest-hint">Only the room host can add guests and robots.</p>`;
  }
  return buildSessionPlayerBarHtml(s);
}

let roomGoneHandled = false;
let openScores = [];
let openHands = [];
let openPrivateHand = null;
let privateHandSnapSeen = false;
let openPlayerRatings = {};
let tableActionFeedback = null;
let tableFeedbackTimer = null;
let tableFeedbackSnapshot = null;
let pendingDrawShuffle = false;
let tableFeedbackApi = null;
let enrollmentTimer = null;
let robotActionInFlight = false;
let lastRobotTrickAt = 0;
/** Min gap between robot card plays — must exceed post-trick hold + sweep (premium pace). */
/** Must exceed full trick presentation pipeline (see src/table/trickTiming.ts). */
/** Keep in sync with src/table/trickTiming.ts trickResolutionScheduleMs().pipelineMs (1600+300+200). */
const TRICK_PIPELINE_MS = 1600 + 300 + 200;
const BOT_PLAY_STAGGER_MS = 350;
const ROBOT_TRICK_INTERVAL_MS = TRICK_PIPELINE_MS + BOT_PLAY_STAGGER_MS + 220;
/** After settlement, force-open the next join window if auto-open stalls. */
const HAND_LIFECYCLE_WATCHDOG_MS = 12_000;
/** Brief pause so "Hand complete…" is readable before the next I'm-in window. */
const NEXT_HAND_SETTLE_MS = 2_000;
let nextHandOpenTimer = null;
let nextHandOpenStartedAt = 0;
let nextHandOpenInFlight = false;

function shouldOpenEnrollmentAfterSettle(ctx) {
  return (
    ctx.sessionStatus !== "final" &&
    !ctx.enrollmentActive &&
    !ctx.handPhase &&
    (ctx.participantCount ?? 0) === 0 &&
    !ctx.pendingCoWin
  );
}

function logHandLifecycleTransition(transition) {
  if (typeof console !== "undefined" && console.info) {
    console.info(
      `[hand-lifecycle] ${transition.from} → ${transition.to}: ${transition.reason}${
        transition.blockedBy ? ` blockedBy=${transition.blockedBy}` : ""
      }`,
    );
  }
}

function sessionHandLifecycleContext(sessionObj) {
  const ch = getSessionCurrentHand(sessionObj);
  const enrollment = getSessionEnrollment(sessionObj);
  return {
    sessionStatus: sessionObj?.status ?? null,
    enrollmentActive: enrollment?.active === true,
    handPhase: ch?.phase ?? null,
    participantCount: ch?.participantIds?.length ?? 0,
    pendingCoWin: Boolean(sessionObj?.pendingCoWinSettlement),
    tablePlayOpen,
  };
}

function sessionNeedsNextHandEnrollment(sessionObj) {
  if (!sessionObj || sessionObj.status === "final") return false;
  const ctx = sessionHandLifecycleContext(sessionObj);
  return shouldOpenEnrollmentAfterSettle(ctx);
}

function cancelNextHandOpenTimer() {
  if (nextHandOpenTimer) {
    clearTimeout(nextHandOpenTimer);
    nextHandOpenTimer = null;
  }
  nextHandOpenStartedAt = 0;
}

function sessionAutoDealtNextHand(sessionObj) {
  if (getSessionEnrollment(sessionObj)?.active) return false;
  const phase = getSessionCurrentHand(sessionObj)?.phase;
  return phase === "draw" || phase === "play";
}

function nextHandOpenFeedbackMessage(sessionObj, dealerLabel) {
  const handNum = (sessionObj?.handCount ?? 0) + 1;
  if (sessionAutoDealtNextHand(sessionObj)) {
    return `Hand #${handNum} — dealing next hand…`;
  }
  return `Hand #${handNum} — I'm in (clockwise from ${dealerLabel})`;
}

async function openNextHandEnrollment(sessionObj) {
  if (!currentRoomId || !openSessionId || !tablePlayOpen || nextHandOpenInFlight) return;
  if (!sessionNeedsNextHandEnrollment(sessionObj)) return;
  if (tableReadyPlayerCount(sessionObj) < 2) return;

  nextHandOpenInFlight = true;
  cancelNextHandOpenTimer();
  openPrivateHand = null;
  privateHandSnapSeen = false;
  tableFeedbackSnapshot = null;

  try {
    setTableActionFeedback({ status: "loading", message: "Shuffling — next hand…" });
    await ensureHandEnrollment(currentRoomId, openSessionId);
    const refreshed =
      (await refreshOpenSessionFromServer(currentRoomId, openSessionId)) ?? sessionObj;
    await syncTableSession(refreshed);
    const autoDealt = sessionAutoDealtNextHand(refreshed);
    if (getSessionEnrollment(refreshed)?.active || sessionHasRobots()) {
      startEnrollmentTimer();
    }
    processRobotActions(refreshed, openScores);
    const dealerSc = openScores.find((sc) => sc.playerId === refreshed.dealerId);
    const dealerLabel = dealerSc?.displayName ?? "dealer";
    setTableActionFeedback({
      status: "success",
      message: nextHandOpenFeedbackMessage(refreshed, dealerLabel),
    });
    const api = await ensureTableFeedbackApi();
    api?.playShuffleFeedback?.({ delayMs: 80 });
    logHandLifecycleTransition({
      from: "handoffToNextDeal",
      to: autoDealt ? "deal" : "opening",
      reason: autoDealt
        ? "auto-dealt next hand for opted-in table members (live table)"
        : "auto-opened join window after settlement (live table)",
    });
  } catch (err) {
    console.warn("openNextHandEnrollment:", err);
    setTableActionFeedback({
      status: "error",
      message: err?.message || "Could not open the next join window",
    });
    showRoomsError(err?.message || "Could not open the next join window");
  } finally {
    nextHandOpenInFlight = false;
  }
}

function maybeRecoverHandLifecycle(sessionObj) {
  if (!currentRoomId || !openSessionId || !sessionObj || sessionObj.status === "final") {
    cancelNextHandOpenTimer();
    return;
  }
  if (sessionObj.pendingCoWinSettlement) {
    cancelNextHandOpenTimer();
    return;
  }

  const ctx = sessionHandLifecycleContext(sessionObj);
  if (!shouldOpenEnrollmentAfterSettle(ctx)) {
    cancelNextHandOpenTimer();
    return;
  }

  if (!tablePlayOpen) return;

  if (nextHandOpenInFlight || nextHandOpenTimer) return;

  if (!nextHandOpenStartedAt) nextHandOpenStartedAt = Date.now();
  const elapsed = Date.now() - nextHandOpenStartedAt;
  const delay =
    elapsed >= HAND_LIFECYCLE_WATCHDOG_MS
      ? 0
      : Math.max(0, NEXT_HAND_SETTLE_MS - elapsed);

  nextHandOpenTimer = setTimeout(() => {
    nextHandOpenTimer = null;
    nextHandOpenStartedAt = 0;
    const latest = currentSessions.find((s) => s.id === openSessionId);
    if (latest) openNextHandEnrollment(latest);
  }, delay);
}

function cardKeyFromSerialized(card) {
  if (!card?.rank || !card?.suit) return null;
  return `${card.rank}-${card.suit}`;
}

function buildTableFeedbackSnapshot(sessionObj) {
  const ch = getSessionCurrentHand(sessionObj);
  const myUid = session?.uid ?? null;
  const participantIds = ch?.participantIds ?? [];
  const tricks = ch?.tricksByPlayer ?? {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricks, participantIds);
  const handComplete = isHandComplete(tricks, participantIds);
  return {
    sessionId: sessionObj?.id ?? null,
    phase: ch?.phase ?? null,
    trumpKey: cardKeyFromSerialized(ch?.trumpUpcard),
    drawCompletedIds: [...(ch?.drawCompletedIds ?? [])],
    myTricks: myUid ? tricksForPlayer(tricks, myUid) : 0,
    handComplete,
    myIsWinner: myUid != null && handComplete && ready && winnerIds.includes(myUid),
    heroCardKeys: (openPrivateHand?.cards ?? [])
      .map(cardKeyFromSerialized)
      .filter(Boolean)
      .sort()
      .join(","),
  };
}

async function ensureTableFeedbackApi() {
  if (tableFeedbackApi) return tableFeedbackApi;
  try {
    tableFeedbackApi = await loadTableMount();
    tableFeedbackApi.initGameFeedback?.();
  } catch {
    tableFeedbackApi = null;
  }
  return tableFeedbackApi;
}

async function processTableFeedbackEvents(sessionObj) {
  const api = await ensureTableFeedbackApi();
  if (!api || !sessionObj) return;

  const next = buildTableFeedbackSnapshot(sessionObj);
  const prev = tableFeedbackSnapshot;
  const myUid = session?.uid ?? null;

  if (!prev || prev.sessionId !== next.sessionId) {
    tableFeedbackSnapshot = next;
    if (next.trumpKey && next.phase === "draw") {
      api.playShuffleFeedback?.({ delayMs: 80 });
    }
    return;
  }

  if (!prev.trumpKey && next.trumpKey) {
    api.playShuffleFeedback?.({ delayMs: 80 });
  }

  if (pendingDrawShuffle && myUid && next.drawCompletedIds.includes(myUid)) {
    if (next.heroCardKeys !== prev.heroCardKeys) {
      pendingDrawShuffle = false;
      api.playShuffleFeedback?.({ delayMs: 120 });
    }
  }

  if (myUid && next.myTricks > prev.myTricks) {
    api.playTrickWinFeedback?.();
  }

  if (next.handComplete && !prev.handComplete && next.myIsWinner) {
    api.playBigWinFeedback?.();
  }

  tableFeedbackSnapshot = next;
}

function buildHeroCardsForTable(currentHand, privateCardList, playerId, handPhase) {
  const privateCards = privateCardList ?? [];
  if ((handPhase !== "draw" && handPhase !== "play") || !currentHand || !playerId) {
    return privateCards;
  }
  const effective = effectivePlayerHand(
    playerId,
    deserializeCards(privateCards),
    currentHand,
  );
  return serializeCards(effective);
}

function computeLegalPlayIndices(currentHand, heroCards, playerId) {
  if (!currentHand || currentHand.phase !== "play" || !heroCards?.length || !playerId) {
    return null;
  }
  const privateHand = deserializeCards(heroCards);
  const hand = effectivePlayerHand(playerId, privateHand, currentHand);
  const trick = currentHand.currentTrick;
  const trickPlays = (trick?.plays || []).map((p) => p.card);
  const isLeading = trickPlays.length === 0;
  return getLegalPlayIndices({
    hand,
    trumpSuit: currentHand.trumpSuit,
    leadSuit: isLeading ? null : currentHand.leadSuit || trickPlays[0]?.suit,
    trickPlays,
    isLeading,
    cinchEnabled: currentHand.cinchEnabled === true,
  });
}

function setTableActionFeedback(feedback) {
  tableActionFeedback = feedback;
  if (tableFeedbackTimer) {
    clearTimeout(tableFeedbackTimer);
    tableFeedbackTimer = null;
  }
  if (feedback?.status === "success") {
    tableFeedbackTimer = setTimeout(() => {
      tableActionFeedback = null;
      tableFeedbackTimer = null;
      const sessionObj = currentSessions.find((x) => x.id === openSessionId);
      if (sessionObj) scheduleTableSessionSync(sessionObj);
    }, 2200);
  }
  const sessionObj = currentSessions.find((x) => x.id === openSessionId);
  if (sessionObj) scheduleTableSessionSync(sessionObj);
}

function sessionHasRobots(scores = openScores) {
  return scores.some((sc) => sc.isRobot === true || isRobotPlayerId(sc.playerId));
}

/** True when robots may need a human room member (or server nudge) to keep the hand moving. */
function sessionNeedsBotDriver(sessionObj, scores = openScores) {
  if (!sessionObj || sessionObj.status === "final") return false;
  if (getSessionEnrollment(sessionObj)?.active) return sessionHasRobots(scores);
  if (sessionObj.pendingCoWinSettlement?.winnerIds?.some((id) => isRobotPlayerId(id))) {
    return true;
  }
  const ch = getSessionCurrentHand(sessionObj);
  if (ch?.phase === "draw" || ch?.phase === "play") {
    const turnId = ch.turnPlayerId;
    return Boolean(turnId && isRobotPlayerId(turnId));
  }
  return sessionHasRobots(scores);
}

async function refreshTablePlayerRatings(scores = openScores) {
  const ids = [...new Set(scores.map((s) => s.playerId).filter(Boolean))];
  if (!ids.length) {
    openPlayerRatings = {};
    return;
  }
  try {
    openPlayerRatings = await getPlayers(ids);
    const sessionObj = currentSessions.find((x) => x.id === openSessionId);
    if (sessionObj) scheduleTableSessionSync(sessionObj);
  } catch (e) {
    console.warn("refreshTablePlayerRatings:", e);
  }
}

function enrollmentMsLeft(enrollment) {
  return Math.max(0, enrollmentDeadlineMs(enrollment) - Date.now());
}

function enrollmentSecondsLeft(enrollment) {
  return Math.max(0, Math.ceil(enrollmentMsLeft(enrollment) / 1000));
}

function enrollmentHasExpired(enrollment) {
  return enrollment?.active === true && Date.now() >= enrollmentDeadlineMs(enrollment);
}

function stopEnrollmentTimer() {
  if (enrollmentTimer) {
    clearInterval(enrollmentTimer);
    enrollmentTimer = null;
  }
}

function startEnrollmentTimer() {
  stopEnrollmentTimer();
  if (!tablePlayOpen) return;
  const s = currentSessions.find((x) => x.id === openSessionId);
  if (!s || s.status === "final") return;
  const enrollmentActive = getSessionEnrollment(s)?.active === true;
  const needsDriver = sessionNeedsBotDriver(s, openScores);
  if (!enrollmentActive && !needsDriver) return;

  enrollmentTimer = setInterval(() => {
    const sessionObj = currentSessions.find((x) => x.id === openSessionId);
    if (!sessionObj || sessionObj.status === "final") {
      stopEnrollmentTimer();
      return;
    }
    if (enrollmentHasExpired(getSessionEnrollment(sessionObj))) {
      timeoutHandEnrollmentTurn(currentRoomId, openSessionId).catch((e) => {
        console.warn("enrollment timeout:", e);
        setTableActionFeedback({
          status: "error",
          message: e.message || "Enrollment timer could not advance — check connection.",
        });
      });
    }
    processRobotActions(sessionObj, openScores);
    if (getSessionEnrollment(sessionObj)?.active) {
      syncTableSession(sessionObj);
    }
  }, 1000);
}
let tablePlayOpen = false;
let pendingHandStake = 1;
/** Local ante override while new-session stake save or snapshot re-render is in flight. */
let pendingRoomAnteOverride = null;
/** User picked new-session ante — do not overwrite from room snapshot until create. */
let userPickedNewSessionStake = false;
/** Local buy-in override while Bourré settings save or snapshot re-render is in flight. */
let pendingRoomBuyInOverride = null;
let renderRoomDetailTimer = 0;
let syncMembersPromise = null;
/** Bumped when the inline table mount node is replaced so stale async mounts are ignored. */
let tableMountGeneration = 0;
let tableSyncFrame = 0;
/** Session ids queued for removal after SESSION_CLEANUP_MS. */
const pendingSessionCleanup = new Set();
const sessionCleanupTimers = new Map();
const SESSION_CLEANUP_MS = 30_000;
const SESSION_CLEANUP_STORAGE_KEY = "bourre-session-cleanup-v1";

function readCleanupQueue() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_CLEANUP_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCleanupQueue(queue) {
  sessionStorage.setItem(SESSION_CLEANUP_STORAGE_KEY, JSON.stringify(queue));
}

function queueSessionCleanupPersisted(roomId, sessionId, deleteAtMs) {
  const queue = readCleanupQueue();
  if (!queue[roomId]) queue[roomId] = {};
  queue[roomId][sessionId] = deleteAtMs;
  writeCleanupQueue(queue);
}

function dequeueSessionCleanupPersisted(roomId, sessionId) {
  const queue = readCleanupQueue();
  if (!queue[roomId]?.[sessionId]) return;
  delete queue[roomId][sessionId];
  if (Object.keys(queue[roomId]).length === 0) delete queue[roomId];
  writeCleanupQueue(queue);
}

async function runSessionCleanup(roomId, sessionId) {
  if (!roomId || !sessionId) return;
  const timer = sessionCleanupTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    sessionCleanupTimers.delete(sessionId);
  }

  try {
    await prepareSessionForRemoval(roomId, sessionId);
    await deleteSession(roomId, sessionId);
    dequeueSessionCleanupPersisted(roomId, sessionId);
    pendingSessionCleanup.delete(sessionId);
    if (currentRoomId === roomId) {
      renderRoomDetail();
    }
  } catch (e) {
    console.error("runSessionCleanup:", e);
    pendingSessionCleanup.add(sessionId);
    const retryAt = Date.now() + 15_000;
    queueSessionCleanupPersisted(roomId, sessionId, retryAt);
    sessionCleanupTimers.set(
      sessionId,
      setTimeout(() => {
        runSessionCleanup(roomId, sessionId).catch((err) =>
          console.error("runSessionCleanup retry:", err),
        );
      }, 15_000),
    );
    if (currentRoomId === roomId) {
      showRoomsError(
        e?.message || "Could not auto-clear an old session — retrying in 15s.",
      );
    }
  }
}

/** Keep the open in-progress session when possible, else the newest active tab. */
function resolveKeeperSessionId(sessions, preferredSessionId = null) {
  if (!sessions.length) return null;
  if (preferredSessionId) {
    const open = sessions.find((s) => s.id === preferredSessionId);
    if (open && open.status !== "final") return preferredSessionId;
  }
  const active = sessions.find((s) => s.status !== "final");
  if (active) return active.id;
  return sessions[0].id;
}

/** Finalize with Ape Scores when needed so completed sessions can be deleted. */
async function prepareSessionForRemoval(roomId, sessionId) {
  let remote = await getSession(roomId, sessionId);
  if (!remote) return;
  if (remote.status === "final") return;

  const scores =
    sessionId === openSessionId && openScores.length
      ? openScores
      : await getSessionScores(roomId, sessionId);

  if (scores.length > 0) {
    await completeSessionWithApeScores(roomId, sessionId, scores);
  } else {
    await finalizeSession(roomId, sessionId);
  }

  remote = await getSession(roomId, sessionId);
  if (remote?.status !== "final") {
    throw new Error("Could not finalize session before removal");
  }
}

function restoreSessionCleanupTimers(roomId) {
  if (!roomId) return;
  const entries = readCleanupQueue()[roomId] || {};
  const now = Date.now();
  for (const [sessionId, deleteAtMs] of Object.entries(entries)) {
    if (sessionCleanupTimers.has(sessionId)) continue;
    pendingSessionCleanup.add(sessionId);
    const delay = Math.max(0, Number(deleteAtMs) - now);
    if (delay === 0) {
      runSessionCleanup(roomId, sessionId).catch((e) =>
        console.error("deleteSession:", e),
      );
    } else {
      sessionCleanupTimers.set(
        sessionId,
        setTimeout(() => {
          runSessionCleanup(roomId, sessionId).catch((e) =>
            console.error("deleteSession:", e),
          );
        }, delay),
      );
    }
  }
}

function mergeScoresWithMembers(scores, members, sessionPlayers = []) {
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
  for (const p of sessionPlayers) {
    if (!p?.playerId || map.has(p.playerId)) continue;
    map.set(p.playerId, {
      playerId: p.playerId,
      displayName: p.displayName || "Player",
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }
  return [...map.values()];
}

/** Room members plus guests/robots on the open session score sheet (for Members panel). */
function buildRoomRosterEntries(visibleMembers, scores, sessionObj) {
  const memberIds = new Set(visibleMembers.map((m) => m.userId).filter(Boolean));
  const entries = visibleMembers.map((m) => ({
    playerId: m.userId,
    displayName: m.displayName,
    role: m.role || "player",
    kind: "member",
  }));

  if (!sessionObj || sessionObj.status === "final") return entries;

  for (const sc of scores) {
    const playerId = sc.playerId;
    if (!playerId || memberIds.has(playerId)) continue;
    const robot = sc.isRobot === true || isRobotPlayerId(playerId);
    entries.push({
      playerId,
      displayName: sc.displayName || (robot ? "Robot" : "Guest"),
      role: robot ? "robot" : "guest",
      kind: robot ? "robot" : "guest",
    });
  }
  return entries;
}

function mergeOpenSessionSnapshot(sessionId, data) {
  if (!sessionId || !data) return null;
  const merged = { id: sessionId, ...data };
  currentSessions = currentSessions.map((s) => (s.id === sessionId ? merged : s));
  return merged;
}

async function refreshOpenSessionFromServer(roomId, sessionId) {
  const fresh = await getSession(roomId, sessionId);
  return mergeOpenSessionSnapshot(sessionId, fresh);
}

function tableReadyPlayerCount(sessionObj) {
  if (!sessionObj) return 0;
  return mergeScoresWithMembers(openScores, currentMembers, sessionObj.players || []).length;
}

function bumpTableMountGeneration() {
  tableMountGeneration += 1;
}

/** Auto name when adding a robot with an empty field (Phase 3 step 5 UX). */
function nextDefaultRobotName(scores = openScores) {
  const taken = new Set(
    scores.map((s) => (s.displayName || "").trim().toLowerCase()).filter(Boolean),
  );
  if (!taken.has("robot")) return "Robot";
  for (let n = 2; n <= 99; n += 1) {
    const candidate = `Robot ${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `Robot ${Math.random().toString(36).slice(2, 6)}`;
}

let pendingSelfJoinRoomId = null;
let pendingSelfJoinTimer = null;

function markPendingSelfJoin(roomId) {
  pendingSelfJoinRoomId = roomId;
  if (pendingSelfJoinTimer) clearTimeout(pendingSelfJoinTimer);
  pendingSelfJoinTimer = setTimeout(() => {
    pendingSelfJoinTimer = null;
    if (pendingSelfJoinRoomId !== roomId) return;
    pendingSelfJoinRoomId = null;
    if (
      currentRoomId === roomId &&
      session?.uid &&
      !currentMembers.some((m) => m.userId === session.uid)
    ) {
      showRoomsError("Join is taking longer than expected — tap Join room again.");
      closeRoom();
    }
  }, 15000);
}

function clearPendingSelfJoin(roomId = null) {
  if (roomId && pendingSelfJoinRoomId !== roomId) return;
  pendingSelfJoinRoomId = null;
  if (pendingSelfJoinTimer) {
    clearTimeout(pendingSelfJoinTimer);
    pendingSelfJoinTimer = null;
  }
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

function stopSessionCleanupTimers() {
  for (const timer of sessionCleanupTimers.values()) {
    clearTimeout(timer);
  }
  sessionCleanupTimers.clear();
}

function cancelSessionCleanup(sessionId) {
  const timer = sessionCleanupTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    sessionCleanupTimers.delete(sessionId);
  }
  pendingSessionCleanup.delete(sessionId);
}

function scheduleSessionCleanup(sessionId) {
  if (!currentRoomId || !sessionId) return;
  const roomId = currentRoomId;
  cancelSessionCleanup(sessionId);
  pendingSessionCleanup.add(sessionId);
  const deleteAtMs = Date.now() + SESSION_CLEANUP_MS;
  queueSessionCleanupPersisted(roomId, sessionId, deleteAtMs);
  sessionCleanupTimers.set(
    sessionId,
    setTimeout(() => {
      runSessionCleanup(roomId, sessionId).catch((e) =>
        console.error("deleteSession:", e),
      );
    }, SESSION_CLEANUP_MS),
  );
}

function claimedSessionNamesForRoom(room, sessions) {
  const fromSessions = sessions.map((s) => s.sessionName).filter(Boolean);
  if (sessions.length > 0) {
    return fromSessions;
  }
  if (Array.isArray(room?.claimedSessionNames)) {
    return room.claimedSessionNames.filter(Boolean);
  }
  return [];
}

async function completeSessionWithApeScores(roomId, sessionId, scores) {
  if (!scores.length) throw new Error("No players in this session");
  await Promise.all(
    scores.map((sc) =>
      ensurePlayerDoc(sc.playerId ?? sc.id, sc.displayName),
    ),
  );
  const ids = scores.map((sc) => sc.playerId ?? sc.id);
  const ratings = await getPlayers(ids);
  const input = scores.map((sc) => {
    const id = sc.playerId ?? sc.id;
    return {
      id,
      displayName: sc.displayName,
      rating: ratings[id]
        ? {
            mu: ratings[id].mu,
            sigma: ratings[id].sigma,
            matchesPlayed: ratings[id].matchesPlayed || 0,
          }
        : newRating(),
      score: sc.tricksWon || 0,
    };
  });
  const results = rankMatch(input).map((r) => ({
    ...r,
    apeClass: apeClass(r.apeScore),
    apeStatus: apeStatus({
      mu: r.mu,
      sigma: r.sigma,
      matchesPlayed: r.matchesPlayed,
    }),
  }));
  await applyRankingResults(roomId, sessionId, results);
  return results;
}

function showRoomsFeedback(msg, kind = "error") {
  roomsError.textContent = msg;
  roomsError.hidden = !msg;
  roomsError.classList.remove(
    "form-feedback--error",
    "form-feedback--success",
    "form-feedback--info",
  );
  if (msg) {
    if (kind === "success") roomsError.classList.add("form-feedback--success");
    else if (kind === "info") roomsError.classList.add("form-feedback--info");
    else roomsError.classList.add("form-feedback--error");
    roomsError.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

/** @deprecated Use showRoomsFeedback(msg, kind) */
function showRoomsError(msg, kind) {
  showRoomsFeedback(msg, kind);
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
  stopPrivateHandSubscription();
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
  document.body.classList.remove("room-detail-open");
  roomDetailView.hidden = true;
  roomsListView.hidden = false;
  if (roomsIntro) roomsIntro.hidden = false;
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

async function onRemoveSessionPlayer(playerId, displayName) {
  if (!session || !currentRoomId || !openSessionId) return;
  if (session.uid !== currentRoom?.ownerId) {
    showRoomsError("Only the room owner can remove a guest or robot.");
    return;
  }
  const label = displayName?.trim() || "this player";
  if (!window.confirm(`Remove ${label} from this session?`)) return;
  showRoomsError("");
  try {
    await removeSessionPlayer(currentRoomId, openSessionId, playerId, session);
    openScores = openScores.filter((sc) => sc.playerId !== playerId);
    scheduleRenderRoomDetail();
    showRoomsError(`${label} was removed from the session.`, "success");
  } catch (err) {
    console.error("removeSessionPlayer:", err);
    showRoomsError(err?.message || "Could not remove player.");
  }
}

async function onKickMember(targetUserId, displayName) {
  if (!session || !currentRoomId) return;
  if (session.uid !== currentRoom?.ownerId) {
    showRoomsError("Only the room owner can remove members.");
    return;
  }
  const label = displayName?.trim() || "this player";
  if (!window.confirm(`Remove ${label} from this room? They can rejoin with the invite code.`)) {
    return;
  }
  showRoomsError("");
  try {
    await kickRoomMember(currentRoomId, targetUserId, session);
    showRoomsError(
      `${label} was removed from the room. They can rejoin with the invite code. Session score for this hand is kept.`,
    );
  } catch (err) {
    console.error("kickRoomMember:", err);
    const msg = err?.message || "";
    if (err?.code === "permission-denied") {
      showRoomsError(
        "Could not remove member — run npm run deploy:rules so owners can remove memberships.",
      );
    } else {
      showRoomsError(msg.slice(0, 120) || "Could not remove member.");
    }
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

const createRoomModal = $("#create-room-modal");
const createRoomForm = $("#create-room-form");

function openCreateRoomModal() {
  if (!createRoomModal || !createRoomForm) return;
  showRoomsError("");
  const nameEl = $("#create-room-name");
  if (nameEl) nameEl.value = "";
  for (const { id } of HOUSE_RULE_FIELDS) {
    const field = createRoomForm.querySelector(`#create-house-rule-${id}`);
    if (field) field.value = DEFAULT_HOUSE_RULES[id];
  }
  createRoomModal.hidden = false;
  document.body.classList.add("modal-open");
  if (nameEl) nameEl.focus();
}

function closeCreateRoomModal() {
  if (!createRoomModal) return;
  createRoomModal.hidden = true;
  document.body.classList.remove("modal-open");
}

$("#create-room").addEventListener("click", () => {
  if (!session) return;
  openCreateRoomModal();
});

if (createRoomForm) {
  createRoomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!session) return;
    showRoomsError("");
    const name = $("#create-room-name")?.value.trim() || "";
    const houseRules = readHouseRulesFromForm(createRoomForm, "create-house-rule-");
    try {
      const roomId = await createRoom({ owner: session, name, houseRules });
      await ensureInviteLookupForRoom(roomId);
      closeCreateRoomModal();
      openRoom(roomId);
    } catch (err) {
      console.error(err);
      showRoomsError("Could not create the room. Please try again.");
    }
  });
}

$$("[data-close-create-room]").forEach((el) => {
  el.addEventListener("click", closeCreateRoomModal);
});

$("#join-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!session) {
    showRoomsError("Sign in to join a room.");
    openAuth("signin");
    return;
  }
  showRoomsError("");
  const rawCode = $("#join-code").value;
  const code = rawCode.trim();
  if (!code) {
    showRoomsError("Enter an invite code.");
    return;
  }
  if (!isValidInviteCodeFormat(code)) {
    showRoomsError(
      `Invalid invite code "${formatInviteCodeDisplay(code)}". Use 6 characters like ABC-D23.`,
    );
    return;
  }
  const joinBtn = $("#join-form button[type='submit']");
  if (joinBtn) {
    joinBtn.disabled = true;
    joinBtn.dataset.busy = "true";
  }
  try {
    await ensureUserDoc(session);
    await ensurePlayerDoc(session.uid, session.displayName).catch((err) =>
      console.warn("ensurePlayerDoc on join:", err),
    );
    const roomId = await joinRoomByCode(code, session);
    $("#join-code").value = "";
    markPendingSelfJoin(roomId);
    openRoom(roomId);
    const roomName = currentRoom?.name;
    showRoomsError(roomName ? `Joined ${roomName}.` : "Joined room.", "success");
  } catch (err) {
    clearPendingSelfJoin();
    console.error("joinRoomByCode:", err);
    const fbCode = err && typeof err === "object" ? err.code : "";
    const msg = err && typeof err === "object" ? err.message : String(err);
    if (/invalid invite code/i.test(msg)) {
      showRoomsError(msg);
    } else if (/no room found/i.test(msg)) {
      showRoomsError(msg);
    } else if (/no longer valid|was deleted/i.test(msg)) {
      showRoomsError(msg);
    } else if (fbCode === "permission-denied") {
      showRoomsError(
        "Could not join this room — check that you are signed in and the invite code is correct. If it keeps failing, ask the host to re-open the room so the lookup syncs.",
      );
    } else if (/offline|network/i.test(msg)) {
      showRoomsError("Network error — check connection and try again.");
    } else if (/sign in/i.test(msg)) {
      showRoomsError(msg);
      openAuth("signin");
    } else {
      showRoomsError(`Could not join (${fbCode || "error"}). ${msg}`.slice(0, 200));
    }
  } finally {
    if (joinBtn) {
      joinBtn.disabled = false;
      joinBtn.dataset.busy = "false";
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
  roomGoneHandled = false;
  currentRoomId = roomId;
  currentRoom = null;
  currentMembers = [];
  currentSessions = [];
  openSessionId = null;
  openScores = [];

  document.body.classList.add("room-detail-open");
  roomsListView.hidden = true;
  if (roomsIntro) roomsIntro.hidden = true;
  roomDetailView.hidden = false;
  pendingRoomBuyInOverride = null;
  pendingRoomAnteOverride = null;
  userPickedNewSessionStake = false;
  roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;

  detailUnsubs.push(
    subscribeRoom(roomId, (room) => {
      if (!room) {
        handleRoomUnavailable(roomId);
        return;
      }
      currentRoom = room;
      if (room?.bourreSettings) {
        const roomBs = normalizeBourreSettings(room.bourreSettings);
        if (pendingRoomBuyInOverride != null && pendingRoomBuyInOverride === roomBs.buyInAmount) {
          pendingRoomBuyInOverride = null;
        }
        if (pendingRoomAnteOverride == null && !userPickedNewSessionStake) {
          pendingHandStake = roomBs.anteAmount;
        } else if (pendingRoomAnteOverride === roomBs.anteAmount) {
          pendingRoomAnteOverride = null;
        }
      }
      if (room && session?.uid === room.ownerId) {
        ensureInviteLookupForRoom(roomId).catch((e) =>
          console.error("ensureInviteLookupForRoom:", e),
        );
        ensureRoomSessionNamePool(roomId).catch((e) =>
          console.error("ensureRoomSessionNamePool:", e),
        );
      }
      scheduleRenderRoomDetail();
    }),
  );
  detailUnsubs.push(
    subscribeRoomMembers(roomId, (members) => {
      const isMember =
        session?.uid && members.some((m) => m.userId === session.uid);
      if (pendingSelfJoinRoomId === roomId && isMember) {
        clearPendingSelfJoin(roomId);
      }
      if (
        session?.uid &&
        currentRoomId === roomId &&
        !roomDetailView.hidden &&
        pendingSelfJoinRoomId !== roomId &&
        members.length > 0 &&
        !isMember
      ) {
        showRoomsError("You were removed from this room. You can rejoin with the invite code.");
        closeTablePlay();
        closeRoom();
        return;
      }
      currentMembers = members;
      scheduleSyncSessionMembers();
      scheduleRenderRoomDetail();
    }),
  );
  detailUnsubs.push(
    subscribeSessions(roomId, (sessions) => {
      for (const s of sessions) {
        pendingOpenSessions.delete(s.id);
      }
      currentSessions = mergeSessionsWithPending(sessions);
      restoreSessionCleanupTimers(roomId);
      if (openSessionId && !sessions.some((s) => s.id === openSessionId)) {
        if (pendingOpenSessions.has(openSessionId) || creatingSession) {
          scheduleRenderRoomDetail();
          return;
        }
        const nextId = resolveKeeperSessionId(sessions, openSessionId) ?? sessions[0]?.id ?? null;
        if (nextId) {
          openSession(nextId);
        } else {
          openSessionId = null;
          openScores = [];
          openHands = [];
        }
      }
      if (!openSessionId && sessions.length > 0) {
        openSession(sessions[0].id);
      } else {
        scheduleRenderRoomDetail();
      }
    }),
  );
}

async function handleRoomUnavailable(roomId) {
  if (roomGoneHandled || currentRoomId !== roomId) return;
  roomGoneHandled = true;
  showRoomsError(
    "This room no longer exists. Use the invite code field above to join a new room, or ask the host for a fresh code.",
  );
  if (session?.uid) {
    try {
      await leaveRoom(roomId, session);
    } catch (err) {
      console.warn("leaveRoom after deleted room:", err);
    }
  }
  closeRoom();
}

function closeRoom() {
  clearPendingSelfJoin();
  pendingOpenSessions.clear();
  clearDetailSubs();
  stopEnrollmentTimer();
  stopSessionCleanupTimers();
  closeTablePlay();
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

/** Sidebar HTML rebuild must not tear down the live table overlay React tree. */
function resetSessionPanelTableHost() {
  if (tablePlayOpen) return;
  bumpTableMountGeneration();
  unmountTableSessionHost();
}

function tableSessionHost() {
  if (!tablePlayOpen) return null;
  return $("#table-session-root");
}

function resolveOpenSessionObj(openSessionObj) {
  if (openSessionObj) return openSessionObj;
  return resolveActiveSession();
}

function updateTablePlayTitle(openSessionObj) {
  const titleEl = $("#table-play-overlay-title");
  if (!titleEl) return;
  if (!openSessionObj || openSessionObj.status === "final") {
    titleEl.textContent = "Live table";
    return;
  }
  titleEl.textContent = `Hand #${(openSessionObj.handCount ?? 0) + 1} · live table`;
}

function abortTablePlayStartup() {
  tablePlayOpen = false;
  cancelNextHandOpenTimer();
  stopEnrollmentTimer();
  const overlay = $("#table-play-overlay");
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("table-play-active");
  unmountTableSessionHost();
}

function showTableStartupFailure(analysis, err) {
  abortTablePlayStartup();
  const kind =
    err?.code === "enrollment-failed" ? "enrollment_failed" : analysis?.kind ?? "ready_enrollment";
  const message = tableStartupUserMessage({ ...analysis, kind }, err);
  setTableActionFeedback({ status: "error", message });
  showRoomsError(message);
  roomDetailView?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function openTablePlay() {
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  const readyCount = tableReadyPlayerCount(openSessionObj);
  let startupAnalysis = analyzeTableStartup(openSessionObj, readyCount);

  if (!startupAnalysis.canOpenTable) {
    showTableStartupFailure(startupAnalysis);
    return;
  }

  if (!currentRoomId || !openSessionId) {
    showTableStartupFailure(startupAnalysis, new Error("Open a room session first."));
    return;
  }

  try {
    const repaired = await prepareSessionForTableOpen(currentRoomId, openSessionId);
    const mergedSession = repaired
      ? { ...openSessionObj, ...repaired, id: openSessionId }
      : openSessionObj;
    startupAnalysis = analyzeTableStartup(mergedSession, readyCount);
    if (!startupAnalysis.canOpenTable) {
      showTableStartupFailure(startupAnalysis);
      return;
    }
    if (startupAnalysis.needsEnrollment) {
      await ensureHandEnrollment(currentRoomId, openSessionId);
    }
  } catch (err) {
    console.error("openTablePlay prepare:", err);
    showTableStartupFailure(startupAnalysis, err);
    return;
  }

  const overlay = $("#table-play-overlay");
  if (!overlay) return;
  tablePlayOpen = true;
  overlay.hidden = false;
  document.body.classList.add("table-play-active");
  updateTablePlayTitle(openSessionObj);
  await refreshTablePlayerRatings(openScores);

  const refreshed =
    (await refreshOpenSessionFromServer(currentRoomId, openSessionId)) ??
    currentSessions.find((s) => s.id === openSessionId) ??
    openSessionObj;
  await syncTableSession(refreshed);
  if (getSessionEnrollment(refreshed)?.active || sessionHasRobots()) {
    startEnrollmentTimer();
  }
  processRobotActions(refreshed, openScores);
  try {
    await overlay.requestFullscreen?.();
  } catch {
    /* fullscreen optional */
  }
  try {
    await screen.orientation?.lock?.("landscape");
  } catch {
    /* orientation lock optional */
  }
}

function closeTablePlay() {
  tablePlayOpen = false;
  cancelNextHandOpenTimer();
  stopEnrollmentTimer();
  const overlay = $("#table-play-overlay");
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("table-play-active");
  try {
    if (document.fullscreenElement) document.exitFullscreen?.();
  } catch {
    /* ignore */
  }
  try {
    screen.orientation?.unlock?.();
  } catch {
    /* ignore */
  }
  const openSessionObj = resolveOpenSessionObj();
  if (openSessionObj) {
    syncTableSession(openSessionObj);
  }
}

function bindTablePlayControls() {
  const overlay = $("#table-play-overlay");
  if (!overlay || overlay.dataset.bound) return;
  overlay.dataset.bound = "1";

  $("#close-table-play")?.addEventListener("click", () => {
    closeTablePlay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tablePlayOpen) closeTablePlay();
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      try {
        screen.orientation?.unlock?.();
      } catch {
        /* ignore */
      }
    }
  });

  roomDetailView.addEventListener("click", (e) => {
    if (e.target.closest("#open-table-play")) {
      e.preventDefault();
      openTablePlay().catch((err) => {
        console.error("openTablePlay:", err);
        const analysis = analyzeTableStartup(resolveOpenSessionObj(), tableReadyPlayerCount(resolveOpenSessionObj()));
        showTableStartupFailure(analysis, err);
      });
    }
  });
}

/** Room members drive robot enrollment, draw/play, and co-win votes while viewing. */
function processRobotActions(s, scores) {
  try {
    processRobotActionsInner(s, scores);
  } catch (e) {
    console.warn("processRobotActions:", e);
  }
}

function processRobotActionsInner(s, scores) {
  if (!currentRoomId || !openSessionId || !s || s.status === "final") return;
  const actorId = session?.uid;
  if (!actorId || robotActionInFlight) return;

  const robotScores = scores.filter(
    (sc) => sc.isRobot === true || isRobotPlayerId(sc.playerId),
  );
  if (!robotScores.length) return;

  const now = Date.now();
  const enrollment = getSessionEnrollment(s);
  if (enrollment?.active) {
    if (SERVER_HAND_AUTHORITY && tablePlayOpen) {
      advanceSessionBots(currentRoomId, openSessionId).catch((e) =>
        console.warn("advanceSessionBots:", e),
      );
    }
    if (!tablePlayOpen) return;
    if (enrollmentHasExpired(enrollment)) {
      timeoutHandEnrollmentTurn(currentRoomId, openSessionId).catch((e) =>
        console.warn("enrollment timeout:", e),
      );
      return;
    }
    const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
    if (
      currentId &&
      isRobotPlayerId(currentId) &&
      !(enrollment.enrolledIds || []).includes(currentId)
    ) {
      robotActionInFlight = true;
      setHandParticipation(currentRoomId, openSessionId, {
        playerId: currentId,
        inHand: true,
        actorId,
      })
        .catch((e) => console.warn("robot enroll:", e))
        .finally(() => {
          robotActionInFlight = false;
        });
    }
    return;
  }

  if (now - lastRobotTrickAt < ROBOT_TRICK_INTERVAL_MS) return;

  const pending = s.pendingCoWinSettlement;
  if (pending?.winnerIds?.length >= 2) {
    const winners = pending.winnerIds;
    const votes = pending.votes || {};
    const botWinner = winners.find(
      (id) => isRobotPlayerId(id) && votes[id] !== "split" && votes[id] !== "push",
    );
    if (botWinner) {
      robotActionInFlight = true;
      voteCoWinSettlement(currentRoomId, openSessionId, {
        participantIds: pending.participantIds || getSessionCurrentHand(s)?.participantIds || [],
        winnerIds: winners,
        voterId: botWinner,
        choice: "push",
        recordedBy: actorId,
      })
        .catch((e) => console.warn("robot co-win vote:", e))
        .finally(() => {
          robotActionInFlight = false;
        });
    }
    return;
  }

  const currentHand = getSessionCurrentHand(s);
  const participants = currentHand.participantIds || [];
  if (!participants.length) return;

  const handPhase = currentHand.phase;
  if (now - lastRobotTrickAt < ROBOT_TRICK_INTERVAL_MS) return;

  if (handPhase === "draw") {
    const turnId = currentHand.turnPlayerId;
    const drawDone = currentHand.drawCompletedIds || [];
    if (
      turnId &&
      isRobotPlayerId(turnId) &&
      participants.includes(turnId) &&
      !drawDone.includes(turnId)
    ) {
      lastRobotTrickAt = now;
      robotActionInFlight = true;
      robotSubmitDraw(currentRoomId, openSessionId, {
        playerId: turnId,
        actorId,
        dealingRule: currentRoom?.houseRules?.dealing,
      })
        .catch((e) => console.warn("robot draw:", e))
        .finally(() => {
          robotActionInFlight = false;
        });
    }
    return;
  }

  if (handPhase === "play") {
    const turnId = currentHand.turnPlayerId;
    const trick = currentHand.currentTrick;
    const trickNum = trick?.trickNumber ?? 0;
    const trickPlays = trick?.plays?.length ?? 0;
    const tricks = currentHand.tricksByPlayer || {};
    const total = totalTricksPlayed(tricks, participants);
    if (total >= MAX_TRICKS_PER_HAND) return;

    // Premium table: winner of trick 4 auto-leads trick 5 (final trick opener).
    if (
      trickNum === 5 &&
      trickPlays === 0 &&
      turnId &&
      participants.includes(turnId)
    ) {
      lastRobotTrickAt = now;
      robotActionInFlight = true;
      robotPlayCard(currentRoomId, openSessionId, { playerId: turnId, actorId })
        .catch((e) => console.warn("auto trick-5 lead:", e))
        .finally(() => {
          robotActionInFlight = false;
        });
      return;
    }

    if (turnId && isRobotPlayerId(turnId) && participants.includes(turnId)) {
      lastRobotTrickAt = now;
      robotActionInFlight = true;
      robotPlayCard(currentRoomId, openSessionId, { playerId: turnId, actorId })
        .catch((e) => console.warn("robot play:", e))
        .finally(() => {
          robotActionInFlight = false;
        });
    }
    return;
  }

  // Legacy manual trick tracking when cards have not been dealt (no draw/play phase).
  const tricks = currentHand.tricksByPlayer || {};
  const total = totalTricksPlayed(tricks, participants);
  if (total >= MAX_TRICKS_PER_HAND) return;

  const botsInHand = robotScores
    .map((sc) => sc.playerId)
    .filter((id) => participants.includes(id));
  if (!botsInHand.length) return;

  const { ready, winnerIds, maxTricks } = deriveWinnersFromTricks(tricks, participants);
  let targetBot = null;

  if (!ready || maxTricks === 0) {
    targetBot = botsInHand[0];
  } else {
    const botsNotLeading = botsInHand.filter((id) => !winnerIds.includes(id));
    if (botsNotLeading.length) {
      targetBot = botsNotLeading.reduce(
        (min, id) => (tricksForPlayer(tricks, id) < tricksForPlayer(tricks, min) ? id : min),
        botsNotLeading[0],
      );
    } else {
      targetBot = botsInHand.reduce(
        (min, id) => (tricksForPlayer(tricks, id) < tricksForPlayer(tricks, min) ? id : min),
        botsInHand[0],
      );
    }
  }

  if (!targetBot || tricksForPlayer(tricks, targetBot) >= MAX_TRICKS_PER_HAND) return;

  lastRobotTrickAt = now;
  robotActionInFlight = true;
  updateHandTrick(currentRoomId, openSessionId, targetBot, 1, actorId)
    .catch((e) => console.warn("robot trick:", e))
    .finally(() => {
      robotActionInFlight = false;
    });
}

function buildEnrollmentLeaderLabel(displayScores, enrollment, myUid) {
  const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
  const name = displayScores.find((sc) => sc.playerId === currentId)?.displayName || "Player";
  const sec = enrollmentSecondsLeft(enrollment);
  if (currentId === myUid) {
    return `Your turn — tap I'm in (${sec}s)`;
  }
  return `Waiting for ${name} (${sec}s) — clockwise from dealer`;
}

function buildTableLeaderLabel(
  displayScores,
  participantIds,
  tricksThisHand,
  activeWinnerIds,
  handReady,
  maxTricks,
  handComplete,
  totalTricks,
  phase,
  trumpSuit,
) {
  const suitNames = {
    spades: "Spades",
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
  };
  if (phase === "draw") {
    const suitLabel = suitNames[trumpSuit] || trumpSuit || "—";
    return `Trump ${suitLabel} · draw round — discard up to 5 cards or stand pat`;
  }
  if (phase === "play") {
    const suitLabel = suitNames[trumpSuit] || trumpSuit || "—";
    return `Trump ${suitLabel} · tap a legal card to play (${totalTricks}/5 tricks)`;
  }
  if (!participantIds.length) return "Tap I'm in when you're ready to play.";
  if (handComplete && handReady && activeWinnerIds.length === 1) {
    const name =
      displayScores.find((sc) => sc.playerId === activeWinnerIds[0])?.displayName || "Winner";
    const bourreIds = bourrePlayerIds(tricksThisHand, participantIds);
    if (bourreIds.length) {
      const bourreNames = bourreIds
        .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
        .join(" & ");
      return `${name} wins (${maxTricks} tricks) · Bourré: ${bourreNames}`;
    }
    return `${name} wins (${maxTricks} tricks)`;
  }
  if (handComplete && handReady && activeWinnerIds.length >= 2) {
    const names = activeWinnerIds
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Tie — ${names} (${maxTricks} tricks each) · pot carries (no split)`;
  }
  if (handReady && activeWinnerIds.length === 1) {
    const name =
      displayScores.find((sc) => sc.playerId === activeWinnerIds[0])?.displayName || "Leader";
    return `${name} leads (${maxTricks} tricks) — play out to 5 (${totalTricks}/5 played)`;
  }
  if (handReady && activeWinnerIds.length >= 2) {
    const names = activeWinnerIds
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Tie at ${maxTricks} — finish all 5 tricks (${totalTricks}/5 played)`;
  }
  const winHint = tricksToWinHint(participantIds.length);
  return `Tap + when you take a trick (${totalTricks}/5 played · most tricks wins, can be ${winHint} with ${participantIds.length} in)`;
}

function buildTableSessionProps(s) {
  const mergedScores = mergeScoresWithMembers(openScores, currentMembers, s.players || []);
  const memberOrder = currentMembers.map((m) => ({ playerId: m.userId }));
  const sessionOrder = (s.players || []).map((p) => ({ playerId: p.playerId }));
  const playerOrder = memberOrder.length ? memberOrder : sessionOrder;
  const displayScores = sortScoresForDisplay(mergedScores, playerOrder);
  const currentHand = getSessionCurrentHand(s);
  const handParticipantIds = currentHand?.participantIds || [];
  const handPhase = currentHand?.phase ?? null;
  const trumpSuit = currentHand?.trumpSuit ?? null;
  const trumpUpcard = currentHand?.trumpUpcard ?? null;
  const tricksThisHand = currentHand?.tricksByPlayer || {};
  const cardsDealt = handPhase === "draw" || handPhase === "play";
  const myUid = session?.uid ?? null;
  const privateHeroCards = openPrivateHand?.cards ?? [];
  const heroCardList =
    myUid && cardsDealt
      ? buildHeroCardsForTable(currentHand, privateHeroCards, myUid, handPhase)
      : privateHeroCards;
  const legalPlayIndices =
    cardsDealt && handPhase === "play" && myUid === currentHand?.turnPlayerId
      ? computeLegalPlayIndices(currentHand, privateHeroCards, myUid)
      : null;
  const handStake = s.handStake ?? 1;
  const isFinal = s.status === "final";
  const dealerId = s.dealerId ?? null;
  const enrollment = getSessionEnrollment(s);
  const enrollmentActive = enrollment?.active === true;
  const enrolledDuringSignup = enrollment?.enrolledIds || [];
  const declinedEnrollmentIds = enrollment?.declinedIds || [];
  const currentEnrollmentPlayerId = enrollmentActive
    ? enrollment.orderedPlayerIds?.[enrollment.currentIndex]
    : null;

  const { ready: handReady, winnerIds: derivedWinnerIds, maxTricks } = deriveWinnersFromTricks(
    tricksThisHand,
    handParticipantIds,
  );
  const totalTricks = totalTricksPlayed(tricksThisHand, handParticipantIds);
  const handComplete = isHandComplete(tricksThisHand, handParticipantIds);
  const pendingWinners = s.pendingCoWinSettlement?.winnerIds;
  const activeWinnerIds =
    handReady && derivedWinnerIds.length > 0
      ? derivedWinnerIds
      : pendingWinners?.length
        ? pendingWinners
        : [];

  const scoreById = Object.fromEntries(displayScores.map((x) => [x.playerId, x]));
  const postedAntes = currentHand?.postedAntes ?? {};
  const antePot = handParticipantIds.reduce(
    (sum, pid) => sum + (postedAntes[pid] ?? playerHandStake(scoreById, pid, handStake)),
    0,
  );
  const limEnabled = s.limEnabled === true;
  const potState = computeHandPotState({
    anteAmount: handStake,
    limEnabled,
    carryIn: s.carryOverPot ?? 0,
    antePot,
  });
  const potMetrics = {
    anteAmount: potState.anteAmount,
    potCap: potState.potCap,
    currentPot: potState.currentPot,
    maxWinThisHand: potState.maxWinThisHand,
    limEnabled: potState.limEnabled,
    overflow: potState.overflow,
  };

  const showCoWinSettlement =
    handComplete &&
    ((handReady && derivedWinnerIds.length >= 2) ||
      (s.pendingCoWinSettlement?.winnerIds?.length >= 2 && activeWinnerIds.length >= 2));
  const coWinnerCount = showCoWinSettlement ? activeWinnerIds.length : 0;
  const splitSharePerWinner =
    coWinnerCount >= 2 ? potMetrics.maxWinThisHand / coWinnerCount : 0;

  const myHandContribution =
    myUid != null && handParticipantIds.includes(myUid)
      ? playerHandStake(scoreById, myUid, handStake)
      : myUid != null
        ? 0
        : null;

  const sessionBuyIn = s.buyInAmount ?? normalizeBourreSettings(currentRoom?.bourreSettings).buyInAmount;
  const lastHand = openHands[0];
  const recentBourreIds =
    lastHand && lastHand.handNumber === (s.handCount ?? 0)
      ? (lastHand.bourreIds || []).filter(Boolean)
      : [];

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
      handEnrollment: enrollmentActive ? enrollment : null,
      phase: handPhase,
      trumpHolderId: currentHand?.trumpHolderId ?? dealerId,
      trumpSuit,
      trumpUpcard,
      turnPlayerId: currentHand?.turnPlayerId ?? null,
      remainingDeckCount: currentHand?.remainingDeckCount ?? null,
      leadSuit: currentHand?.leadSuit ?? null,
      currentTrick: currentHand?.currentTrick ?? null,
      playedCards: currentHand?.playedCards ?? [],
      drawCompletedIds: currentHand?.drawCompletedIds ?? [],
      maxDrawDiscards: currentHand?.maxDrawDiscards ?? null,
      cinchEnabled: currentHand?.cinchEnabled === true,
      postedAntes: currentHand?.postedAntes ?? {},
    },
    heroCards: heroCardList,
    rawHeroCards: privateHeroCards,
    privateHandReady: privateHandSnapSeen,
    handComplete,
    legalPlayIndices,
    actionFeedback: tableActionFeedback,
    players: displayScores.map((sc) => {
      const isSelf = sc.playerId === myUid;
      const onEnrollmentClock =
        enrollmentActive && sc.playerId === currentEnrollmentPlayerId;
      const enrollmentMsLeftVal = onEnrollmentClock ? enrollmentMsLeft(enrollment) : 0;
      const rating = openPlayerRatings[sc.playerId];
      const apeScoreVal = rating?.apeScore;
      return {
        playerId: sc.playerId,
        displayName: sc.displayName,
        photoURL: isSelf ? session?.photoURL : null,
        handsWon: sc.handsWon ?? 0,
        sessionStreak: sc.handsWon ?? 0,
        ...(rating && !isRobotPlayerId(sc.playerId)
          ? {
              apeScore: apeScoreVal ?? 0,
              apeClass: rating.apeClass ?? apeClass(apeScoreVal ?? 0),
              apeStatus: rating.apeStatus ?? apeStatus(rating),
            }
          : {}),
        ...(isSelf ? { net: sc.net ?? 0 } : {}),
        bankroll: scoreBankroll(sc, sessionBuyIn),
        isOut: sc.out === true || scoreBankroll(sc, sessionBuyIn) <= 0,
        ...(isSelf && sc.perHandStake != null ? { perHandStake: sc.perHandStake } : {}),
        inHand:
          handParticipantIds.includes(sc.playerId) ||
          enrolledDuringSignup.includes(sc.playerId),
        tricksThisHand: tricksThisHand[sc.playerId] ?? 0,
        isSelf,
        isDealer: sc.playerId === dealerId,
        isLeading: !handComplete && handReady && activeWinnerIds.includes(sc.playerId),
        isWinner: handComplete && handReady && activeWinnerIds.includes(sc.playerId),
        enrollmentOnClock: onEnrollmentClock,
        enrollmentTimeLeft: onEnrollmentClock
          ? enrollmentMsLeftVal / HAND_ENROLLMENT_MS
          : undefined,
        enrollmentSecondsOnClock: onEnrollmentClock
          ? enrollmentSecondsLeft(enrollment)
          : undefined,
        enrollmentSatOut: declinedEnrollmentIds.includes(sc.playerId),
        enrollmentJoined: enrolledDuringSignup.includes(sc.playerId),
        isRobot: sc.isRobot === true || isRobotPlayerId(sc.playerId),
        showHoleCards:
          cardsDealt && handParticipantIds.includes(sc.playerId) && sc.playerId !== myUid,
        holeCardCount: cardsDealt
          ? displayHoleCardCount(currentHand || {}, sc.playerId, false)
          : 0,
        isOnTurn: cardsDealt && currentHand?.turnPlayerId === sc.playerId,
        canToggleInHand:
          enrollmentActive &&
          isSelf &&
          !isFinal &&
          sc.playerId === currentEnrollmentPlayerId &&
          scoreBankroll(sc, sessionBuyIn) > 0 &&
          sc.out !== true,
        canPassEnrollment:
          enrollmentActive &&
          isSelf &&
          !isFinal &&
          sc.playerId === currentEnrollmentPlayerId &&
          !declinedEnrollmentIds.includes(sc.playerId),
        canEditTricks:
          !cardsDealt &&
          !isFinal &&
          handParticipantIds.includes(sc.playerId) &&
          isSelf &&
          !handComplete &&
          totalTricks < MAX_TRICKS_PER_HAND,
      };
    }),
    potMetrics,
    mySessionNet:
      myUid != null
        ? Number(displayScores.find((sc) => sc.playerId === myUid)?.net) || 0
        : null,
    myHandContribution,
    leaderLabel: enrollmentActive
      ? buildEnrollmentLeaderLabel(displayScores, enrollment, myUid)
      : buildTableLeaderLabel(
          displayScores,
          handParticipantIds,
          tricksThisHand,
          activeWinnerIds,
          handReady,
          maxTricks,
          handComplete,
          totalTricks,
          handPhase,
          trumpSuit,
        ),
    enrollmentActive,
    enrollmentSecondsLeft: enrollmentActive ? enrollmentSecondsLeft(enrollment) : 0,
    showCoWinSettlement,
    splitSharePerWinner,
    recentBourreIds,
    voteStatus: renderSettlementVoteStatus(s, displayScores, activeWinnerIds),
    currentUserId: myUid,
    actions: {
      onToggleInHand: (inHand) => {
        if (!session?.uid || !currentRoomId || !openSessionId) {
          setTableActionFeedback({ status: "error", message: "Sign in to join the hand." });
          return;
        }
        setTableActionFeedback({ status: "loading", message: inHand ? "Joining hand…" : "Passing hand…" });
        setHandParticipation(currentRoomId, openSessionId, {
          playerId: session.uid,
          inHand,
          actorId: session.uid,
        })
          .then(() => {
            setTableActionFeedback({
              status: "success",
              message: inHand ? "You're in this hand." : "You passed this hand.",
            });
          })
          .catch((e) => {
            const message = e.message || "Could not update hand participation";
            setTableActionFeedback({ status: "error", message });
            showRoomsError(message);
          });
      },
      onPassEnrollment: () => {
        if (!session?.uid || !currentRoomId || !openSessionId) {
          setTableActionFeedback({ status: "error", message: "Sign in to pass." });
          return;
        }
        setTableActionFeedback({ status: "loading", message: "Passing hand…" });
        setHandParticipation(currentRoomId, openSessionId, {
          playerId: session.uid,
          inHand: false,
          actorId: session.uid,
        })
          .then(() => {
            setTableActionFeedback({ status: "success", message: "You passed this hand." });
          })
          .catch((e) => {
            const message = e.message || "Could not pass this hand";
            setTableActionFeedback({ status: "error", message });
            showRoomsError(message);
          });
      },
      onTrickDelta: (delta) => {
        if (!session?.uid || !currentRoomId || !openSessionId) return;
        updateHandTrick(currentRoomId, openSessionId, session.uid, delta, session.uid).catch(
          (e) => showRoomsError(e.message || "Could not update tricks"),
        );
      },
      onSubmitDraw: (discardIndices) => {
        if (!session?.uid || !currentRoomId || !openSessionId) {
          return Promise.reject(new Error("Sign in to draw"));
        }
        const maxDraw = currentHand?.maxDrawDiscards ?? 5;
        if (discardIndices.length > maxDraw) {
          const err = new Error(`You may discard at most ${maxDraw} cards`);
          setTableActionFeedback({ status: "error", message: err.message });
          return Promise.reject(err);
        }
        setTableActionFeedback({
          status: "loading",
          message: discardIndices.length ? `Drawing ${discardIndices.length}…` : "Standing pat…",
        });
        return submitHandDraw(currentRoomId, openSessionId, {
          playerId: session.uid,
          discardIndices,
          actorId: session.uid,
        })
          .then(() => {
            if (discardIndices.length > 0) {
              pendingDrawShuffle = true;
            }
            setTableActionFeedback({
              status: "success",
              message: discardIndices.length
                ? `Drew ${discardIndices.length} replacement card(s)`
                : "Standing pat",
            });
          })
          .catch((e) => {
            setTableActionFeedback({
              status: "error",
              message: e.message || "Could not submit draw",
            });
            throw e;
          });
      },
      onPassDraw: () => {
        if (!session?.uid || !currentRoomId || !openSessionId) {
          return Promise.reject(new Error("Sign in to draw"));
        }
        setTableActionFeedback({ status: "loading", message: "Standing pat…" });
        return submitHandDraw(currentRoomId, openSessionId, {
          playerId: session.uid,
          discardIndices: [],
          actorId: session.uid,
        })
          .then(() => {
            setTableActionFeedback({ status: "success", message: "Standing pat" });
          })
          .catch((e) => {
            setTableActionFeedback({
              status: "error",
              message: e.message || "Could not stand pat",
            });
            throw e;
          });
      },
      onPlayCard: (cardIndex) => {
        if (!session?.uid || !currentRoomId || !openSessionId) {
          return Promise.reject(new Error("Sign in to play"));
        }
        setTableActionFeedback({ status: "loading", message: "Playing card…" });
        return playHandCard(currentRoomId, openSessionId, {
          playerId: session.uid,
          cardIndex,
          actorId: session.uid,
        })
          .then(() => {
            tableActionFeedback = null;
            const sessionObj = currentSessions.find((x) => x.id === openSessionId);
            if (sessionObj) {
              scheduleTableSessionSync(sessionObj);
              processRobotActions(sessionObj, openScores);
            }
          })
          .catch((e) => {
            setTableActionFeedback({
              status: "error",
              message: e.message || "Could not play card",
            });
            throw e;
          });
      },
      onSettle: (choice) => onSettleHand(choice),
    },
  };
}

async function syncTableSession(openSessionObj, { attempt = 0 } = {}) {
  const sessionObj = resolveOpenSessionObj(openSessionObj);
  const mountGen = tableMountGeneration;

  if (!sessionObj || sessionObj.status === "final" || tableReadyPlayerCount(sessionObj) < 2) {
    unmountTableSessionHost();
    if (
      tablePlayOpen &&
      sessionObj &&
      (sessionObj.status === "final" || tableReadyPlayerCount(sessionObj) < 2)
    ) {
      closeTablePlay();
    }
    return;
  }

  if (!tablePlayOpen) {
    unmountTableSessionHost();
    return;
  }

  const host = tableSessionHost();
  if (!host) {
    if (attempt < 8) {
      requestAnimationFrame(() => syncTableSession(openSessionObj, { attempt: attempt + 1 }));
    }
    return;
  }

  updateTablePlayTitle(sessionObj);

  try {
    const api = await loadTableMount();
    if (mountGen !== tableMountGeneration) return;
    const liveHost = tableSessionHost();
    if (!liveHost) {
      if (attempt < 8) {
        requestAnimationFrame(() => syncTableSession(openSessionObj, { attempt: attempt + 1 }));
      }
      return;
    }
    api.mountTableSession(liveHost, buildTableSessionProps(sessionObj));
    void processTableFeedbackEvents(sessionObj);
    if (getSessionEnrollment(sessionObj)?.active || sessionHasRobots()) {
      if (tablePlayOpen) startEnrollmentTimer();
      else stopEnrollmentTimer();
    } else {
      stopEnrollmentTimer();
    }
    maybeRecoverHandLifecycle(sessionObj);
  } catch (err) {
    console.error("table-session mount:", err);
    const detail = err instanceof Error ? err.message : String(err);
    host.innerHTML = `<p class="muted small">Table UI failed to load (${escapeHtml(detail)}). Run <code>npm run build:table</code>, refresh, and redeploy if this persists.</p>`;
  }
}

function scheduleTableSessionSync(openSessionObj) {
  cancelAnimationFrame(tableSyncFrame);
  tableSyncFrame = requestAnimationFrame(() => {
    syncTableSession(openSessionObj);
  });
}

function stopPrivateHandSubscription() {
  if (privateHandUnsub) {
    privateHandUnsub();
    privateHandUnsub = null;
  }
  openPrivateHand = null;
  privateHandSnapSeen = false;
}

function startPrivateHandSubscription() {
  stopPrivateHandSubscription();
  if (!session?.uid || !currentRoomId || !openSessionId) return;
  privateHandUnsub = subscribePrivateHand(
    currentRoomId,
    openSessionId,
    session.uid,
    (data) => {
      privateHandSnapSeen = true;
      openPrivateHand = data;
      const sessionObj = currentSessions.find((x) => x.id === openSessionId);
      if (sessionObj) scheduleTableSessionSync(sessionObj);
    },
    (err) => {
      privateHandSnapSeen = true;
      console.error("privateHand subscription:", err);
      setTableActionFeedback({
        status: "error",
        message: err?.message || "Could not load your private hand",
      });
      const sessionObj = currentSessions.find((x) => x.id === openSessionId);
      if (sessionObj) scheduleTableSessionSync(sessionObj);
    },
  );
}

function openSession(sessionId) {
  if (scoresUnsub) scoresUnsub();
  if (handsUnsub) handsUnsub();
  stopPrivateHandSubscription();
  openSessionId = sessionId;
  openScores = [];
  openHands = [];
  tableFeedbackSnapshot = null;
  pendingDrawShuffle = false;
  scoresUnsub = subscribeScores(currentRoomId, sessionId, (scores) => {
    openScores = scores;
    refreshTablePlayerRatings(scores).catch((e) => console.warn("player ratings:", e));
    scheduleSyncSessionMembers();
    scheduleRenderRoomDetail();
  });
  handsUnsub = subscribeHands(currentRoomId, sessionId, (hands) => {
    openHands = hands;
    scheduleRenderRoomDetail();
  });
  startPrivateHandSubscription();
  renderRoomDetail();
  if (currentMembers.length > 0) {
    syncSessionWithRoomMembers(currentRoomId, sessionId, currentMembers)
      .then(() => ensureCurrentHandParticipants(currentRoomId, sessionId))
      .catch((e) => console.error("openSession sync:", e));
  }
}

function renderCreatedSessionTabs(pool, sessions, activeSessionId) {
  const created = createdSessionsForTabs(pool, sessions);
  if (created.length === 0) {
    return `<p class="muted small">No regional tables yet. Tap <strong>+ New session</strong> to open one — up to ${MAX_ROOM_SESSIONS} per room.</p>`;
  }
  return created
    .map((sessionObj) => {
      const active = sessionObj.id === activeSessionId;
      return `<button type="button" class="session-tab ${active ? "is-active" : ""}" data-open-session="${sessionObj.id}" aria-label="${escapeHtml(sessionTabLabel(sessionObj))}">${escapeHtml(sessionTabLabel(sessionObj))}</button>`;
    })
    .join("");
}

function scheduleRenderRoomDetail() {
  const open = currentSessions.find((s) => s.id === openSessionId);
  if (open) maybeRecoverHandLifecycle(open);
  if (renderRoomDetailTimer) clearTimeout(renderRoomDetailTimer);
  renderRoomDetailTimer = window.setTimeout(() => {
    renderRoomDetailTimer = 0;
    renderRoomDetail();
  }, 80);
}

function renderRoomDetail() {
  if (!currentRoomId || roomDetailView.hidden) return;
  if (!currentRoom) {
    roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;
    return;
  }

  // Preserve in-progress form state across snapshot re-renders.
  const activeEl = document.activeElement;
  const editingNotes =
    activeEl && activeEl.id === "session-notes"
      ? {
          value: activeEl.value,
          start: activeEl.selectionStart,
          end: activeEl.selectionEnd,
        }
      : null;
  const editingHouseRule =
    activeEl && activeEl.dataset?.houseRule
      ? {
          id: activeEl.id,
          value: activeEl.value,
          start: activeEl.selectionStart,
          end: activeEl.selectionEnd,
        }
      : null;
  const editingAddPlayer =
    activeEl && activeEl.id === "add-player-name"
      ? {
          value: activeEl.value,
          robotChecked: $("#add-player-robot", roomDetailView)?.checked === true,
        }
      : null;
  const hr = currentRoom.houseRules || {};
  const bourreSettings = normalizeBourreSettings(
    currentRoom.bourreSettings || DEFAULT_BOURRE_SETTINGS,
  );
  const openSessionObj = resolveActiveSession();
  const isOwner = session?.uid === currentRoom.ownerId;
  const visibleMembers = currentMembers;
  const rosterEntries = buildRoomRosterEntries(visibleMembers, openScores, openSessionObj);
  const roomBuyInAmount = pendingRoomBuyInOverride ?? bourreSettings.buyInAmount;
  const roomAnteAmount = pendingRoomAnteOverride ?? bourreSettings.anteAmount;
  const sessionPool = isValidSessionNamePool(currentRoom.sessionNamePool)
    ? currentRoom.sessionNamePool
    : [];
  const claimedNames = claimedSessionNamesForRoom(currentRoom, currentSessions);
  const sessionHardCap = currentSessions.length >= MAX_ROOM_SESSIONS;
  const canCreateSession =
    isOwner &&
    !sessionHardCap &&
    canCreateAnotherSession(currentSessions.length, sessionPool, claimedNames);
  const showNewSessionAnte = isOwner && canCreateSession;
  const newSessionDisabledReason = !isOwner
    ? ""
    : sessionHardCap
      ? "All 4 regional tables are already open."
      : !canCreateSession
        ? "No preset table names available — try again in a moment."
        : "";
  const sessionCapReached = isOwner && sessionHardCap;

  roomDetailView.innerHTML = `
    <button class="link-back" id="back-to-rooms">← All rooms</button>
    <div class="room-detail__head">
      <div>
        <h3 class="room-detail__title">${escapeHtml(currentRoom.name)}</h3>
        <span class="badge badge--${escapeHtml(currentRoom.status)}">${escapeHtml(currentRoom.status)}</span>
      </div>
      <div class="room-detail__code">
        <span class="muted">Invite code</span>
        <strong data-testid="room-invite-code">${escapeHtml(currentRoom.inviteCode)}</strong>
      </div>
      ${
        session?.uid === currentRoom.ownerId
          ? `<button type="button" class="btn btn--sm btn--danger" id="delete-room">Delete room</button>`
          : `<button type="button" class="btn btn--sm btn--danger" id="leave-room">Leave room</button>`
      }
    </div>

    <div class="room-detail__grid">
      <section class="subpanel subpanel--bourre-settings">
        <h4>Bourré settings</h4>
        ${
          isOwner
            ? `<div class="bourre-settings-form">
                 <label class="bourre-settings__row">
                   <span class="bourre-settings__label">Buy-in</span>
                   <select class="num-select" id="room-buy-in-amount" aria-label="Room buy-in amount">
                     ${RISK_STAKE_OPTIONS.map(
                       (n) =>
                         `<option value="${n}" ${n === roomBuyInAmount ? "selected" : ""}>${formatRiskStake(n)}</option>`,
                     ).join("")}
                   </select>
                 </label>
                 <label class="bourre-settings__row">
                   <span class="bourre-settings__label">Ante</span>
                   <select class="num-select" id="room-ante-amount" aria-label="Per-hand ante amount">
                     ${RISK_STAKE_OPTIONS.map(
                       (n) =>
                         `<option value="${n}" ${n === roomAnteAmount ? "selected" : ""}>${formatRiskStake(n)}</option>`,
                     ).join("")}
                   </select>
                 </label>
                 <label class="bourre-settings__row bourre-settings__lim">
                   <input type="checkbox" id="room-lim-enabled" ${bourreSettings.limEnabled ? "checked" : ""} />
                   <span>LmT</span>
                   <span class="muted small">Pot cap 20× ante · overflow → next hand</span>
                 </label>
                 <label class="bourre-settings__row bourre-settings__lim">
                   <input type="checkbox" id="room-rebuy-enabled" ${bourreSettings.rebuyEnabled ? "checked" : ""} />
                   <span>Rebuy</span>
                   <span class="muted small">Allow manual top-up when bankroll hits zero</span>
                 </label>
                 <p class="muted small">Applies to new sessions. Buy-in is each player&apos;s starting stack; ante is the per-hand contribution to the pot.</p>
               </div>`
            : `<ul class="kv">
                 <li><span>Buy-in</span><span>${escapeHtml(formatRiskStake(bourreSettings.buyInAmount))}</span></li>
                 <li><span>Ante</span><span>${escapeHtml(formatRiskStake(bourreSettings.anteAmount))}</span></li>
                 ${
                   bourreSettings.limEnabled
                     ? `<li><span>Pot cap</span><span>${escapeHtml(formatRiskStake(bourreSettings.potCap))}</span></li>`
                     : ""
                 }
                 <li><span>LmT</span><span>${bourreSettings.limEnabled ? "On" : "Off"}</span></li>
                 <li><span>Rebuy</span><span>${bourreSettings.rebuyEnabled ? "On" : "Off"}</span></li>
               </ul>`
        }
      </section>

      <section class="subpanel">
        <h4>House rules</h4>
        ${isOwner ? renderHouseRulesEditor(hr) : renderHouseRulesReadOnly(hr)}
      </section>

      <section class="subpanel">
        <h4>Members &amp; players (${rosterEntries.length})</h4>
        <p class="muted small members__hint">Signed-in room members plus guests and robots on the open session.</p>
        <ul class="members">
          ${rosterEntries
            .map((entry) => {
              const uid = entry.playerId || "";
              const canKick =
                entry.kind === "member" &&
                isOwner &&
                uid &&
                uid !== currentRoom.ownerId &&
                uid !== session?.uid;
              const canRemoveSessionPlayer =
                (entry.kind === "robot" || entry.kind === "guest") &&
                isOwner &&
                uid &&
                openSessionObj &&
                openSessionObj.status !== "final";
              const roleLabel =
                entry.role === "owner"
                  ? "owner"
                  : entry.role === "robot"
                    ? "robot"
                    : entry.role === "guest"
                      ? "guest"
                      : "player";
              return `<li class="members__row" data-testid="roster-entry-${escapeHtml(entry.kind)}">
                <span class="dot${entry.kind === "robot" ? " dot--robot" : entry.kind === "guest" ? " dot--guest" : ""}"></span>
                <span class="members__name">${escapeHtml(entry.displayName)}</span>
                <em class="members__role">${escapeHtml(roleLabel)}</em>
                ${
                  canKick
                    ? `<button type="button" class="btn btn--sm btn--danger members__kick" data-kick-member="${escapeHtml(uid)}" data-kick-name="${escapeHtml(entry.displayName)}" aria-label="Remove ${escapeHtml(entry.displayName)} from room">Remove</button>`
                    : canRemoveSessionPlayer
                      ? `<button type="button" class="btn btn--sm btn--danger members__kick" data-remove-session-player="${escapeHtml(uid)}" data-remove-session-name="${escapeHtml(entry.displayName)}" aria-label="Remove ${escapeHtml(entry.displayName)} from session">Remove</button>`
                      : ""
                }
              </li>`;
            })
            .join("")}
        </ul>
      </section>
    </div>

    <section class="subpanel">
      <div class="subpanel__head">
        <h4>Regional tables</h4>
        <p class="muted small session-preset-note">Each room can open up to ${MAX_ROOM_SESSIONS} regional tables. The next table name is assigned when you tap <strong>+ New session</strong>.</p>
        <div class="session-new">
          ${
            isOwner
              ? `${
                  showNewSessionAnte
                    ? `<label class="session-new__stake">
                   <span class="muted">Ante</span>
                   <select class="num-select" id="new-session-stake" aria-label="Ante for new session">
                     ${RISK_STAKE_OPTIONS.map(
                       (n) =>
                         `<option value="${n}" ${n === pendingHandStake ? "selected" : ""}>${formatRiskStake(n)}</option>`,
                     ).join("")}
                   </select>
                 </label>`
                    : ""
                }
          <button class="btn btn--primary btn--sm" id="new-session" type="button" ${
            canCreateSession ? "" : "disabled aria-disabled=\"true\""
          } title="${escapeHtml(
            canCreateSession
              ? "Open the next regional table"
              : newSessionDisabledReason || "All 4 sessions already created",
          )}">+ New session</button>
          ${
            canCreateSession
              ? `<p class="muted small session-cap-note">${currentSessions.length} of ${MAX_ROOM_SESSIONS} regional table${currentSessions.length === 1 ? "" : "s"} open</p>`
              : newSessionDisabledReason
                ? `<p class="muted small session-cap-note session-cap-note--full">${escapeHtml(newSessionDisabledReason)}</p>`
                : sessionCapReached
                  ? `<p class="muted small session-cap-note session-cap-note--full">All 4 sessions already created.</p>`
                  : ""
          }`
              : `<p class="muted small">Only the room owner can start regional tables.</p>`
          }
        </div>
      </div>
      <div class="session-tabs session-tabs--preset">
        ${renderCreatedSessionTabs(sessionPool, currentSessions, openSessionId)}
      </div>
      ${
        openSessionObj
          ? `<div id="session-toolbar-root" class="session-toolbar">${buildSessionToolbarHtml(openSessionObj, isOwner)}</div>
             <div id="session-panel-mount"></div>`
          : isOwner && currentSessions.length === 0
            ? `<p class="muted small session-open-hint" data-testid="session-open-hint">Tap <strong>+ New session</strong> above to open a table, then add guests or robots.</p>`
            : ""
      }
    </section>`;

  if (openSessionObj) {
    mountSessionPanel(openSessionObj, isOwner);
  }
  scheduleTableSessionSync(openSessionObj);
  if (openSessionObj && openSessionObj.status !== "final") {
    processRobotActions(openSessionObj, openScores);
    if (getSessionEnrollment(openSessionObj)?.active || sessionHasRobots()) {
      if (tablePlayOpen) startEnrollmentTimer();
      else stopEnrollmentTimer();
    }
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
  if (editingHouseRule) {
    const ruleEl = document.getElementById(editingHouseRule.id);
    if (ruleEl) {
      ruleEl.value = editingHouseRule.value;
      ruleEl.focus();
      try {
        ruleEl.setSelectionRange(editingHouseRule.start, editingHouseRule.end);
      } catch {
        /* ignore caret restore errors */
      }
    }
  }
  if (editingAddPlayer) {
    const addPlayerEl = $("#add-player-name", roomDetailView);
    const robotEl = $("#add-player-robot", roomDetailView);
    if (addPlayerEl) {
      addPlayerEl.value = editingAddPlayer.value;
      addPlayerEl.focus();
    }
    if (robotEl) robotEl.checked = editingAddPlayer.robotChecked;
  }
}

function buildAddPlayerFormHtml() {
  return `<form class="add-player-form" id="add-player-form" data-testid="add-player-form">
         <input class="text-input" id="add-player-name" placeholder="Guest name (optional for robots)" aria-label="Add player name" data-testid="add-player-name" />
         <label class="add-player-robot">
           <input type="checkbox" id="add-player-robot" data-testid="add-player-robot" checked />
           Robot — auto I&apos;m in &amp; play to win (name optional)
         </label>
         <button class="btn btn--sm" type="submit" data-testid="add-player-submit">Add player</button>
       </form>`;
}

function buildSessionPlayerBarHtml(s) {
  if (!s || s.status === "final") return "";
  return `<div class="session-add-players" data-testid="session-add-players">
      <h5 class="session-add-players__title">Add guest or robot</h5>
      <p class="muted small session-add-players__hint">Need at least two players, then tap <strong>Go to Table</strong>.</p>
      ${buildAddPlayerFormHtml()}
    </div>`;
}

function buildGoToTableButtonHtml(s) {
  if (!s || s.status === "final") return "";
  const ready = tableReadyPlayerCount(s) >= 2;
  const disabled = ready ? "" : "disabled aria-disabled=\"true\"";
  const title = ready ? "Open the live card table" : "Add at least two players first";
  return `<button type="button" class="btn btn--primary btn--sm session-toolbar__table-btn" id="open-table-play" data-testid="open-table-play" ${disabled} title="${title}">Go to Table</button>`;
}

function buildSessionLiveStatusHtml(s) {
  if (!s || s.status === "final" || tableReadyPlayerCount(s) < 2) return "";
  const enrollment = getSessionEnrollment(s);
  const handNum = (s.handCount ?? 0) + 1;
  let status = `Hand #${handNum} · ante ${formatRiskStake(s.handStake ?? 1)}`;
  if (enrollment?.active) {
    status += tablePlayOpen ? " · join window open" : " · join window open — return to table";
  } else {
    const phase = getSessionCurrentHand(s)?.phase;
    if (phase === "draw") status += " · draw phase";
    else if (phase === "play") status += " · live play";
    else status += " · tap Go to Table to start I'm in";
  }
  return `<div class="session-live-card">
      <p class="session-live-card__status">${escapeHtml(status)}</p>
      <p class="muted small session-live-card__hint">
        Cards and enrollment are in the table view. Hand results and session controls stay here.
      </p>
    </div>`;
}

function buildSessionToolbarHtml(s, isOwner) {
  if (!s || s.status === "final") return "";
  const playerCount = tableReadyPlayerCount(s);
  const addPlayersHtml =
    playerCount >= 2 ? buildSessionPlayerSectionHtml(s, isOwner) : "";
  return `${addPlayersHtml}
    <div class="session-toolbar__actions">
      ${buildGoToTableButtonHtml(s)}
      <button class="btn btn--sm" id="complete-session" type="button">Complete session &amp; update Ape Scores</button>
    </div>`;
}

function buildSessionSidebarHtml(s) {
  const isFinal = s.status === "final";
  const disabled = isFinal ? "disabled" : "";

  const myUid = session?.uid ?? null;
  const myScore = myUid ? openScores.find((sc) => sc.playerId === myUid) : null;

  const handHistoryPublic =
    openHands.length === 0
      ? ""
      : `<div class="hand-history hand-history--public">
           <h5>Hand results</h5>
           <p class="muted small">Winners and pot — visible to everyone in the room.</p>
           <ul>
             ${openHands
               .slice(0, 12)
               .map((h) => `<li>${escapeHtml(formatPublicHandHistoryLine(h, openScores))}</li>`)
               .join("")}
           </ul>
         </div>`;

  const privateHandLines = myUid
    ? openHands
        .slice(0, 12)
        .map((h) => formatPrivateHandHistoryLine(h, myUid))
        .filter(Boolean)
    : [];
  const handHistoryPrivate =
    myScore && (privateHandLines.length > 0 || myScore.net != null)
      ? `<div class="hand-history hand-history--private">
           <h5>Your ledger</h5>
           <p class="session-ledger-net">Session net: <strong>${escapeHtml(formatNet(myScore.net ?? 0))}</strong></p>
           ${
             privateHandLines.length
               ? `<ul>${privateHandLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
               : `<p class="muted small">Your per-hand results appear here after each hand.</p>`
           }
         </div>`
      : "";

  const handHistory = `${handHistoryPublic}${handHistoryPrivate}`;

  const handCount = s.handCount ?? 0;
  const controls = isFinal ? `<div class="session-controls"><span class="badge badge--closed">Session final</span></div>` : "";

  return `${handHistory}
        ${controls}
        <label class="notes-label" for="session-notes">Side notes only — no money movement</label>
        <textarea id="session-notes" class="notes-field" rows="3" ${disabled}
          placeholder="Seating, house-rule tweaks, reminders. Not a ledger.">${escapeHtml(s.notes || "")}</textarea>
        <p class="muted small">${handCount} hand${handCount === 1 ? "" : "s"} played · informational ledger only</p>
        ${renderFeedbackSettingsHtml()}`;
}

function buildSessionResultsHtml(s) {
  if (!Array.isArray(s.results)) return "";
  return `<div class="session-results">
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
         </div>`;
}

/** Session ledger panel — add players inline while waiting; notes/results here. */
function mountSessionPanel(s, isOwner) {
  const mount = $("#session-panel-mount", roomDetailView);
  if (!mount) return;

  const isFinal = s.status === "final";
  const playerCount = tableReadyPlayerCount(s);
  const sidebarHtml = buildSessionSidebarHtml(s);
  const liveCardHtml = buildSessionLiveStatusHtml(s);

  if (isFinal) {
    resetSessionPanelTableHost();
    mount.innerHTML = `
      <div class="session session--stack">
        ${buildSessionResultsHtml(s)}
        <aside class="session-sidebar">${sidebarHtml}</aside>
      </div>`;
    return;
  }

  if (playerCount < 2) {
    const addPlayersHtml = buildSessionPlayerSectionHtml(s, isOwner);
    resetSessionPanelTableHost();
    mount.innerHTML = `
      <div class="session session--stack session--waiting">
        ${addPlayersHtml}
        <p class="muted small session-waiting-players">
          Need at least two players for the live table. ${
            isOwner
              ? "Add a guest or robot above, then tap"
              : "Ask the host to add players, then tap"
          } <strong>Go to Table</strong>.
        </p>
        <aside class="session-sidebar">${sidebarHtml}</aside>
      </div>`;
    return;
  }

  resetSessionPanelTableHost();
  mount.innerHTML = `
    <div class="session session--stack">
      ${liveCardHtml}
      <aside class="session-sidebar">${sidebarHtml}</aside>
    </div>`;
}

function renderSessionPanel(s) {
  const isFinal = s.status === "final";
  const playerCount = tableReadyPlayerCount(s);
  const sidebarHtml = buildSessionSidebarHtml(s);

  if (isFinal) {
    return `
    <div class="session session--table">
      ${buildSessionResultsHtml(s)}
      <aside class="session-sidebar">${sidebarHtml}</aside>
    </div>`;
  }

  const tableHost =
    playerCount < 2
      ? `<p class="muted small session-waiting-players">Need at least two players for the live table.</p>`
      : `<div class="session-table-wrap">
           <div id="table-session-inline-root" class="table-session-root" aria-label="Live card table"></div>
           <div class="session-play-cta">
             <button type="button" class="btn btn--primary btn--block" id="open-table-play" data-testid="open-table-play">
               Go to Table
             </button>
             <p class="muted small session-play-cta__hint">
               Full-screen table view. Hand results and session controls stay in the sidebar.
             </p>
           </div>
         </div>`;

  return `
    <div class="session session--table">
      ${tableHost}
      <aside class="session-sidebar">${sidebarHtml}</aside>
    </div>`;
}

function formatPublicHandHistoryLine(h, scores) {
  const players = (h.participantIds || []).map((id) => ({
    playerId: id,
    displayName: scores.find((sc) => sc.playerId === id)?.displayName || id,
  }));
  const winnerIds = h.winnerIds?.length
    ? h.winnerIds
    : h.winnerId
      ? [h.winnerId]
      : [];
  const settlement = h.settlement === "ante_up" ? "non_winner_ante_up" : h.settlement;
  if (settlement === "win" || settlement === "split" || settlement === "push" || settlement === "non_winner_ante_up" || settlement === "co_win_carry") {
    return formatHandHistoryPublicLine({
      handNumber: h.handNumber,
      settlement,
      winnerIds,
      participantIds: h.participantIds || [],
      tricksByPlayer: h.tricksByPlayer || {},
      players,
      potMaxWin: h.pot ?? 0,
      cappedPot: h.cappedPot,
      grossPot: h.pot,
      bourreIds: h.bourreIds,
    });
  }
  const names = winnerIds.map(
    (id) => scores.find((sc) => sc.playerId === id)?.displayName || id,
  );
  const pot = formatRiskStake(h.cappedPot ?? h.pot ?? 0);
  const n = h.participantIds?.length ?? 0;
  return `#${h.handNumber} ${names[0] || "Unknown"} won ${pot} (${n} players)`;
}

function formatPrivateHandHistoryLine(h, myUid) {
  if (!myUid || !h.participantIds?.includes(myUid)) return null;
  const delta = h.deltas?.[myUid];
  if (delta == null) return null;
  const parts = [`Hand #${h.handNumber}: ${formatNet(delta)}`];
  if (h.settlement === "push") parts.push("push");
  else if (h.settlement === "co_win_carry") parts.push("carry");
  else if (h.settlement === "split") parts.push("split");
  else if (h.settlement === "win") parts.push("win");
  return parts.join(" · ");
}

function formatHandHistoryLine(h, scores) {
  return formatPublicHandHistoryLine(h, scores);
}

function getCurrentHandState() {
  const openSessionObj = currentSessions.find((s) => s.id === openSessionId);
  const currentHand = getSessionCurrentHand(openSessionObj);
  const participantIds = currentHand?.participantIds || [];
  const tricksByPlayer = currentHand?.tricksByPlayer || {};
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
  /* Session controls use delegated handlers in bindRoomDetailDelegatedControls(). */
}

async function onNewSession() {
  if (!currentRoomId || creatingSession) return;
  if (session?.uid !== currentRoom?.ownerId) {
    showRoomsError("Only the room owner can start a new session.");
    return;
  }
  showRoomsError("");
  const pool = isValidSessionNamePool(currentRoom?.sessionNamePool)
    ? currentRoom.sessionNamePool
    : [];
  const claimedNames = claimedSessionNamesForRoom(currentRoom, currentSessions);
  if (
    !canCreateAnotherSession(currentSessions.length, pool, claimedNames)
  ) {
    showRoomsError("All 4 sessions already created.");
    return;
  }

  const previousSessionId = openSessionId;
  const previousScores = [...openScores];
  const previousSession = currentSessions.find((s) => s.id === previousSessionId);

  creatingSession = true;
  showRoomsError("Opening regional table…", "info");

  try {
    if (
      previousSessionId &&
      previousSession?.status !== "final" &&
      previousScores.length > 0
    ) {
      try {
        await completeSessionWithApeScores(
          currentRoomId,
          previousSessionId,
          previousScores,
        );
        const finalized = await getSession(currentRoomId, previousSessionId);
        if (finalized?.status === "final") {
          scheduleSessionCleanup(previousSessionId);
        }
        showRoomsError(
          "Previous session completed — Ape Scores updated. Clears in 30s.",
        );
      } catch (err) {
        console.error("autoCompleteSession:", err);
        showRoomsError(err.message || "Could not complete previous session");
        return;
      }
    }

    const cap = await refreshRoomSessionCap(currentRoomId);
    if (cap.room) currentRoom = cap.room;

    const players = currentMembers.map((m) => ({
      playerId: m.userId,
      displayName: m.displayName,
    }));
    if (players.length === 0 && session) {
      players.push({ playerId: session.uid, displayName: session.displayName });
    }
    const roomBs = normalizeBourreSettings(
      currentRoom?.bourreSettings || DEFAULT_BOURRE_SETTINGS,
    );
    const buyInAmount = pendingRoomBuyInOverride ?? roomBs.buyInAmount;
    const stakeEl = $("#new-session-stake", roomDetailView);
    const handStake = stakeEl ? parseInt(stakeEl.value, 10) : pendingHandStake;

    const created = await createSession(currentRoomId, players, buyInAmount, {
      handStake,
      limEnabled: roomBs.limEnabled,
    });
    if (!created?.id || !created.sessionName) {
      showRoomsError("Could not create session — please try again.");
      return;
    }

    try {
      await updateRoomBourreSettings(currentRoomId, {
        buyInAmount,
        anteAmount: handStake,
        limEnabled: roomBs.limEnabled,
      });
      pendingRoomBuyInOverride = null;
      pendingRoomAnteOverride = null;
    } catch (err) {
      console.warn("updateRoomBourreSettings after create:", err);
    }

    const optimisticSession = {
      id: created.id,
      sessionName: created.sessionName,
      status: "in_progress",
      handCount: 0,
      buyInAmount,
      handStake,
      limEnabled: roomBs.limEnabled,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
    };
    rememberPendingSession(optimisticSession);
    currentSessions = mergeSessionsWithPending(currentSessions);
    pendingHandStake = handStake;
    userPickedNewSessionStake = false;
    showRoomsError("");
    openSession(created.id);
    renderRoomDetail();
  } catch (err) {
    console.error("createSession:", err);
    showRoomsError(err.message || "Could not create session");
  } finally {
    creatingSession = false;
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
      showRoomsError(formatVoteRecordedMessage(choice, result), "success");
    } else if (result.settlement === "split") {
      showRoomsError(formatVoteRecordedMessage(choice, result), "success");
    } else if (result.settlement === "non_winner_ante_up") {
      showRoomsError(formatVoteRecordedMessage(choice, result), "success");
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
    const results = await completeSessionWithApeScores(
      currentRoomId,
      openSessionId,
      openScores,
    );
    scheduleSessionCleanup(openSessionId);
    const top = results.find((r) => r.placement === 1);
    showRoomsError(
      top
        ? `Session complete — ${top.displayName} #1 · Ape Score ${top.apeScore}. Clears in 30s.`
        : "Session complete — Ape Scores updated. Clears in 30s.",
    );
  } catch (err) {
    console.error("completeSession:", err);
    showRoomsError(err.message || "Could not complete session");
  }
}

// ---------------------------------------------------------------------------
// Leaderboard — Ape Score (TrueSkill), persisted in Firestore
// ---------------------------------------------------------------------------
let leaderboardUnsub = null;
let leaderboard = [];
let leaderboardLoaded = false;

function startLeaderboardSubscription() {
  stopLeaderboardSubscription();
  leaderboardLoaded = false;
  renderLeaderboard();
  leaderboardUnsub = subscribeLeaderboard((players) => {
    leaderboard = players;
    leaderboardLoaded = true;
    renderLeaderboard();
  });
}

function stopLeaderboardSubscription() {
  if (leaderboardUnsub) {
    leaderboardUnsub();
    leaderboardUnsub = null;
  }
  leaderboard = [];
  leaderboardLoaded = false;
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
  if (!leaderboardLoaded) {
    list.innerHTML = `<p class="state-box state-box--loading" role="status">Loading leaderboard…</p>`;
    return;
  }
  if (leaderboard.length === 0) {
    list.innerHTML = `<p class="state-box state-box--empty">No ranked players yet. Complete a session to put apes on the board.</p>`;
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
    list.innerHTML = `<p class="state-box state-box--empty">No leagues yet. Start one to track standings.</p>`;
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
mountVersionFooter(VERSION_DISPLAY_LABEL, BUILD_STAMPED_AT);
startVersionUpdateWatcher();

renderRoomsList();
renderLeagues();
bindRoomDetailDelegatedControls();
bindTablePlayControls();
initTheme();
wireThemeToggle($("#theme-toggle"));
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
