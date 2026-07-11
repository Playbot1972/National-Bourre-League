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
  isCapacitorNative,
} from "./auth.js";
import { SERVER_HAND_AUTHORITY } from "./firebase-config.js";
import {
  SESSION_ORCHESTRATION_DEBOUNCE_MS,
  logSessionOrchestrator,
} from "./session-orchestrator.js";
import {
  buildHeroCardsForTable,
  computeLegalPlayIndices,
  buildTableFeedbackSnapshot,
  isHandCardsDealtPhase,
  activeSeatedPlayerIds,
  buildTablePotMetrics,
  buildTablePlayerSeatFlags,
  buildEnrollmentLeaderLabel,
  buildTableLeaderLabel,
  totalTricksPlayed,
  isHandComplete,
  deriveWinnersFromTricks,
} from "./table-view-model.js";
import { applyTableFeedbackDiff } from "./table-feedback.js";
import { createTableIntentHandlers } from "./table-intents.js";
import {
  isBenignTableActionError,
  isStaleTableActionError,
  scrubRawInternalMessage,
} from "./table-action-feedback.js";
import {
  shouldClientDriveBotsDirectly,
  shouldRequestServerBotAdvance,
  logBotOrchestrator,
} from "./bot-orchestrator.js";
import { createServerBotAdvanceRuntime } from "./bot-orchestration-runtime.js";
import {
  botPlayTurnKey,
  createBotThinkScheduleState,
} from "./bot-play-delay.js";
import {
  logHandLifecycleTransition,
  isPagatHandClock,
  buildHandLifecycleContext,
  isHandoffReadyForEnrollment,
  isSessionAutoDealtNextHand,
  nextHandOpenFeedbackMessage,
} from "./session-lifecycle-ui.js";
import {
  buildAddPlayerFormHtml,
  buildSessionResultsHtml,
  buildGameSetupStakesHtml,
  buildSetupRosterHtml,
  buildSessionLiveStatusHtml,
  readGameSetupBourreFromDom,
  mergeBourreSettingsWithPending,
} from "./room-detail-view.js";
import { isGameFlowDebugEnabled, logGameFlow } from "./game-flow-debug.js";
import {
  analyzeHandTransitionAnomalies,
  isHandTransitionDebugEnabled,
  logHandTransition,
  logHandTransitionBoot,
  markHandDealDispatched,
  markHandShuffleStart,
  snapshotHandTransitionState,
} from "./hand-transition-debug.js";
import {
  clearSessionSetupSheetSnap,
  initSessionSetupSheet,
  resetSessionSetupSheet,
} from "./session-setup-sheet.js";
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
  foldHandDraw,
  playHandCard,
  robotSubmitDraw,
  robotPlayCard,
  voteCoWinSettlement,
  settleCoWinCarryover,
  addSessionPlayer,
  addSessionRobot,
  removeSessionPlayer,
  syncSessionWithRoomMembers,
  syncSessionScoreRoster,
  setHandParticipation,
  ensureHandEnrollment,
  advanceHandReveal,
  prepareSessionForTableOpen,
  recoverHandoffBetweenHands,
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
  normalizeBourreSettings,
  updateRoomBourreSettings,
  updateRoomHouseRules,
  DEFAULT_BOURRE_SETTINGS,
  DEFAULT_HOUSE_RULES,
  HOUSE_RULE_FIELDS,
  normalizeHouseRules,
  readHouseRulesFromForm,
  playerHandStake,
  scoreBankroll,
  resolveSessionBuyIn,
  rebuySessionPlayer,
  MAX_TRICKS_PER_HAND,
  MAX_TABLE_PLAYERS,
  formatClientGameError,
  isRobotPlayerId,
  getSessionEnrollment,
  getSessionHandDecision,
  getSessionCurrentHand,
  resolveHandDealerId,
  enrollmentDeadlineMs,
  tricksForPlayer,
  resolveActionOrder,
  getPrivateHand,
  tryFinalizeSessionForSolvency,
} from "./firestore.js";
import {
  MAX_ROOM_SESSIONS,
  canCreateAnotherSession,
  createdSessionsForTabs,
  isValidSessionNamePool,
  sessionTabLabel,
} from "./session-presets.js";
import {
  cardsRemainingInHand,
  deserializeCards,
  effectivePlayerHand,
  botShouldPassDecision,
} from "./game-engine.js";
import {
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
  PLAY_NOW_BUY_IN,
  PLAY_NOW_ANTE,
  pickPlayNowRobotCount,
  pickVacationRoomName,
  pickUniqueRobotNames,
  playNowBourreSettings,
} from "./play-now.js";
import { isJoinModeActive, JOIN_MODE_CLASS } from "./join-room-ui.js";
import {
  blurActiveTextEntry,
  describeActiveElement,
  shouldRestoreRoomDetailFocus,
} from "./keyboard-focus.js";
import { gameSetupStepLabel } from "./game-setup-ui.js";
import {
  formatAnteStake,
  formatRiskStake,
  formatNet,
} from "./risk-stakes.js";
import {
  parseAnteAmount,
  renderAnteSelectOptionsHtml,
  resolveRoomAnteAmount,
  syncAnteSelectToAmount,
} from "./room-ante-state.js";
import {
  analyzeTableStartup,
  sessionHandDealStarted,
  tableStartupUserMessage,
  isLegacyEnrollmentActive,
  isPagatDecisionActive,
  resolveTableEnrollmentActive,
  resolveCurrentHandChoicePlayerId,
  assertHandFlowConsistent,
  shouldAutoOpenNextHand,
  countEligibleForNextHand,
} from "./session-startup.js";
import {
  LOCAL_HAND_ACTION,
  applyLocalCommitDrawCompleted,
  applyLocalCommitPlannedDiscards,
  applyLocalCommitToEnrollment,
  applyLocalCommitToPlayerFlags,
  createLocalHandCommit,
  reconcileLocalCommit,
} from "./local-hand-commit.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function parseBuyInAmount(raw) {
  return Math.max(1, parseInt(String(raw), 10) || 100);
}

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
const googleSigninBtn = $("#google-signin");

/** TEMP(native-auth-debug): remove after iOS auth QA — logs submit disabled state. */
const AUTH_NATIVE_DEBUG = isCapacitorNative();

function logAuthSubmitDebug(trigger) {
  if (!AUTH_NATIVE_DEBUG) return;
  console.info("[nbl-auth-debug]", trigger, {
    mode,
    submitDisabled: submitBtn.disabled,
    submitBusy: submitBtn.dataset.busy === "true",
    googleDisabled: googleSigninBtn?.disabled === true,
    emailLen: emailInput.value.length,
    passwordLen: passwordInput.value.length,
    nameLen: $("#auth-name").value.length,
    nameFieldHidden: nameField.hidden,
    emailValid: emailInput.validity?.valid,
    passwordValid: passwordInput.validity?.valid,
  });
}

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
  passwordManagerHint.hidden =
    signup || reset || window.Capacitor?.isNativePlatform?.() === true;
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
  logAuthSubmitDebug("setMode");
}

function restoreSubmitLabel() {
  submitBtn.textContent =
    mode === "reset" ? "Send reset email" : mode === "signup" ? "Create account" : "Sign in";
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
  if (googleSigninBtn) googleSigninBtn.disabled = busy;
  if (!busy) restoreSubmitLabel();
  if (AUTH_NATIVE_DEBUG) {
    console.info("[nbl-auth]", busy ? "busy-set" : "busy-cleared");
  }
  logAuthSubmitDebug(busy ? "setBusy(true)" : "setBusy(false)");
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  clearSuccess();
  logAuthSubmitDebug("submit");
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
  if (AUTH_NATIVE_DEBUG) {
    console.info("[nbl-auth]", "google-button-tapped", {
      disabled: googleSigninBtn?.disabled === true,
    });
  }
  setBusy(true);
  let webRedirecting = false;
  try {
    const user = await signInWithGoogle();
    if (user) {
      closeAuth();
      return;
    }
    // Web-only: signInWithRedirect navigates away; keep busy until unload.
    if (!isCapacitorNative()) {
      webRedirecting = true;
      submitBtn.textContent = "Redirecting to Google…";
    }
  } catch (err) {
    console.error("[nbl-auth] Google sign-in:", err);
    showError(describeAuthError(err));
  } finally {
    if (!webRedirecting) setBusy(false);
    logAuthSubmitDebug("google-signin-done");
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

if (AUTH_NATIVE_DEBUG) {
  for (const el of [emailInput, passwordInput, $("#auth-name")]) {
    el?.addEventListener("input", () => logAuthSubmitDebug("input"));
  }
  logAuthSubmitDebug("auth-module-ready");
}

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

function parseRoute() {
  const raw = location.hash.replace("#", "") || "home";
  if (raw === "rooms-practice") {
    return { view: "rooms", roomsScope: "practice" };
  }
  return { view: raw, roomsScope: "online" };
}

function applyRoomsScope(scope) {
  const online = scope !== "practice";
  const onlinePanel = $("#rooms-online-panel");
  const practicePanel = $("#rooms-practice-panel");
  const onlineTab = $("#rooms-scope-online");
  const practiceTab = $("#rooms-scope-practice");
  onlinePanel?.toggleAttribute("hidden", !online);
  practicePanel?.toggleAttribute("hidden", online);
  onlineTab?.classList.toggle("is-active", online);
  practiceTab?.classList.toggle("is-active", !online);
  onlineTab?.setAttribute("aria-selected", online ? "true" : "false");
  practiceTab?.setAttribute("aria-selected", online ? "false" : "true");
}

function showView() {
  const { view, roomsScope } = parseRoute();
  let effectiveView = view;
  const practiceRoomsPublic = view === "rooms" && roomsScope === "practice";
  if (PROTECTED.has(view) && !practiceRoomsPublic && !isAuthed()) {
    openAuth("signin");
    effectiveView = "home";
    location.hash = "#home";
  }
  $$(".view").forEach((sec) => {
    sec.hidden = sec.id !== `view-${effectiveView}`;
  });
  $$(".nav__link").forEach((link) => {
    const href = link.getAttribute("href");
    const active =
      href === `#${effectiveView}` ||
      (href === "#rooms" && effectiveView === "rooms");
    link.classList.toggle("is-active", active);
  });
  if (effectiveView === "rooms") {
    applyRoomsScope(roomsScope);
  }
  if (effectiveView === "rules") {
    renderRulesView($("#rules-root"));
  }
}

window.addEventListener("hashchange", showView);

$(".rooms-scope-tabs")?.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-rooms-scope]");
  if (!tab) return;
  const scope = tab.getAttribute("data-rooms-scope");
  location.hash = scope === "practice" ? "#rooms-practice" : "#rooms";
});

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
  initSessionSetupSheet(roomDetailView);

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
    if (e.target.closest("#session-add-player-pill")) {
      e.preventDefault();
      $("#add-player-form", roomDetailView)?.requestSubmit();
      return;
    }
    if (e.target.closest("#open-table-play") || e.target.closest("#open-table-play-inline")) {
      e.preventDefault();
      void triggerSessionPlay("manual");
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
        showRoomsError(
          formatClientGameError(err, `Could not add ${isRobot ? "robot" : "player"}`),
        );
      })
      .then((added) => {
        if (added === false) {
          showRoomsError("That name is already on the score sheet.");
          return;
        }
        if (added !== true) return;
        showRoomsError("");
        const projectedRobots = isRobot ? countSessionRobots() + 1 : countSessionRobots();
        scheduleSessionAutoPlay({ afterRobotAdd: isRobot, projectedRobotCount: projectedRobots });
      });
    if (input) input.value = "";
    const robotCheckbox = $("#add-player-robot", roomDetailView);
    if (robotCheckbox) robotCheckbox.checked = true;
  });

  roomDetailView.addEventListener("change", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;

    if (el.id === "feedback-sound-enabled") {
      saveFeedbackPrefs({ soundEnabled: el.checked });
      return;
    }

    if (el.name === "feedback-haptics" && el.checked) {
      saveFeedbackPrefs({ hapticsMode: el.value });
      return;
    }

    if (el.id === "room-buy-in-amount" || el.id === "room-ante-amount" || el.id === "room-lim-enabled" || el.id === "room-rebuy-enabled" || el.id === "room-split-pot-enabled") {
      if (el.id === "room-ante-amount") {
        pendingRoomAnteOverride = parseAnteAmount(el.value);
      }
      saveRoomBourreSettingsFromForm();
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
/** One-shot scroll/focus target after room create or new session. */
let roomSetupFocus = null;
/** Prevents duplicate Play Now fast-start while in flight. */
let playNowInFlight = false;
/** Suppress room-detail roster UI while Play Now assembles the table in the background. */
let silentTableEntry = false;
/** Debounced auto-play after Add Player. */
let sessionAutoPlayTimer = null;
/** Prevents duplicate Play triggers (manual + auto). */
let sessionPlayInFlight = false;
const SESSION_AUTO_PLAY_INSTANT_BOT_COUNT = 7;
function countSessionRobots(scores = openScores) {
  return scores.filter((sc) => sc.isRobot === true || isRobotPlayerId(sc.playerId)).length;
}

function clearSessionAutoPlayTimer() {
  if (sessionAutoPlayTimer) {
    clearTimeout(sessionAutoPlayTimer);
    sessionAutoPlayTimer = null;
  }
}

function scheduleSessionAutoPlay({ afterRobotAdd = false, projectedRobotCount = null } = {}) {
  clearSessionAutoPlayTimer();
  if (!afterRobotAdd) return;
  const robots = projectedRobotCount ?? countSessionRobots();
  if (robots >= SESSION_AUTO_PLAY_INSTANT_BOT_COUNT) {
    void triggerSessionPlay("auto-instant");
  }
}

async function triggerSessionPlay(_source = "manual") {
  if (sessionPlayInFlight || tablePlayOpen) return;
  const s = resolveOpenSessionObj();
  if (!s || s.status === "final") return;
  if (tableReadyPlayerCount(s) < 2) return;
  sessionPlayInFlight = true;
  clearSessionAutoPlayTimer();
  try {
    await openTablePlay();
  } catch (err) {
    console.error("triggerSessionPlay:", err);
    const analysis = analyzeTableStartup(s, tableReadyPlayerCount(s));
    showTableStartupFailure(analysis, err);
  } finally {
    sessionPlayInFlight = false;
  }
}

function applyRoomSetupFocus() {
  if (!roomSetupFocus || roomDetailView.hidden || tablePlayOpen) return;
  const focus = roomSetupFocus;
  roomSetupFocus = null;
  window.requestAnimationFrame(() => {
    const target =
      focus === "regional"
        ? roomDetailView.querySelector(".subpanel--regional-tables")
        : roomDetailView.querySelector("[data-testid='game-setup-panel']") ??
          roomDetailView.querySelector("[data-testid='session-setup-window']");
    if (!target) return;
    target.classList.add("game-setup-panel--focus");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus === "add-players" || focus === "game-setup") {
      if (!tablePlayOpen) {
        $("#add-player-name", roomDetailView)?.focus();
      }
    }
    window.setTimeout(() => {
      target.classList.remove("game-setup-panel--focus");
    }, 2400);
  });
}

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
  return buildAddPlayerFormHtml();
}

let roomGoneHandled = false;
let openScores = [];
let openHands = [];
let openPrivateHand = null;
let privateHandSnapSeen = false;
let openPlayerRatings = {};
let tableActionFeedback = null;
let tableActionFeedbackContext = null;
let tableFeedbackTimer = null;
let tableFeedbackSnapshot = null;
/** Local participation/action overlay until Firestore confirms (see local-hand-commit.js). */
let localHandActionCommit = null;
let pendingDrawShuffle = false;
let tableFeedbackApi = null;
let enrollmentTimer = null;
let robotActionInFlight = false;
let lastRobotTrickAt = 0;
let sessionOrchestrationTimer = null;
let sessionOrchestrationCoalesce = false;
const ROBOT_PRESENTATION_SOFT_MS = 5_500;
const ROBOT_PRESENTATION_FORCE_MS = 7_000;
let robotPresentationBlockEpisode = null;

/** Server bot-advance request controller (execute path is Cloud Functions only). */
let serverBotAdvance = null;

function getServerBotAdvance() {
  if (!serverBotAdvance) {
    serverBotAdvance = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY, tablePlayOpen),
      sessionNeedsBotDriver,
      shouldBlockForPresentation: shouldBlockRobotForPresentation,
      snapshotContext: snapshotBotOrchestratorContext,
      getRoomId: () => currentRoomId,
      getSessionId: () => openSessionId,
      getHandPhase: (s) => getSessionCurrentHand(s)?.phase ?? null,
      advanceSessionBots,
      findSession: (id) => currentSessions.find((x) => x.id === id),
      getScores: () => openScores,
      onWake: (latest, scores, actorId, opts) => scheduleServerBotAdvance(latest, scores, actorId, opts),
      onAdvanceError: (latest, scores, actorId) =>
        driveClientBotsForCurrentTurn(latest, scores, actorId, { reason: "advance-error-fallback" }),
      trickIntervalMs: ROBOT_TRICK_INTERVAL_MS,
    });
  }
  return serverBotAdvance;
}
let pendingRobotWake = false;
let robotPresentationUnsub = null;
/** Client legacy bot play think delay (1–3s per turn). */
const clientBotThinkSchedule = createBotThinkScheduleState();
/** Min gap between robot card plays — must exceed post-trick hold + sweep (premium pace). */
/** Must exceed full trick presentation pipeline (see src/table/trickTiming.ts). */
const TRICK_PIPELINE_MS = 1850 + 1080 + 230;
const BOT_PLAY_STAGGER_MS = 380;
const ROBOT_TRICK_INTERVAL_MS = TRICK_PIPELINE_MS + BOT_PLAY_STAGGER_MS + 220;
/** After settlement, force-open the next join window if auto-open stalls. */
const HAND_LIFECYCLE_WATCHDOG_MS = 12_000;
/** Brief pause so "Hand complete…" is readable before the next I'm-in window. */
const NEXT_HAND_SETTLE_MS = 2_000;
let nextHandOpenTimer = null;
let nextHandOpenStartedAt = 0;
let nextHandOpenInFlight = false;
let handoffRecoveryInFlight = false;

function sessionNeedsEnrollmentDriver(sessionObj) {
  return (
    getSessionEnrollment(sessionObj)?.active === true ||
    sessionHasRobots() ||
    isPagatHandClock(sessionObj)
  );
}

function sessionNeedsNextHandEnrollment(sessionObj) {
  if (!sessionObj || sessionObj.status === "final") return false;
  if (!shouldAutoOpenNextHand({ session: sessionObj, tablePlayOpen })) return false;
  return eligibleCountForOpenSession(sessionObj) >= 2;
}

function eligibleCountForOpenSession(sessionObj) {
  if (!sessionObj || !openScores?.length) return 0;
  const buyIn = resolveSessionBuyIn(
    sessionObj,
    normalizeBourreSettings(currentRoom?.bourreSettings).buyInAmount,
  );
  const sortedIds = openScores.map((sc) => sc.playerId).filter(Boolean);
  const scoreById = Object.fromEntries(openScores.map((sc) => [sc.playerId, sc]));
  return countEligibleForNextHand(sortedIds, scoreById, buyIn);
}

async function handleSoleSurvivorSessionEnd(sessionObj) {
  if (!currentRoomId || !openSessionId || !sessionObj || sessionObj.status === "final") {
    return false;
  }
  if (eligibleCountForOpenSession(sessionObj) !== 1) return false;

  cancelNextHandOpenTimer();
  try {
    const result = await tryFinalizeSessionForSolvency(currentRoomId, openSessionId);
    if (result.status !== "finalized" && result.status !== "already_final") return false;

    const scores = await getSessionScores(currentRoomId, openSessionId);
    if (scores.length > 0) {
      await completeSessionWithApeScores(currentRoomId, openSessionId, scores);
    }
    scheduleSessionCleanup(openSessionId);
    const winner = scores.find((sc) => (sc.playerId ?? sc.id) === result.winnerId);
    setTableActionFeedback({
      status: "success",
      message: winner
        ? `Session complete — ${winner.displayName} wins the table.`
        : "Session complete.",
    });
    logHandLifecycleTransition({
      from: "handoffToNextDeal",
      to: "settle",
      reason: "sole survivor — session finalized without contested next hand",
    });
    const refreshed =
      (await refreshOpenSessionFromServer(currentRoomId, openSessionId)) ?? sessionObj;
    await syncTableSession(refreshed);
    closeTablePlay();
    renderRoomDetail();
    return true;
  } catch (err) {
    console.warn("handleSoleSurvivorSessionEnd:", err);
    const message = formatClientGameError(err, "Could not complete the session");
    setTableActionFeedback({ status: "error", message }, getActionErrorContext("settlement"));
    showRoomsError(message);
    return false;
  }
}

function cancelNextHandOpenTimer() {
  if (nextHandOpenTimer) {
    clearTimeout(nextHandOpenTimer);
    nextHandOpenTimer = null;
  }
  nextHandOpenStartedAt = 0;
}

async function openNextHandEnrollment(sessionObj) {
  if (!currentRoomId || !openSessionId || !tablePlayOpen || nextHandOpenInFlight) return;
  if (!sessionNeedsNextHandEnrollment(sessionObj)) return;

  const eligibleCount = eligibleCountForOpenSession(sessionObj);
  if (eligibleCount < 2) {
    if (eligibleCount === 1) {
      nextHandOpenInFlight = true;
      try {
        await handleSoleSurvivorSessionEnd(sessionObj);
      } finally {
        nextHandOpenInFlight = false;
      }
    }
    return;
  }

  nextHandOpenInFlight = true;
  cancelNextHandOpenTimer();
  openPrivateHand = null;
  privateHandSnapSeen = false;
  tableFeedbackSnapshot = null;

  try {
    markHandShuffleStart({
      sessionId: openSessionId,
      handCount: sessionObj.handCount ?? 0,
      roomId: currentRoomId,
    });
    await ensureHandEnrollment(currentRoomId, openSessionId, {
      members: currentMembers,
      roster: tableReadyRoster(sessionObj),
    });
    const refreshed =
      (await refreshOpenSessionFromServer(currentRoomId, openSessionId)) ?? sessionObj;
    const dealStarted = sessionHandDealStarted(refreshed);
    const dealHand = getSessionCurrentHand(refreshed);
    markHandDealDispatched({
      sessionId: openSessionId,
      handCount: refreshed.handCount ?? 0,
      dealStarted,
      phase: dealHand?.phase ?? null,
      participantIds: dealHand?.participantIds ?? [],
    });
    await syncTableSession(refreshed);
    const autoDealt = isSessionAutoDealtNextHand(refreshed);
    scheduleSessionOrchestration(refreshed, openScores, { reason: "next-hand-open" });
    const dealerSc = openScores.find((sc) => sc.playerId === refreshed.dealerId);
    const dealerLabel = dealerSc?.displayName ?? "dealer";
    const nextHandMessage = nextHandOpenFeedbackMessage(refreshed, dealerLabel);
    if (nextHandMessage) {
      setTableActionFeedback({
        status: "success",
        message: nextHandMessage,
      });
    }
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
    logHandTransition("shuffle_failed", {
      sessionId: openSessionId,
      message: err?.message ?? String(err),
      code: err?.code ?? null,
    });
    const message = formatClientGameError(err, "Could not open the next join window");
    setTableActionFeedback(
      { status: "error", message },
      getActionErrorContext("settlement"),
    );
    showRoomsError(message);
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

  const handoffReady = shouldAutoOpenNextHand({ session: sessionObj, tablePlayOpen });
  if (!handoffReady) {
    if (tablePlayOpen && !handoffRecoveryInFlight) {
      handoffRecoveryInFlight = true;
      void recoverHandoffBetweenHands(currentRoomId, openSessionId, session?.uid ?? null)
        .then((result) => {
          if (result.status === "settlement_recovered" || result.status === "artifacts_cleared") {
            logHandLifecycleTransition({
              from: "settle",
              to: "handoffToNextDeal",
              reason: `recovered ${result.status} after post-settlement stall`,
            });
          }
        })
        .catch((err) => {
          console.warn("recoverHandoffBetweenHands:", err);
        })
        .finally(() => {
          handoffRecoveryInFlight = false;
        });
    }
    cancelNextHandOpenTimer();
    return;
  }

  if (!tablePlayOpen) return;

  const eligibleCount = eligibleCountForOpenSession(sessionObj);
  if (eligibleCount < 2) {
    cancelNextHandOpenTimer();
    if (eligibleCount === 1 && !nextHandOpenInFlight) {
      void handleSoleSurvivorSessionEnd(sessionObj);
    }
    return;
  }

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

let tableIntentHandlers = null;

/** Intent submission — wired once; reads live app state via getters. */
function getTableIntentHandlers() {
  if (!tableIntentHandlers) {
    tableIntentHandlers = createTableIntentHandlers({
      getAuth: () => session,
      getRoomId: () => currentRoomId,
      getSessionId: () => openSessionId,
      getCurrentSessions: () => currentSessions,
      getHandPhase: () => getSessionCurrentHand(resolveActiveSession())?.phase ?? null,
      getCurrentHand: () => getSessionCurrentHand(resolveActiveSession()),
      fetchCurrentHand: async () => {
        const roomId = currentRoomId;
        const sessionId = openSessionId;
        if (!roomId || !sessionId) return null;
        const sessionObj = await getSession(roomId, sessionId);
        if (!sessionObj) return null;
        return getSessionCurrentHand(sessionObj);
      },
      hasLocalHandActionCommit: (kind) => {
        const sessionObj = resolveActiveSession();
        if (!localHandActionCommit || !sessionObj || !session?.uid) return false;
        return (
          localHandActionCommit.kind === kind &&
          localHandActionCommit.sessionId === openSessionId &&
          localHandActionCommit.handNumber === sessionHandNumber(sessionObj) &&
          localHandActionCommit.playerId === session.uid
        );
      },
      getSessionCurrentHand,
      setTableActionFeedback,
      showRoomsError,
      commitLocalHandAction,
      clearLocalHandCommit,
      markPendingDrawShuffle: () => {
        pendingDrawShuffle = true;
      },
      scheduleTableSessionSync,
      wakeBotsAfterHandAction: (sessionObj) => {
        scheduleSessionOrchestration(sessionObj, openScores, { reason: "post-hand-action" });
      },
      setHandParticipation,
      submitHandDraw,
      foldHandDraw,
      playHandCard,
      advanceHandReveal,
      updateHandTrick,
      onSettleHand,
      onSettleCarryover: onSettleCoWinCarryover,
      onRebuy: onRebuySession,
      formatClientGameError,
      getActionErrorContext,
    });
  }
  return tableIntentHandlers;
}

async function processTableFeedbackEvents(sessionObj) {
  const api = await ensureTableFeedbackApi();
  if (!api || !sessionObj) return;

  const myUid = session?.uid ?? null;
  const lastHand = openHands[0];
  const recentBourreIds =
    lastHand && lastHand.handNumber === (sessionObj.handCount ?? 0)
      ? (lastHand.bourreIds || []).filter(Boolean)
      : [];
  const next = buildTableFeedbackSnapshot(sessionObj, {
    myUid,
    privateHandCards: openPrivateHand?.cards ?? [],
    recentBourreIds,
  });
  const { snapshot, clearPendingDrawShuffle } = applyTableFeedbackDiff(
    tableFeedbackSnapshot,
    next,
    { api, myUid, pendingDrawShuffle },
  );
  tableFeedbackSnapshot = snapshot;
  if (clearPendingDrawShuffle) pendingDrawShuffle = false;
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

function getActionErrorContext(actionKind) {
  const sessionObj = currentSessions.find((x) => x.id === openSessionId);
  const currentHand = sessionObj ? getSessionCurrentHand(sessionObj) : null;
  const participantIds = currentHand?.participantIds ?? [];
  const tricksByPlayer = currentHand?.tricksByPlayer ?? {};
  return {
    handNumber: sessionObj ? sessionHandNumber(sessionObj) : null,
    phase: currentHand?.phase ?? null,
    turnPlayerId: currentHand?.turnPlayerId ?? null,
    actionKind: actionKind ?? null,
    atMs: Date.now(),
    totalTricksPlayed: totalTricksPlayed(tricksByPlayer, participantIds),
    currentTrickLen: currentHand?.currentTrick?.length ?? 0,
    drawCompletedCount: (currentHand?.drawCompletedIds ?? []).length,
  };
}

function normalizeTableActionFeedback(feedback) {
  if (!feedback?.message) return feedback;
  const message = scrubRawInternalMessage(feedback.message);
  return message === feedback.message ? feedback : { ...feedback, message };
}

function clearStaleTableActionFeedback(sessionState) {
  if (!tableActionFeedback || tableActionFeedback.status !== "error") return false;
  if (!isStaleTableActionError(tableActionFeedbackContext, sessionState)) return false;
  tableActionFeedback = null;
  tableActionFeedbackContext = null;
  if (tableFeedbackTimer) {
    clearTimeout(tableFeedbackTimer);
    tableFeedbackTimer = null;
  }
  return true;
}

function setTableActionFeedback(feedback, context) {
  const normalized = feedback ? normalizeTableActionFeedback(feedback) : null;
  tableActionFeedback = normalized;
  if (normalized?.status === "error") {
    tableActionFeedbackContext = context ?? getActionErrorContext(null);
  } else {
    tableActionFeedbackContext = null;
  }
  if (tableFeedbackTimer) {
    clearTimeout(tableFeedbackTimer);
    tableFeedbackTimer = null;
  }
  if (normalized?.status === "success") {
    tableFeedbackTimer = setTimeout(() => {
      tableActionFeedback = null;
      tableActionFeedbackContext = null;
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

function enrollmentHasExpired(enrollment) {
  return enrollment?.active === true && Date.now() >= enrollmentDeadlineMs(enrollment);
}

function stopEnrollmentTimer() {
  if (enrollmentTimer) {
    clearInterval(enrollmentTimer);
    enrollmentTimer = null;
  }
}

function stopTablePlaySideEffects() {
  stopEnrollmentTimer();
  clearBotAdvanceSchedule();
  clearSessionOrchestrationSchedule();
  stopRobotPresentationSubscription();
}

function startEnrollmentTimer() {
  if (enrollmentTimer) return;
  if (!tablePlayOpen) return;
  const s = currentSessions.find((x) => x.id === openSessionId);
  if (!s || s.status === "final") return;
  const enrollmentActive = getSessionEnrollment(s)?.active === true;
  const pagatClock = isPagatHandClock(s);
  const needsDriver = sessionNeedsBotDriver(s, openScores);
  if (!enrollmentActive && !pagatClock && !needsDriver) return;

  enrollmentTimer = setInterval(() => {
    const sessionObj = currentSessions.find((x) => x.id === openSessionId);
    if (!sessionObj || sessionObj.status === "final") {
      stopEnrollmentTimer();
      return;
    }
    if (shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY, tablePlayOpen)) {
      scheduleSessionOrchestration(sessionObj, openScores, { reason: "enrollment-tick" });
      return;
    }
    if (enrollmentHasExpired(getSessionEnrollment(sessionObj))) {
      timeoutHandEnrollmentTurn(currentRoomId, openSessionId).catch((e) => {
        if (isBenignTableActionError(e)) {
          console.warn("enrollment timeout benign race:", e?.message ?? e);
          return;
        }
        console.warn("enrollment timeout:", e);
        const message = formatClientGameError(
          e,
          "Enrollment timer could not advance — check connection.",
        );
        setTableActionFeedback(
          { status: "error", message },
          getActionErrorContext("enrollment"),
        );
      });
      return;
    }
    scheduleSessionOrchestration(sessionObj, openScores, { reason: "enrollment-tick" });
  }, 500);
}
let tablePlayOpen = false;
/** Local ante override while Bourré settings save or snapshot re-render is in flight. */
let pendingRoomAnteOverride = null;
/** Local buy-in override while Bourré settings save or snapshot re-render is in flight. */
let pendingRoomBuyInOverride = null;
/** Local LmT / Rebuy / Split pot overrides while save or snapshot re-render is in flight. */
let pendingRoomBourreOverrides = null;
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

function tableReadyRoster(sessionObj) {
  return mergeScoresWithMembers(openScores, currentMembers, sessionObj?.players || []).map(
    (sc) => ({
      playerId: sc.playerId,
      displayName: sc.displayName,
      isRobot: sc.isRobot === true || isRobotPlayerId(sc.playerId),
    }),
  );
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

function populateCreateRoomAnteSelect(selectEl, current) {
  if (!selectEl) return;
  selectEl.innerHTML = renderAnteSelectOptionsHtml(current, escapeHtml);
}

function captureGameSetupBourreFromDom() {
  const limEl = $("#room-lim-enabled", roomDetailView);
  const rebuyEl = $("#room-rebuy-enabled", roomDetailView);
  const splitPotEl = $("#room-split-pot-enabled", roomDetailView);
  if (!limEl && !rebuyEl && !splitPotEl) return;
  pendingRoomBourreOverrides = readGameSetupBourreFromDom(roomDetailView);
}

function resolveRoomBourreSettings(roomBs) {
  return normalizeBourreSettings(
    mergeBourreSettingsWithPending(roomBs, pendingRoomBourreOverrides),
  );
}

function saveRoomBourreSettingsFromForm() {
  const buyInEl = $("#room-buy-in-amount", roomDetailView);
  const anteEl = $("#room-ante-amount", roomDetailView);
  const limEl = $("#room-lim-enabled", roomDetailView);
  const rebuyEl = $("#room-rebuy-enabled", roomDetailView);
  const splitPotEl = $("#room-split-pot-enabled", roomDetailView);
  if (!buyInEl || !anteEl || !limEl || !currentRoomId) return;
  pendingRoomBuyInOverride = parseBuyInAmount(buyInEl.value);
  pendingRoomAnteOverride = parseAnteAmount(anteEl.value);
  const limEnabled = limEl.checked;
  const rebuyEnabled = rebuyEl?.checked === true;
  const splitPotEnabled = splitPotEl?.checked === true;
  pendingRoomBourreOverrides = { limEnabled, rebuyEnabled, splitPotEnabled };
  updateRoomBourreSettings(currentRoomId, {
    buyInAmount: pendingRoomBuyInOverride,
    anteAmount: pendingRoomAnteOverride,
    limEnabled,
    rebuyEnabled,
    splitPotEnabled,
  })
    .then(() => {
      pendingRoomBuyInOverride = null;
      pendingRoomAnteOverride = null;
      pendingRoomBourreOverrides = null;
      syncAnteSelectToAmount($("#room-ante-amount", roomDetailView), anteEl.value);
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

function readBourreSettingsFromCreateForm(form) {
  return normalizeBourreSettings({
    buyInAmount: parseBuyInAmount($("#create-room-buy-in", form)?.value),
    anteAmount: parseAnteAmount($("#create-room-ante", form)?.value),
    limEnabled: $("#create-room-lim-enabled", form)?.checked === true,
    rebuyEnabled: $("#create-room-rebuy-enabled", form)?.checked === true,
    splitPotEnabled: $("#create-room-split-pot-enabled", form)?.checked === true,
  });
}

function openCreateRoomModal() {
  if (!createRoomModal || !createRoomForm) return;
  showRoomsError("");
  const defaults = normalizeBourreSettings(DEFAULT_BOURRE_SETTINGS);
  const nameEl = $("#create-room-name");
  if (nameEl) nameEl.value = "";
  const buyInEl = $("#create-room-buy-in", createRoomForm);
  if (buyInEl) buyInEl.value = String(defaults.buyInAmount);
  populateCreateRoomAnteSelect($("#create-room-ante", createRoomForm), defaults.anteAmount);
  const limEl = $("#create-room-lim-enabled", createRoomForm);
  if (limEl) limEl.checked = defaults.limEnabled;
  const rebuyEl = $("#create-room-rebuy-enabled", createRoomForm);
  if (rebuyEl) rebuyEl.checked = defaults.rebuyEnabled;
  const splitPotEl = $("#create-room-split-pot-enabled", createRoomForm);
  if (splitPotEl) splitPotEl.checked = defaults.splitPotEnabled;
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

const joinCodeInput = $("#join-code");
const joinSubmitBtn = $("[data-testid='join-code-submit']");
const createRoomBtn = $("#create-room");
const playNowBtn = $("#play-now");

/** Sync Create / Play Now / Join styling from invite-code input (join mode). */
function syncJoinRoomActionUi() {
  const joinMode = isJoinModeActive(joinCodeInput?.value);
  const roomActions = $("#join-form")?.closest(".room-actions");
  const joinBusy = joinSubmitBtn?.dataset.busy === "true";

  roomActions?.classList.toggle(JOIN_MODE_CLASS, joinMode);

  if (joinSubmitBtn) {
    joinSubmitBtn.classList.toggle("btn--primary", joinMode);
    joinSubmitBtn.disabled = joinBusy;
  }
  if (createRoomBtn) {
    createRoomBtn.disabled = joinMode;
  }
  if (playNowBtn) {
    playNowBtn.disabled = joinMode || playNowInFlight;
  }
}

if (joinCodeInput) {
  joinCodeInput.addEventListener("input", syncJoinRoomActionUi);
  joinCodeInput.addEventListener("change", syncJoinRoomActionUi);
}
syncJoinRoomActionUi();

$("#create-room").addEventListener("click", () => {
  if (!session || createRoomBtn?.disabled) return;
  openCreateRoomModal();
});

if (playNowBtn) {
  playNowBtn.addEventListener("click", () => {
    void runPlayNowFlow();
  });
}

function setPlayNowBusy(busy) {
  const btn = $("#play-now");
  if (!btn) return;
  btn.disabled = busy || isJoinModeActive(joinCodeInput?.value);
  btn.setAttribute("aria-busy", busy ? "true" : "false");
  btn.textContent = busy ? "Setting up…" : "Play Now";
}

function waitUntil(predicate, { timeoutMs = 20000, intervalMs = 80, label = "operation" } = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      try {
        if (predicate()) return resolve();
      } catch (err) {
        reject(err);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`${label} timed out`));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

/**
 * Create and open a regional session using the same Firestore path as + Open table.
 */
async function bootstrapNewSession({
  buyInAmount,
  handStake,
  limEnabled = false,
  rebuyEnabled = false,
  splitPotEnabled = false,
}) {
  if (!currentRoomId) throw new Error("Open a room first.");
  const players = currentMembers.map((m) => ({
    playerId: m.userId,
    displayName: m.displayName,
  }));
  if (players.length === 0 && session) {
    players.push({ playerId: session.uid, displayName: session.displayName });
  }
  const created = await createSession(currentRoomId, players, buyInAmount, {
    handStake,
    limEnabled,
  });
  if (!created?.id || !created.sessionName) {
    throw new Error("Could not create session — please try again.");
  }
  try {
    await updateRoomBourreSettings(currentRoomId, {
      buyInAmount,
      anteAmount: handStake,
      limEnabled,
      rebuyEnabled,
      splitPotEnabled,
    });
    pendingRoomBuyInOverride = null;
    pendingRoomAnteOverride = null;
    pendingRoomBourreOverrides = null;
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
    limEnabled,
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
  };
  rememberPendingSession(optimisticSession);
  currentSessions = mergeSessionsWithPending(currentSessions);
  roomSetupFocus = "game-setup";
  openSession(created.id);
  return created;
}

async function runPlayNowFlow() {
  if (!session) {
    showRoomsError("Sign in to use Play Now.");
    openAuth("signin");
    return;
  }
  if (playNowInFlight || playNowBtn?.disabled) return;

  playNowInFlight = true;
  setPlayNowBusy(true);

  let createdRoomId = null;

  try {
    const roomName = pickVacationRoomName(myRooms.map((r) => r.name).filter(Boolean));
    createdRoomId = await createRoom({
      owner: session,
      name: roomName,
      houseRules: DEFAULT_HOUSE_RULES,
      bourreSettings: playNowBourreSettings(),
    });

    openRoom(createdRoomId, { silent: true });

    await waitUntil(
      () =>
        currentRoomId === createdRoomId &&
        currentRoom &&
        session?.uid &&
        currentMembers.some((m) => m.userId === session.uid),
      { label: "Play Now room load" },
    );

    const created = await bootstrapNewSession({
      buyInAmount: PLAY_NOW_BUY_IN,
      handStake: PLAY_NOW_ANTE,
      limEnabled: false,
    });

    await waitUntil(
      () =>
        openSessionId === created.id &&
        tableReadyPlayerCount(resolveActiveSession()) >= 1,
      { label: "Play Now session ready" },
    );

    const robotCount = pickPlayNowRobotCount(MAX_TABLE_PLAYERS, 1);
    if (robotCount < 1) {
      throw new Error("Not enough seats available for Play Now.");
    }

    const takenNames = tableReadyRoster(resolveActiveSession()).map((p) => p.displayName);
    const robotNames = pickUniqueRobotNames(robotCount, takenNames);

    for (const name of robotNames) {
      const added = await addSessionRobot(currentRoomId, created.id, name);
      if (added === false) {
        throw new Error(`Could not add ${name} — try Play Now again.`);
      }
    }

    await waitUntil(
      () => tableReadyPlayerCount(resolveActiveSession()) >= 1 + robotCount,
      { label: "Play Now robot roster" },
    );

    showRoomsError("");
    await triggerSessionPlay("play-now");
  } catch (err) {
    console.error("runPlayNowFlow:", err);
    silentTableEntry = false;
    document.body.classList.remove("table-entry-silent");
    const hint =
      createdRoomId != null
        ? "Play Now could not finish — your room is open; finish setup or tap Play Now again."
        : "Play Now failed — please try again.";
    showRoomsError(formatClientGameError(err, hint));
    if (createdRoomId) {
      openRoom(createdRoomId);
    }
  } finally {
    playNowInFlight = false;
    setPlayNowBusy(false);
    if (!tablePlayOpen) {
      silentTableEntry = false;
      document.body.classList.remove("table-entry-silent");
    }
  }
}

function goToPrivateRooms() {
  const roomsView = $("#view-rooms");
  if (roomsView && !roomsView.hidden) return;
  if (location.hash !== "#rooms") {
    location.hash = "#rooms";
  }
  showView();
}

if (createRoomForm) {
  createRoomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!session) return;
    showRoomsError("");
    const name = $("#create-room-name")?.value.trim() || "";
    const houseRules = readHouseRulesFromForm(createRoomForm, "create-house-rule-");
    const bourreSettings = readBourreSettingsFromCreateForm(createRoomForm);
    try {
      const roomId = await createRoom({ owner: session, name, houseRules, bourreSettings });
      closeCreateRoomModal();
      roomSetupFocus = "game-setup";
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
  const joinBtn = joinSubmitBtn;
  if (joinBtn) {
    joinBtn.dataset.busy = "true";
    syncJoinRoomActionUi();
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
      joinBtn.dataset.busy = "false";
    }
    syncJoinRoomActionUi();
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

function openRoom(roomId, options = {}) {
  const silent = options.silent === true;
  clearDetailSubs();
  roomGoneHandled = false;
  currentRoomId = roomId;
  currentRoom = null;
  currentMembers = [];
  currentSessions = [];
  openSessionId = null;
  openScores = [];

  if (silent) {
    silentTableEntry = true;
    document.body.classList.add("table-entry-silent");
  } else {
    silentTableEntry = false;
    document.body.classList.remove("table-entry-silent");
    document.body.classList.add("room-detail-open");
    roomsListView.hidden = true;
    if (roomsIntro) roomsIntro.hidden = true;
    roomDetailView.hidden = false;
    roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;
  }
  pendingRoomBuyInOverride = null;
  pendingRoomAnteOverride = null;
  pendingRoomBourreOverrides = null;

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
        if (pendingRoomAnteOverride != null && pendingRoomAnteOverride === roomBs.anteAmount) {
          pendingRoomAnteOverride = null;
        }
        if (pendingRoomBourreOverrides) {
          const pending = pendingRoomBourreOverrides;
          const flagsMatch =
            (pending.limEnabled == null || pending.limEnabled === roomBs.limEnabled) &&
            (pending.rebuyEnabled == null || pending.rebuyEnabled === roomBs.rebuyEnabled) &&
            (pending.splitPotEnabled == null || pending.splitPotEnabled === roomBs.splitPotEnabled);
          if (flagsMatch) pendingRoomBourreOverrides = null;
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
  clearSessionAutoPlayTimer();
  sessionPlayInFlight = false;
  closeTablePlay();
  unmountTableSessionHost();
  resetSessionSetupSheet();
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
  stopRobotPresentationSubscription();
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
    titleEl.textContent = "Live Table";
    return;
  }
  const handNum = (openSessionObj.handCount ?? 0) + 1;
  const tableName = openSessionObj.sessionName || "Live Table";
  titleEl.textContent = `Hand #${handNum} · Live Table · ${tableName}`;
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
    err?.code === "enrollment-failed"
      ? "enrollment_failed"
      : err?.code === "insufficient-players"
        ? "insufficient_players"
        : analysis?.kind ?? "ready_enrollment";
  const message = tableStartupUserMessage({ ...analysis, kind }, err);
  const friendly = err ? formatClientGameError(err, message) : message;
  const displayMessage = friendly && friendly !== "internal" ? friendly : message;
  setTableActionFeedback({ status: "error", message: displayMessage });
  showRoomsError(displayMessage);
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

  const overlay = $("#table-play-overlay");
  if (!overlay) return;

  logGameFlow("table", "open-table-play-focus", {
    before: describeActiveElement(document.activeElement),
  });
  const blurred = blurActiveTextEntry(document);
  if (blurred) {
    logGameFlow("table", "open-table-play-blur", { blurred });
  }

  tablePlayOpen = true;
  silentTableEntry = false;
  document.body.classList.remove("table-entry-silent");
  overlay.hidden = false;
  document.body.classList.add("table-play-active");
  updateTablePlayTitle(openSessionObj);

  const needsDeal = startupAnalysis.needsEnrollment;

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
      await ensureHandEnrollment(currentRoomId, openSessionId, {
        members: currentMembers,
        roster: tableReadyRoster(mergedSession),
      });
    }
  } catch (err) {
    console.error("openTablePlay prepare:", err);
    let recovered = false;
    try {
      const fresh = await getSession(currentRoomId, openSessionId);
      recovered = sessionHandDealStarted(fresh);
    } catch (recoverErr) {
      console.warn("openTablePlay deal recovery check:", recoverErr);
    }
    if (!recovered) {
      showTableStartupFailure(startupAnalysis, err);
      return;
    }
  }

  await refreshTablePlayerRatings(openScores);

  const refreshed =
    (await refreshOpenSessionFromServer(currentRoomId, openSessionId)) ??
    currentSessions.find((s) => s.id === openSessionId) ??
    openSessionObj;
  await syncTableSession(refreshed);
  scheduleSessionOrchestration(refreshed, openScores, { reason: "open-table-play" });
  const feedbackApi = await ensureTableFeedbackApi();
  feedbackApi?.playGameStartFeedback?.();
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

function sessionHandNumber(sessionObj) {
  return (sessionObj?.handCount ?? 0) + 1;
}

function resetLocalHandCommitForHand(sessionId, handNumber) {
  if (
    localHandActionCommit &&
    (localHandActionCommit.sessionId !== sessionId ||
      localHandActionCommit.handNumber !== handNumber)
  ) {
    localHandActionCommit = null;
  }
}

function clearLocalHandCommit({ resync = true } = {}) {
  if (!localHandActionCommit) return;
  localHandActionCommit = null;
  if (!resync) return;
  const sessionObj = currentSessions.find((x) => x.id === openSessionId);
  if (sessionObj) scheduleTableSessionSync(sessionObj);
}

function commitLocalHandAction(kind, { discardCount = 0 } = {}) {
  if (!session?.uid || !openSessionId) return;
  const sessionObj = currentSessions.find((x) => x.id === openSessionId);
  if (!sessionObj) return;
  localHandActionCommit = createLocalHandCommit({
    sessionId: openSessionId,
    handNumber: sessionHandNumber(sessionObj),
    playerId: session.uid,
    kind,
    discardCount,
  });
  scheduleTableSessionSync(sessionObj);
}

function restoreRoomDetailAfterTable() {
  if (!currentRoomId) return;
  silentTableEntry = false;
  document.body.classList.remove("table-entry-silent");
  document.body.classList.add("room-detail-open");
  if (roomsListView) roomsListView.hidden = true;
  if (roomsIntro) roomsIntro.hidden = true;
  if (roomDetailView) roomDetailView.hidden = false;
  scheduleRenderRoomDetail();
}

function closeTablePlay() {
  tablePlayOpen = false;
  localHandActionCommit = null;
  cancelNextHandOpenTimer();
  stopTablePlaySideEffects();
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
  restoreRoomDetailAfterTable();
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

  $("#open-table-settings")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("nbl-open-table-settings"));
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
}

/** Room members drive robot enrollment, draw/play, and co-win votes while viewing. */
function processRobotActions(s, scores) {
  try {
    processRobotActionsInner(s, scores);
  } catch (e) {
    console.warn("processRobotActions:", e);
  }
}

function clearBotAdvanceSchedule() {
  getServerBotAdvance().clearSchedule();
}

function scheduleServerBotAdvance(s, scores, actorId, { reason = "snapshot" } = {}) {
  getServerBotAdvance().schedule(s, scores, actorId, { reason });
}

async function executeServerBotAdvance(s, scores, actorId, { reason = "snapshot" } = {}) {
  await getServerBotAdvance().execute(s, scores, actorId, { reason });
}

/**
 * Non-render orchestration: lifecycle recovery, enrollment tick wiring, bot requests.
 * Called from debounced scheduleSessionOrchestration — not from renderRoomDetail.
 */
function runSessionOrchestration(sessionObj, scores, { reason = "snapshot" } = {}) {
  if (!sessionObj || sessionObj.id !== openSessionId || sessionObj.status === "final") {
    stopEnrollmentTimer();
    return;
  }

  if (isGameFlowDebugEnabled()) {
    try {
      assertHandFlowConsistent(sessionObj);
    } catch (err) {
      console.warn("[nbl-invariant]", err?.code ?? "hand_flow", err?.message ?? err);
    }
  }

  maybeRecoverHandLifecycle(sessionObj);

  const enrollmentActive = getSessionEnrollment(sessionObj)?.active === true;
  const pagatClock = isPagatHandClock(sessionObj);
  const needsDriver = sessionNeedsBotDriver(sessionObj, scores);
  const needsEnrollment = sessionNeedsEnrollmentDriver(sessionObj);

  if (tablePlayOpen && (enrollmentActive || pagatClock || needsDriver || needsEnrollment)) {
    startEnrollmentTimer();
  } else if (!enrollmentActive && !pagatClock && !needsDriver) {
    stopEnrollmentTimer();
  }

  if (needsDriver || needsEnrollment || enrollmentActive || pagatClock) {
    processRobotActions(sessionObj, scores);
  }
}

function scheduleSessionOrchestration(sessionObj, scores, { reason = "snapshot" } = {}) {
  if (!sessionObj || sessionObj.status === "final") return;

  if (sessionOrchestrationTimer) {
    sessionOrchestrationCoalesce = true;
    logSessionOrchestrator("coalesce", {
      reason,
      sessionId: sessionObj.id,
      trigger: reason,
    });
    return;
  }

  logSessionOrchestrator("schedule", {
    reason,
    sessionId: sessionObj.id,
    debounceMs: SESSION_ORCHESTRATION_DEBOUNCE_MS,
  });

  sessionOrchestrationTimer = setTimeout(() => {
    sessionOrchestrationTimer = null;
    const latest = currentSessions.find((s) => s.id === sessionObj.id) ?? sessionObj;
    if (!latest || latest.status === "final") return;

    logSessionOrchestrator("run", {
      reason,
      sessionId: latest.id,
      trigger: reason,
    });
    runSessionOrchestration(latest, scores ?? openScores, { reason });

    if (sessionOrchestrationCoalesce) {
      sessionOrchestrationCoalesce = false;
      scheduleSessionOrchestration(latest, openScores, { reason: "coalesce-wake" });
    }
  }, SESSION_ORCHESTRATION_DEBOUNCE_MS);
}

function clearSessionOrchestrationSchedule() {
  if (sessionOrchestrationTimer) {
    clearTimeout(sessionOrchestrationTimer);
    sessionOrchestrationTimer = null;
  }
  sessionOrchestrationCoalesce = false;
}

function clearClientBotPlayTimer() {
  clientBotThinkSchedule.cancelPending({ reason: "clear" });
}

function scheduleClientBotPlayCard(s, scores, turnId, actorId, { reason = "client-play" } = {}) {
  if (robotActionInFlight) return;
  const ctx = snapshotGameFlowContext(s, scores);
  const playCtx = {
    handNumber: ctx.handNumber ?? 0,
    trickNumber: ctx.trickNumber ?? null,
    turnPlayerId: turnId,
    remainingHandCount: ctx.remainingHandCount ?? null,
  };
  if (shouldBlockRobotForPresentation(s, scores)) {
    clientBotThinkSchedule.playDelayState.markTurnEligible({
      ...playCtx,
      nowMs: Date.now(),
    });
    logBotOrchestrator("bot-turn-start", {
      ...ctx,
      turnPlayerId: turnId,
      owner: "client",
      trigger: reason,
      action: "waiting_presentation",
    });
    logBotOrchestrator("skip-request", {
      ...ctx,
      turnPlayerId: turnId,
      reason: "presentation_blocked",
      owner: "client",
      trigger: reason,
      action: "blocked",
    });
    return;
  }

  const expectedTurnKey = botPlayTurnKey(playCtx);
  clientBotThinkSchedule.playDelayState.markTurnEligible({
    ...playCtx,
    nowMs: Date.now(),
  });
  logBotOrchestrator("bot-turn-start", {
    ...ctx,
    turnPlayerId: turnId,
    owner: "client",
    trigger: reason,
  });

  const result = clientBotThinkSchedule.armPlayThink({
    ctx: playCtx,
    nowMs: Date.now(),
    shouldFire: () => {
      if (robotActionInFlight) return false;
      if (!currentRoomId || !openSessionId) return false;
      const latest = currentSessions.find((x) => x.id === openSessionId);
      if (!latest || latest.status === "final") return false;
      if (shouldBlockRobotForPresentation(latest, openScores)) return false;
      const latestCtx = snapshotGameFlowContext(latest, openScores);
      const latestTurnId = latestCtx.turnPlayerId;
      if (latestTurnId !== turnId) return false;
      return (
        botPlayTurnKey({
          handNumber: latestCtx.handNumber ?? 0,
          trickNumber: latestCtx.trickNumber ?? null,
          turnPlayerId: latestTurnId,
        }) === expectedTurnKey
      );
    },
    onFire: ({ plan }) => {
      if (robotActionInFlight) return;
      lastRobotTrickAt = Date.now();
      robotActionInFlight = true;
      robotPlayCard(currentRoomId, openSessionId, { playerId: turnId, actorId })
        .catch((e) => console.warn("robot play:", e))
        .finally(() => {
          finishRobotAction();
        });
      void plan;
    },
    log: {
      delayChosen: (extra) =>
        logBotOrchestrator("bot-delay-chosen", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          ...extra,
        }),
      armed: (extra) =>
        logBotOrchestrator("bot-think-armed", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          action: "scheduled",
          ...extra,
        }),
      coalesced: (extra) =>
        logBotOrchestrator("schedule-client-play", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          action: "coalesced",
          ...extra,
        }),
      canceled: (extra) =>
        logBotOrchestrator("bot-think-canceled", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          ...extra,
        }),
      accepted: (extra) =>
        logBotOrchestrator("bot-think-fire-accepted", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          ...extra,
        }),
      rejected: (extra) =>
        logBotOrchestrator("bot-think-fire-rejected", {
          ...ctx,
          turnPlayerId: turnId,
          owner: "client",
          trigger: reason,
          ...extra,
        }),
    },
  });

  if (result.action === "armed") {
    logBotOrchestrator("schedule-client-play", {
      ...ctx,
      turnPlayerId: turnId,
      owner: "client",
      trigger: reason,
      delayMs: result.delayMs,
      chosenBotDelayMs: result.chosenDelayMs,
      elapsedSinceTurnMs: result.elapsedSinceTurnMs,
      remainingHandCount: result.remainingHandCount,
      isLastCard: result.isLastCard,
      generation: result.generation,
      action: "scheduled",
    });
  }
}

function stopRobotPresentationSubscription() {
  if (robotPresentationUnsub) {
    robotPresentationUnsub();
    robotPresentationUnsub = null;
  }
}

function wakeRobotActions() {
  if (!tablePlayOpen || !openSessionId) return;
  const sessionObj = currentSessions.find((x) => x.id === openSessionId);
  if (!sessionObj || sessionObj.status === "final") return;
  if (robotActionInFlight) {
    pendingRobotWake = true;
    return;
  }
  scheduleSessionOrchestration(sessionObj, openScores, { reason: "presentation-wake" });
}

function ensureRobotPresentationSubscription(api) {
  if (robotPresentationUnsub || !api?.subscribeTrickAnimationBusy) return;
  robotPresentationUnsub = api.subscribeTrickAnimationBusy(() => {
    wakeRobotActions();
  });
}

function finishRobotAction() {
  robotActionInFlight = false;
  if (pendingRobotWake) {
    pendingRobotWake = false;
    wakeRobotActions();
  }
}

function robotTurnPresentationKey(s) {
  const ch = getSessionCurrentHand(s);
  return [
    sessionHandNumber(s),
    ch?.phase ?? "",
    ch?.turnPlayerId ?? "",
    ch?.currentTrick?.trickNumber ?? 0,
    ch?.currentTrick?.plays?.length ?? 0,
    (ch?.drawCompletedIds ?? []).length,
  ].join(":");
}

function isRawTablePresentationBusy() {
  try {
    if (typeof tableMountApi?.isTablePresentationBusyForBots === "function") {
      return tableMountApi.isTablePresentationBusyForBots() === true;
    }
    return tableMountApi?.isTablePresentationBusy?.() === true;
  } catch {
    return false;
  }
}

/**
 * Draw/play robot gate with per-turn deadline.
 * Works with legacy table-session.js (no evaluateBotPresentationGate export).
 */
function shouldBlockRobotForPresentation(s, scores) {
  const busy = isRawTablePresentationBusy();
  if (!busy) {
    robotPresentationBlockEpisode = null;
    return false;
  }

  const turnKey = robotTurnPresentationKey(s);
  const now = Date.now();
  if (
    !robotPresentationBlockEpisode ||
    robotPresentationBlockEpisode.turnKey !== turnKey
  ) {
    robotPresentationBlockEpisode = {
      turnKey,
      since: now,
      firstSeenLogged: false,
      softLogged: false,
      forceLogged: false,
    };
  }

  const ep = robotPresentationBlockEpisode;
  const blockedMs = now - ep.since;
  const ctx = snapshotGameFlowContext(s, scores);
  const gate = snapshotTablePresentationGate();

  if (blockedMs >= ROBOT_PRESENTATION_FORCE_MS) {
    if (!ep.forceLogged) {
      ep.forceLogged = true;
      tableMountApi?.forceReleasePresentationForBots?.("robot-turn-timeout");
      if (isGameFlowDebugEnabled()) {
        logGameFlow("processRobotActions", "robot-force-unblock", {
          ...ctx,
          turnKey,
          blockedMs,
          gate,
        });
        logGameFlow("trickAnimationBridge", "table-presentation-force-release", {
          ...ctx,
          turnKey,
          blockedMs,
          gate,
        });
      }
    }
    robotPresentationBlockEpisode = null;
    return false;
  }

  if (blockedMs >= ROBOT_PRESENTATION_SOFT_MS) {
    if (!ep.softLogged && isGameFlowDebugEnabled()) {
      ep.softLogged = true;
      logGameFlow("processRobotActions", "robot-block-soft-timeout", {
        ...ctx,
        turnKey,
        blockedMs,
        gate,
      });
    }
    return false;
  }

  if (!ep.firstSeenLogged && isGameFlowDebugEnabled()) {
    ep.firstSeenLogged = true;
    logGameFlow("processRobotActions", "robot-block-first-seen", {
      ...ctx,
      turnKey,
      blockedMs,
      gate,
    });
  }

  return true;
}

function snapshotTablePresentationGate() {
  try {
    const busy = tableMountApi?.getTrickAnimationBusyState?.();
    if (!busy) return null;
    return {
      blockReason: tableMountApi?.getTablePresentationBlockReason?.(busy) ?? null,
      handPresentationPhase: busy.handPresentationPhase,
      handPresenting: busy.handPresenting,
      pipelineActive: busy.pipelineActive,
      revealCatchUp: busy.revealCatchUp,
      motionGateActive: busy.motionGateActive,
      peakPlayCount: busy.peakPlayCount,
      displayedPlayCount: busy.displayedPlayCount,
    };
  } catch {
    return null;
  }
}

function snapshotGameFlowContext(s, scores) {
  const ch = getSessionCurrentHand(s);
  const participants = ch?.participantIds ?? [];
  const actionOrder = ch?.actionOrder ?? participants;
  const turnId = ch?.turnPlayerId ?? null;
  const turnIndex = turnId ? actionOrder.indexOf(turnId) : -1;
  const remainingHandCount =
    turnId && ch ? cardsRemainingInHand(ch, turnId) : null;
  return {
    handNumber: sessionHandNumber(s),
    handPhase: ch?.phase ?? null,
    trickNumber: ch?.currentTrick?.trickNumber ?? null,
    trickPlays: ch?.currentTrick?.plays?.length ?? 0,
    turnPlayerId: turnId,
    turnIndex,
    remainingHandCount,
    isLastCard: remainingHandCount === 1,
    dealerId: resolveHandDealerId(s?.dealerId ?? null, ch),
    actionOrder,
    drawCompleted: (ch?.drawCompletedIds ?? []).length,
    drawTotal: participants.length,
    trumpUpcard: Boolean(ch?.trumpUpcard),
    trumpSuit: ch?.trumpSuit ?? null,
    botCount: scores.filter((sc) => sc.isRobot === true || isRobotPlayerId(sc.playerId)).length,
    trickAnimBusy: isRawTablePresentationBusy(),
    presentationGate: snapshotTablePresentationGate(),
    robotActionInFlight,
    msSinceLastRobot: Date.now() - lastRobotTrickAt,
  };
}

function snapshotBotOrchestratorContext(s, scores, extra = {}) {
  return {
    ...snapshotGameFlowContext(s, scores),
    ...extra,
    pendingCoWin: Boolean(s?.pendingCoWinSettlement),
    enrollmentActive: Boolean(getSessionEnrollment(s)?.active),
    needsBotDriver: sessionNeedsBotDriver(s, scores),
  };
}

function processRobotActionsInner(s, scores, { clientFallbackOnly = false } = {}) {
  if (!currentRoomId || !openSessionId || !s || s.status === "final") return;
  const actorId = session?.uid;
  if (!actorId) return;

  const robotScores = scores.filter(
    (sc) => sc.isRobot === true || isRobotPlayerId(sc.playerId),
  );
  if (!robotScores.length) return;

  // Single-owner path: client requests; server executes all bot phases.
  if (
    shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY, tablePlayOpen) &&
    !clientFallbackOnly
  ) {
    scheduleServerBotAdvance(s, scores, actorId, { reason: "processRobotActions" });
    return;
  }

  if (robotActionInFlight) return;

  const now = Date.now();
  const enrollment = getSessionEnrollment(s);
  if (enrollment?.active) {
    if (!tablePlayOpen) return;
    if (enrollmentHasExpired(enrollment)) {
      timeoutHandEnrollmentTurn(currentRoomId, openSessionId).catch((e) =>
        console.warn("enrollment timeout:", e),
      );
      return;
    }
    const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
    const committedIds = enrollment.enrolledIds || [];
    const handPhase = getSessionCurrentHand(s)?.phase;
    const isPagatDecision = handPhase === "decision";
    if (
      currentId &&
      isRobotPlayerId(currentId) &&
      !committedIds.includes(currentId) &&
      !(enrollment.declinedIds || []).includes(currentId)
    ) {
      robotActionInFlight = true;
      const runBotEnrollment = async () => {
        if (isPagatDecision) {
          const ch = getSessionCurrentHand(s);
          const handData = await getPrivateHand(currentRoomId, openSessionId, currentId);
          if (handData && ch?.trumpSuit) {
            const privateHand = deserializeCards(handData.cards || []);
            const effective = effectivePlayerHand(currentId, privateHand, ch);
            if (botShouldPassDecision(effective, ch.trumpSuit)) {
              await setHandParticipation(currentRoomId, openSessionId, {
                playerId: currentId,
                inHand: false,
                actorId,
              });
              return;
            }
          }
        }
        await setHandParticipation(currentRoomId, openSessionId, {
          playerId: currentId,
          inHand: true,
          discardCount: 0,
          actorId,
        });
      };
      runBotEnrollment()
        .catch((e) => console.warn("robot enroll:", e))
        .finally(() => {
          finishRobotAction();
        });
    }
    return;
  }

  if (now - lastRobotTrickAt < ROBOT_TRICK_INTERVAL_MS) {
    const phaseGate = getSessionCurrentHand(s)?.phase;
    if (phaseGate !== "play") return;
  }

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
          finishRobotAction();
        });
    }
    return;
  }

  const currentHand = getSessionCurrentHand(s);
  const participants = currentHand.participantIds || [];
  if (!participants.length) return;

  const handPhase = currentHand.phase;

  if (handPhase === "draw") {
    if (!shouldClientDriveBotsDirectly(SERVER_HAND_AUTHORITY) && !clientFallbackOnly) {
      return;
    }

    if (shouldBlockRobotForPresentation(s, scores)) {
      return;
    }

    const turnId = currentHand.turnPlayerId;
    const drawDone = currentHand.drawCompletedIds || [];
    if (
      turnId &&
      isRobotPlayerId(turnId) &&
      participants.includes(turnId) &&
      !drawDone.includes(turnId)
    ) {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("processRobotActions", "robot-submit-draw", snapshotGameFlowContext(s, scores));
      }
      lastRobotTrickAt = now;
      robotActionInFlight = true;
      robotSubmitDraw(currentRoomId, openSessionId, {
        playerId: turnId,
        actorId,
        dealingRule: currentRoom?.houseRules?.dealing,
      })
        .catch((e) => console.warn("robot draw:", e))
        .finally(() => {
          finishRobotAction();
        });
    }
    return;
  }

  if (handPhase === "play") {
    if (!shouldClientDriveBotsDirectly(SERVER_HAND_AUTHORITY) && !clientFallbackOnly) {
      return;
    }

    if (shouldBlockRobotForPresentation(s, scores)) {
      return;
    }

    const turnId = currentHand.turnPlayerId;
    const trick = currentHand.currentTrick;
    const trickNum = trick?.trickNumber ?? 0;
    const trickPlays = trick?.plays?.length ?? 0;
    const tricks = currentHand.tricksByPlayer || {};
    const total = totalTricksPlayed(tricks, participants);
    if (total >= MAX_TRICKS_PER_HAND) return;

    if (
      trickNum === 5 &&
      trickPlays === 0 &&
      turnId &&
      isRobotPlayerId(turnId) &&
      participants.includes(turnId)
    ) {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("processRobotActions", "robot-play-card", snapshotGameFlowContext(s, scores));
      }
      scheduleClientBotPlayCard(s, scores, turnId, actorId, { reason: "auto-trick-5-lead" });
      return;
    }

    if (turnId && isRobotPlayerId(turnId) && participants.includes(turnId)) {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("processRobotActions", "robot-play-card", snapshotGameFlowContext(s, scores));
      }
      scheduleClientBotPlayCard(s, scores, turnId, actorId, { reason: "robot-play-card" });
    }
    return;
  }

  // Legacy manual trick tracking only when the card engine is not active.
  if (
    handPhase === "reveal" ||
    handPhase === "decision" ||
    currentHand.trumpSuit ||
    currentHand.deckSeed != null
  ) {
    return;
  }

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
      finishRobotAction();
    });
}

/** Honor-system fallback when gameAdvanceBots is unavailable or fails. */
function driveClientBotsForCurrentTurn(s, scores, actorId, { reason = "fallback" } = {}) {
  if (!shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY, tablePlayOpen)) return;
  if (!sessionNeedsBotDriver(s, scores)) return;
  if (shouldBlockRobotForPresentation(s, scores)) {
    getServerBotAdvance().markPendingWake();
    return;
  }
  logBotOrchestrator("client-fallback", {
    reason,
    requester: actorId,
    owner: "client",
    ...snapshotBotOrchestratorContext(s, scores),
  });
  processRobotActionsInner(s, scores, { clientFallbackOnly: true });
}

function buildTableSessionProps(s) {
  const mergedScores = mergeScoresWithMembers(openScores, currentMembers, s.players || []);
  const memberOrder = currentMembers.map((m) => ({ playerId: m.userId }));
  const sessionOrder = (s.players || []).map((p) => ({ playerId: p.playerId }));
  const playerOrder = memberOrder.length ? memberOrder : sessionOrder;
  const myUid = session?.uid ?? null;
  let displayScores = sortScoresForDisplay(mergedScores, playerOrder);
  if (myUid && !displayScores.some((sc) => sc.playerId === myUid)) {
    displayScores = [
      ...displayScores,
      {
        playerId: myUid,
        displayName: session?.displayName || "You",
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
      },
    ];
  }
  const currentHand = getSessionCurrentHand(s);
  const handParticipantIds = currentHand?.participantIds || [];
  const handPhase = currentHand?.phase ?? null;
  const trumpSuit = currentHand?.trumpSuit ?? null;
  const trumpUpcard = currentHand?.trumpUpcard ?? null;
  const tricksThisHand = currentHand?.tricksByPlayer || {};
  const cardsDealt = isHandCardsDealtPhase(handPhase);
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
  const dealerId = resolveHandDealerId(s.dealerId ?? null, currentHand);
  const handNumber = sessionHandNumber(s);
  resetLocalHandCommitForHand(s.id, handNumber);
  const serverEnrollment = getSessionEnrollment(s);
  localHandActionCommit = reconcileLocalCommit(localHandActionCommit, {
    sessionId: s.id,
    handNumber,
    myUid,
    enrollment: serverEnrollment,
    handPhase,
    currentHand,
  });
  if (
    localHandActionCommit &&
    myUid &&
    localHandActionCommit.kind === LOCAL_HAND_ACTION.DRAW &&
    Date.now() - (localHandActionCommit.atMs ?? 0) > 12_000 &&
    !(currentHand?.drawCompletedIds ?? []).includes(myUid)
  ) {
    clearLocalHandCommit();
    if (!tableActionFeedback || tableActionFeedback.status === "loading") {
      setTableActionFeedback(
        {
          status: "error",
          message: "Draw could not complete — check connection and try again.",
        },
        getActionErrorContext("draw"),
      );
    }
  }
  let enrollment = serverEnrollment;
  const pagatHandDecision = currentHand?.handDecision;
  const pagatDecisionActive = isPagatDecisionActive(handPhase, pagatHandDecision);
  if (localHandActionCommit && myUid) {
    enrollment = applyLocalCommitToEnrollment(localHandActionCommit, enrollment, myUid);
  }
  const pagatDecision = pagatDecisionActive;
  const legacyEnrollmentActive = isLegacyEnrollmentActive({
    cardsDealt,
    handParticipantCount: handParticipantIds.length,
    enrollmentActive: enrollment?.active === true,
  });
  const enrollmentActive = resolveTableEnrollmentActive({
    cardsDealt,
    handParticipantCount: handParticipantIds.length,
    legacyEnrollmentActive,
    pagatDecisionActive,
  });
  const enrolledDuringSignup = enrollment?.enrolledIds || [];
  const declinedEnrollmentIds = enrollment?.declinedIds || [];
  let plannedDiscards = currentHand?.handDecision?.plannedDiscards ?? {};
  if (localHandActionCommit && myUid) {
    plannedDiscards = applyLocalCommitPlannedDiscards(
      localHandActionCommit,
      plannedDiscards,
      myUid,
    );
  }
  let drawCompletedIds = currentHand?.drawCompletedIds ?? [];
  if (localHandActionCommit && myUid) {
    drawCompletedIds = applyLocalCommitDrawCompleted(
      localHandActionCommit,
      drawCompletedIds,
      myUid,
    );
  }
  const currentEnrollmentPlayerId = resolveCurrentHandChoicePlayerId({
    pagatDecisionActive,
    handDecision: pagatHandDecision,
    legacyEnrollmentActive,
    enrollment,
  });

  const { ready: handReady, winnerIds: derivedWinnerIds, maxTricks } = deriveWinnersFromTricks(
    tricksThisHand,
    handParticipantIds,
  );
  const totalTricks = totalTricksPlayed(tricksThisHand, handParticipantIds);
  const handComplete = isHandComplete(tricksThisHand, handParticipantIds);
  clearStaleTableActionFeedback({
    handNumber,
    phase: handPhase,
    turnPlayerId: currentHand?.turnPlayerId ?? null,
    handComplete,
    totalTricksPlayed: totalTricks,
    currentTrickLen: currentHand?.currentTrick?.length ?? 0,
    drawCompletedCount: drawCompletedIds.length,
  });
  if (
    tableActionFeedback?.status === "error" &&
    tableActionFeedbackContext?.actionKind === "private_hand" &&
    privateHandSnapSeen &&
    privateHeroCards.length > 0
  ) {
    tableActionFeedback = null;
    tableActionFeedbackContext = null;
  }
  const pendingWinners = s.pendingCoWinSettlement?.winnerIds;
  const activeWinnerIds =
    handReady && derivedWinnerIds.length > 0
      ? derivedWinnerIds
      : pendingWinners?.length
        ? pendingWinners
        : [];

  const postedAntes = currentHand?.postedAntes ?? {};
  const seatedIds =
    currentHand?.seatedIds?.length > 0
      ? currentHand.seatedIds
      : activeSeatedPlayerIds(s.players, displayScores);
  const resolvedActionOrder =
    currentHand && handParticipantIds.length > 0
      ? resolveActionOrder(
          {
            actionOrder: currentHand.actionOrder,
            participantIds: handParticipantIds,
            dealerId,
            seatedIds,
          },
          seatedIds,
        )
      : null;
  const limEnabled = s.limEnabled === true;
  const splitPotEnabled = normalizeBourreSettings(currentRoom?.bourreSettings).splitPotEnabled === true;
  const rebuyEnabled = normalizeBourreSettings(currentRoom?.bourreSettings).rebuyEnabled === true;
  const carryOver = s.carryOverPot ?? 0;
  const { potMetrics } = buildTablePotMetrics({
    handParticipantIds,
    sessionPlayers: s.players,
    displayScores,
    handStake,
    limEnabled,
    carryOver,
    postedAntes,
  });
  const scoreById = Object.fromEntries(displayScores.map((x) => [x.playerId, x]));

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
  const seatFlagCtx = {
    myUid,
    myPhotoUrl: session?.photoURL ?? null,
    sessionBuyIn,
    dealerId,
    handParticipantIds,
    tricksThisHand,
    cardsDealt,
    currentHand,
    handComplete,
    handReady,
    activeWinnerIds,
    enrolledDuringSignup,
    declinedEnrollmentIds,
    plannedDiscards,
    enrollmentActive,
    pagatDecisionActive,
    currentEnrollmentPlayerId,
    isFinal,
    totalTricks,
    ratingsByPlayerId: openPlayerRatings,
    applyLocalCommitToPlayerFlags,
    localHandActionCommit,
  };
  const lastHand = openHands[0];
  const recentBourreIds =
    lastHand && lastHand.handNumber === (s.handCount ?? 0)
      ? (lastHand.bourreIds || []).filter(Boolean)
      : [];

  const tableProps = {
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
      handEnrollment: enrollmentActive
        ? {
            ...enrollment,
            plannedDiscards,
          }
        : null,
      phase: handPhase,
      trumpHolderId: currentHand?.trumpHolderId ?? dealerId,
      trumpSuit,
      trumpUpcard,
      turnPlayerId: currentHand?.turnPlayerId ?? null,
      remainingDeckCount: currentHand?.remainingDeckCount ?? null,
      leadSuit: currentHand?.leadSuit ?? null,
      currentTrick: currentHand?.currentTrick ?? null,
      playedCards: currentHand?.playedCards ?? [],
      drawCompletedIds,
      maxDrawDiscards: currentHand?.maxDrawDiscards ?? null,
      cinchEnabled: currentHand?.cinchEnabled === true,
      postedAntes: currentHand?.postedAntes ?? {},
      actionOrder: resolvedActionOrder ?? undefined,
      seatedIds: seatedIds.length > 0 ? seatedIds : undefined,
    },
    heroCards: heroCardList,
    rawHeroCards: privateHeroCards,
    privateHandReady: privateHandSnapSeen,
    handComplete,
    legalPlayIndices,
    actionFeedback: tableActionFeedback,
    players: displayScores.map((sc) => buildTablePlayerSeatFlags(sc, seatFlagCtx)),
    potMetrics,
    mySessionNet:
      myUid != null
        ? Number(displayScores.find((sc) => sc.playerId === myUid)?.net) || 0
        : null,
    myHandContribution,
    leaderLabel: enrollmentActive
      ? buildEnrollmentLeaderLabel(displayScores, enrollment, myUid, pagatDecision)
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
    showCoWinSettlement,
    splitPotEnabled,
    rebuyEnabled,
    splitSharePerWinner,
    recentBourreIds,
    voteStatus: renderSettlementVoteStatus(s, displayScores, activeWinnerIds),
    currentUserId: myUid,
    actions: getTableIntentHandlers(),
  };
  maybeLogHandTransitionSnapshot(s, displayScores, privateHeroCards, tableActionFeedback);
  return tableProps;
}
let lastHandTransitionSnapKey = "";

function maybeLogHandTransitionSnapshot(s, displayScores, privateHeroCards, tableActionFeedback) {
  if (!isHandTransitionDebugEnabled()) return;
  const snap = snapshotHandTransitionState({
    session: s,
    scores: displayScores,
    myUid: session?.uid ?? null,
    privateHandCards: privateHeroCards,
    privateHandSnapSeen,
    sessionHandDealStarted: sessionHandDealStarted(s),
    tableActionFeedback,
  });
  const snapKey = JSON.stringify({
    sessionId: snap.sessionId,
    handCount: snap.handCount,
    phase: snap.phase,
    waitingCount: snap.decisionWaitingCount || snap.enrollmentWaitingCount,
    turn: snap.decisionTurn || snap.enrollmentTurn,
    participantIds: snap.participantIds,
    eligiblePlayerIds: snap.eligiblePlayerIds,
    outPlayerIds: snap.outPlayerIds,
    heroPrivateCardCount: snap.heroPrivateCardCount,
    tableFeedback: snap.tableFeedback,
  });
  if (snapKey === lastHandTransitionSnapKey) return;
  lastHandTransitionSnapKey = snapKey;
  logHandTransition("table_snapshot", {
    waitingCount: snap.decisionWaitingCount || snap.enrollmentWaitingCount,
    ...snap,
  });
  analyzeHandTransitionAnomalies(snap);
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
    ensureRobotPresentationSubscription(api);
    void processTableFeedbackEvents(sessionObj);
  } catch (err) {
    console.error("table-session mount:", err);
    const detail = err instanceof Error ? err.message : String(err);
    host.innerHTML = `<p class="muted small">Table UI failed to load (${escapeHtml(detail)}). Run <code>npm run build:table</code>, refresh, and redeploy if this persists.</p>`;
  }
}

function scheduleTableSessionSync(openSessionObj) {
  cancelAnimationFrame(tableSyncFrame);
  tableSyncFrame = requestAnimationFrame(() => {
    if (isGameFlowDebugEnabled()) {
      const sessionObj = resolveOpenSessionObj(openSessionObj);
      if (sessionObj) {
        logGameFlow("scheduleTableSessionSync", "raf", snapshotGameFlowContext(sessionObj, openScores));
      }
    }
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
      if (isBenignTableActionError(err)) {
        console.warn("privateHand subscription benign race:", err?.message ?? err);
        return;
      }
      console.error("privateHand subscription:", err);
      const message = formatClientGameError(err, "Could not load your private hand");
      setTableActionFeedback(
        { status: "error", message },
        getActionErrorContext("private_hand"),
      );
      const sessionObj = currentSessions.find((x) => x.id === openSessionId);
      if (sessionObj) scheduleTableSessionSync(sessionObj);
    },
  );
}

function openSession(sessionId) {
  if (scoresUnsub) scoresUnsub();
  if (handsUnsub) handsUnsub();
  stopPrivateHandSubscription();
  const previousSessionId = openSessionId;
  if (previousSessionId && previousSessionId !== sessionId) {
    clearSessionSetupSheetSnap();
  }
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
      return `<button type="button" class="session-tab ${active ? "is-active" : ""}" data-open-session="${sessionObj.id}" aria-label="${escapeHtml(sessionTabLabel(sessionObj))}" aria-current="${active ? "true" : "false"}">${escapeHtml(sessionTabLabel(sessionObj))}</button>`;
    })
    .join("");
}

function scheduleRenderRoomDetail() {
  const open = currentSessions.find((s) => s.id === openSessionId);
  if (open) scheduleSessionOrchestration(open, openScores, { reason: "snapshot" });
  if (renderRoomDetailTimer) clearTimeout(renderRoomDetailTimer);
  renderRoomDetailTimer = window.setTimeout(() => {
    renderRoomDetailTimer = 0;
    renderRoomDetail();
  }, 80);
}

function renderRoomDetail() {
  if (!currentRoomId || roomDetailView.hidden) return;
  if (silentTableEntry && !tablePlayOpen) return;
  if (!currentRoom) {
    roomDetailView.innerHTML = `<p class="muted">Loading room…</p>`;
    return;
  }

  // Preserve in-progress form state across snapshot re-renders.
  captureGameSetupBourreFromDom();
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
  const bourreSettings = resolveRoomBourreSettings(
    currentRoom.bourreSettings || DEFAULT_BOURRE_SETTINGS,
  );
  const openSessionObj = resolveActiveSession();
  const isOwner = session?.uid === currentRoom.ownerId;
  const visibleMembers = currentMembers;
  const roomBuyInAmount = pendingRoomBuyInOverride ?? bourreSettings.buyInAmount;
  const roomAnteAmount = resolveRoomAnteAmount(pendingRoomAnteOverride, bourreSettings.anteAmount);
  const sessionPool = isValidSessionNamePool(currentRoom.sessionNamePool)
    ? currentRoom.sessionNamePool
    : [];
  const claimedNames = claimedSessionNamesForRoom(currentRoom, currentSessions);
  const sessionHardCap = currentSessions.length >= MAX_ROOM_SESSIONS;
  const canCreateSession =
    isOwner &&
    !sessionHardCap &&
    canCreateAnotherSession(currentSessions.length, sessionPool, claimedNames);
  const newSessionDisabledReason = !isOwner
    ? ""
    : sessionHardCap
      ? "All 4 regional tables are already open."
      : !canCreateSession
        ? "No preset table names available — try again in a moment."
        : "";

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
      <section class="subpanel">
        <h4>House rules</h4>
        ${isOwner ? renderHouseRulesEditor(hr) : renderHouseRulesReadOnly(hr)}
      </section>

      <section class="subpanel">
        <h4>Room members (${visibleMembers.length})</h4>
        <p class="muted small members__hint">Signed-in accounts with access to this room.</p>
        <ul class="members">
          ${visibleMembers
            .map((m) => {
              const uid = m.userId || "";
              const canKick =
                isOwner &&
                uid &&
                uid !== currentRoom.ownerId &&
                uid !== session?.uid;
              const roleLabel = m.role === "owner" ? "owner" : "member";
              return `<li class="members__row" data-testid="roster-entry-member">
                <span class="dot"></span>
                <span class="members__name">${escapeHtml(m.displayName)}</span>
                <em class="members__role">${escapeHtml(roleLabel)}</em>
                ${
                  canKick
                    ? `<button type="button" class="btn btn--sm btn--danger members__kick" data-kick-member="${escapeHtml(uid)}" data-kick-name="${escapeHtml(m.displayName)}" aria-label="Remove ${escapeHtml(m.displayName)} from room">Remove</button>`
                    : ""
                }
              </li>`;
            })
            .join("")}
        </ul>
      </section>
    </div>

    <section class="subpanel subpanel--regional-tables">
      <div class="subpanel__head">
        <h4>Regional tables</h4>
        <p class="muted small session-preset-note">Up to ${MAX_ROOM_SESSIONS} tables per room. Switch tabs below; setup stays in one panel.</p>
      </div>
      <div class="session-tabs session-tabs--preset">
        ${renderCreatedSessionTabs(sessionPool, currentSessions, openSessionId)}
      </div>
      <div id="game-setup-root">${buildUnifiedGameSetupHtml({
        openSessionObj,
        isOwner,
        canCreateSession,
        newSessionDisabledReason,
        sessionHardCap,
        currentSessionsLength: currentSessions.length,
        roomBuyInAmount,
        roomAnteAmount,
        bourreSettings,
      })}</div>
      <div id="session-panel-mount"></div>
    </section>`;

  if (openSessionObj) {
    mountSessionPanel(openSessionObj, isOwner);
  }
  scheduleTableSessionSync(openSessionObj);
  if (shouldRestoreRoomDetailFocus(tablePlayOpen) && editingNotes) {
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
  if (shouldRestoreRoomDetailFocus(tablePlayOpen) && editingHouseRule) {
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
  if (shouldRestoreRoomDetailFocus(tablePlayOpen) && editingAddPlayer) {
    const addPlayerEl = $("#add-player-name", roomDetailView);
    const robotEl = $("#add-player-robot", roomDetailView);
    if (addPlayerEl) {
      addPlayerEl.value = editingAddPlayer.value;
      addPlayerEl.focus();
    }
    if (robotEl) robotEl.checked = editingAddPlayer.robotChecked;
  }
  applyRoomSetupFocus();
}

function rosterPanelHtml(sessionObj, isOwner) {
  const buyIn = resolveSessionBuyIn(sessionObj, normalizeBourreSettings(currentRoom?.bourreSettings));
  return buildSetupRosterHtml(sessionObj, isOwner, {
    roster: tableReadyRoster(sessionObj),
    scores: openScores,
    members: currentMembers,
    buyIn,
    escapeHtml,
    formatRiskStake,
    scoreBankroll,
  });
}

function stakesPanelHtml(isOwner, roomBuyInAmount, roomAnteAmount, bourreSettings) {
  return buildGameSetupStakesHtml(isOwner, roomBuyInAmount, roomAnteAmount, bourreSettings, {
    escapeHtml,
    renderAnteSelectOptionsHtml,
    formatRiskStake,
    formatAnteStake,
  });
}

function sessionLiveCardHtml(s) {
  return buildSessionLiveStatusHtml(s, {
    tableReadyPlayerCount,
    tablePlayOpen,
    formatAnteStake,
    escapeHtml,
    getSessionEnrollment,
    getSessionCurrentHand,
  });
}

/** Unified game setup panel (stakes, roster, play CTA). */
function buildUnifiedGameSetupHtml({
  openSessionObj,
  isOwner,
  canCreateSession,
  newSessionDisabledReason,
  sessionHardCap,
  currentSessionsLength,
  roomBuyInAmount,
  roomAnteAmount,
  bourreSettings,
}) {
  const hasActiveSession = openSessionObj && openSessionObj.status !== "final";
  const ready = hasActiveSession && tableReadyPlayerCount(openSessionObj) >= 2;
  const playDisabled = ready ? "" : 'disabled aria-disabled="true"';
  const playTitle = ready
    ? "Open the live card table"
    : "Add at least one more player (you count as player 1), then tap Play";

  const stepLabel = gameSetupStepLabel({ hasActiveSession, ready, isOwner });

  const openTableBtn = isOwner
    ? `<button class="btn btn--primary" id="new-session" type="button" data-testid="open-table-btn" ${
        canCreateSession ? "" : 'disabled aria-disabled="true"'
      } title="${escapeHtml(
        canCreateSession
          ? "Open a regional table and start building your roster"
          : newSessionDisabledReason || "Cannot open another table",
      )}">${hasActiveSession ? "+ Open another table" : "Open table"}</button>`
    : "";

  const sessionMeta = hasActiveSession
    ? `<p class="game-setup-panel__table-name"><strong>${escapeHtml(openSessionObj.sessionName || "Table")}</strong> · ante ${escapeHtml(formatAnteStake(openSessionObj.handStake ?? roomAnteAmount))}</p>`
    : "";

  const capNote =
    isOwner && currentSessionsLength > 0
      ? `<p class="muted small session-cap-note">${currentSessionsLength} of ${MAX_ROOM_SESSIONS} regional table${currentSessionsLength === 1 ? "" : "s"} open${
          sessionHardCap ? " (max reached)" : ""
        }</p>`
      : "";

  const addSection =
    hasActiveSession && isOwner
      ? `<div class="game-setup-panel__add" data-testid="session-add-players">
          <h5>Add guest or robot</h5>
          <p class="muted small">You count as player 1. Need at least two seated players before Play.</p>
          ${buildAddPlayerFormHtml()}
        </div>`
      : !isOwner && hasActiveSession
        ? `<p class="muted small">Only the host can add guests and robots.</p>`
        : "";

  const actions =
    hasActiveSession && openSessionObj.status !== "final"
      ? `<footer class="game-setup-panel__actions" data-testid="session-action-pills">
          <button type="button" class="btn btn--primary btn--block btn--cta-orb game-setup-panel__play" id="open-table-play" data-testid="open-table-play" ${playDisabled} title="${playTitle}">Play</button>
          ${
            isOwner
              ? `<button type="button" class="btn btn--sm game-setup-panel__stats" id="complete-session" title="Complete session and update Ape Scores">Update Stats</button>`
              : ""
          }
        </footer>`
      : isOwner && !hasActiveSession
        ? `<footer class="game-setup-panel__actions game-setup-panel__actions--open">
            ${openTableBtn}
            ${capNote}
          </footer>`
        : "";

  return `<section class="game-setup-panel" data-testid="game-setup-panel">
    <div class="session-setup-window" data-testid="session-setup-window">
      <header class="game-setup-panel__head">
        <h4>Get ready to play</h4>
        <p class="game-setup-panel__step" data-testid="game-setup-step">${escapeHtml(stepLabel)}</p>
      </header>
      ${stakesPanelHtml(isOwner, roomBuyInAmount, roomAnteAmount, bourreSettings)}
      ${sessionMeta}
      <div class="game-setup-panel__roster">
        <h5>Roster</h5>
        ${rosterPanelHtml(openSessionObj, isOwner)}
      </div>
      ${addSection}
      ${actions}
      ${hasActiveSession && isOwner && canCreateSession && !sessionHardCap ? `<div class="game-setup-panel__secondary">${openTableBtn}${capNote}</div>` : ""}
    </div>
  </section>`;
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
           <p class="session-ledger-net">Your session profit/loss: <strong>${escapeHtml(formatNet(myScore.net ?? 0))}</strong></p>
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

/** Session ledger panel — add players inline while waiting; notes/results here. */
function mountSessionPanel(s, isOwner) {
  const mount = $("#session-panel-mount", roomDetailView);
  if (!mount) return;

  const isFinal = s.status === "final";
  const playerCount = tableReadyPlayerCount(s);
  const sidebarHtml = buildSessionSidebarHtml(s);
  const liveCardHtml = sessionLiveCardHtml(s);

  if (isFinal) {
    resetSessionPanelTableHost();
    mount.innerHTML = `
      <div class="session session--stack">
        ${buildSessionResultsHtml(s, escapeHtml)}
        <aside class="session-sidebar">${sidebarHtml}</aside>
      </div>`;
    return;
  }

  if (playerCount < 2) {
    resetSessionPanelTableHost();
    mount.innerHTML = `
      <div class="session session--stack session--waiting">
        <p class="muted small session-waiting-players">
          Need at least one more player for the live table (you count as player 1). ${
            isOwner
              ? "Add guests or robots in the setup panel, then tap"
              : "Ask the host to add players, then tap"
          } <strong>Play</strong>.
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
      ${buildSessionResultsHtml(s, escapeHtml)}
      <aside class="session-sidebar">${sidebarHtml}</aside>
    </div>`;
  }

  const tableHost =
    playerCount < 2
      ? `<p class="muted small session-waiting-players">Need at least two players for the live table.</p>`
      : `<div class="session-table-wrap">
           <div id="table-session-inline-root" class="table-session-root" aria-label="Live card table"></div>
           <div class="session-play-cta">
             <button type="button" class="btn btn--primary btn--block" id="open-table-play-inline" data-testid="open-table-play-inline">
               Play
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

    const roomBs = normalizeBourreSettings(
      currentRoom?.bourreSettings || DEFAULT_BOURRE_SETTINGS,
    );
    const formBs = readGameSetupBourreFromDom(roomDetailView);
    const buyInAmount = pendingRoomBuyInOverride ?? parseBuyInAmount($("#room-buy-in-amount", roomDetailView)?.value) ?? roomBs.buyInAmount;
    const handStake = resolveRoomAnteAmount(
      pendingRoomAnteOverride ?? parseAnteAmount($("#room-ante-amount", roomDetailView)?.value),
      roomBs.anteAmount,
    );
    const limEnabled = pendingRoomBourreOverrides?.limEnabled ?? formBs.limEnabled ?? roomBs.limEnabled;
    const rebuyEnabled = pendingRoomBourreOverrides?.rebuyEnabled ?? formBs.rebuyEnabled ?? roomBs.rebuyEnabled;
    const splitPotEnabled =
      pendingRoomBourreOverrides?.splitPotEnabled ?? formBs.splitPotEnabled ?? roomBs.splitPotEnabled;
    pendingRoomBourreOverrides = { limEnabled, rebuyEnabled, splitPotEnabled };

    await bootstrapNewSession({
      buyInAmount,
      handStake,
      limEnabled,
      rebuyEnabled,
      splitPotEnabled,
    });
    showRoomsError("");
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

async function onSettleCoWinCarryover() {
  if (!currentRoomId || !openSessionId || !session) return;
  try {
    await settleCoWinCarryover(currentRoomId, openSessionId, {
      recordedBy: session.uid,
    });
  } catch (err) {
    if (String(err?.message || "").includes("No pending")) return;
    console.error("settleCoWinCarryover:", err);
  }
}

async function onRebuySession() {
  if (!currentRoomId || !openSessionId || !session?.uid) return;
  try {
    await rebuySessionPlayer(currentRoomId, openSessionId, {
      playerId: session.uid,
      actorId: session.uid,
    });
    const refreshed = await refreshOpenSessionFromServer(currentRoomId, openSessionId);
    if (refreshed) await syncTableSession(refreshed);
    showRoomsError("Rebuy complete — you can join the next hand.", "success");
  } catch (err) {
    console.error("rebuySessionPlayer:", err);
    showRoomsError(err.message || "Could not rebuy");
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
function hideNativeSplashWhenReady() {
  if (!isCapacitorNative()) return;
  window.__nblNative?.hideSplash?.();
}

if (isCapacitorNative()) {
  console.info("[nbl-native]", "app-boot-start", {
    platform: window.Capacitor?.getPlatform?.() ?? "unknown",
  });
}

mountVersionFooter(VERSION_DISPLAY_LABEL, BUILD_STAMPED_AT);
startVersionUpdateWatcher();

renderRoomsList();
renderLeagues();
bindRoomDetailDelegatedControls();
bindTablePlayControls();
initTheme();
wireThemeToggle($("#theme-toggle"));
showView();
logHandTransitionBoot();
hideNativeSplashWhenReady();

if (isCapacitorNative()) {
  console.info("[nbl-native]", "app-boot-ready");
}

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

/** Local emulator E2E: explicit bot-advance nudge when draw stalls (no-op in production). */
if (typeof globalThis !== "undefined") {
  const host = globalThis.location?.hostname ?? "";
  if (host === "localhost" || host === "127.0.0.1") {
    globalThis.__nblE2E = {
      nudgeBots() {
        if (!currentRoomId || !openSessionId) {
          return Promise.resolve({ ok: false, reason: "no-session" });
        }
        const sessionObj = currentSessions.find((x) => x.id === openSessionId);
        if (!sessionObj) {
          return Promise.resolve({ ok: false, reason: "no-session" });
        }
        const actorId = session?.uid ?? "e2e-nudge";
        return executeServerBotAdvance(sessionObj, openScores, actorId, {
          reason: "e2e-nudge",
        }).then(() => ({ ok: true }));
      },
    };
  }
}
