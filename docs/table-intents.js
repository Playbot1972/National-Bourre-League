/**
 * Table intent handlers — submit user actions to Firestore / Cloud Functions.
 * No rendering; callers wire feedback and local optimistic commits.
 */

import { LOCAL_HAND_ACTION } from "./local-hand-commit.js";
import { isBenignTableActionError } from "./table-action-feedback.js";

/**
 * @param {object} deps
 * @param {() => { uid: string } | null} deps.getAuth
 * @param {() => string | null} deps.getRoomId
 * @param {() => string | null} deps.getSessionId
 * @param {() => object[]} deps.getCurrentSessions
 * @param {() => string | null} deps.getHandPhase
 * @param {() => object | null} deps.getCurrentHand
 * @param {(fb: object | null) => void} deps.setTableActionFeedback
 * @param {(msg: string) => void} deps.showRoomsError
 * @param {(kind: string, opts?: object) => void} deps.commitLocalHandAction
 * @param {() => void} deps.clearLocalHandCommit
 * @param {() => void} deps.markPendingDrawShuffle
 * @param {(sessionObj: object) => void} deps.scheduleTableSessionSync
 * @param {(sessionObj: object, scores: object[]) => void} [deps.wakeBotsAfterHandAction]
 * @param {(roomId: string, sessionId: string, payload: object) => Promise<unknown>} deps.setHandParticipation
 * @param {(roomId: string, sessionId: string, payload: object) => Promise<unknown>} deps.submitHandDraw
 * @param {(roomId: string, sessionId: string, payload: object) => Promise<unknown>} deps.foldHandDraw
 * @param {(roomId: string, sessionId: string, payload: object) => Promise<unknown>} deps.playHandCard
 * @param {(roomId: string, sessionId: string) => Promise<unknown>} deps.advanceHandReveal
 * @param {(roomId: string, sessionId: string, playerId: string, delta: number, actorId: string) => Promise<unknown>} deps.updateHandTrick
 * @param {(choice: string) => Promise<unknown>} deps.onSettleHand
 * @param {() => Promise<unknown>} [deps.onSettleCarryover]
 * @param {() => Promise<unknown>} [deps.onRebuy]
 * @param {(err: unknown, fallback: string) => string} deps.formatClientGameError
 * @param {(kind?: string) => object | null} [deps.getActionErrorContext]
 * @param {object} deps.getSessionCurrentHand
 */
export function createTableIntentHandlers(deps) {
  function actionErrorMessage(err, fallback) {
    return deps.formatClientGameError(err, fallback);
  }

  function setActionError(err, fallback, actionKind) {
    if (isBenignTableActionError(err)) {
      console.warn("Benign table action error suppressed:", err?.message ?? err);
      return null;
    }
    const message = actionErrorMessage(err, fallback);
    const context = deps.getActionErrorContext?.(actionKind) ?? null;
    deps.setTableActionFeedback({ status: "error", message }, context);
    return message;
  }

  function requireAuth(message) {
    const auth = deps.getAuth();
    if (!auth?.uid || !deps.getRoomId() || !deps.getSessionId()) {
      deps.setTableActionFeedback({ status: "error", message });
      return null;
    }
    return auth;
  }

  return {
    onToggleInHand(inHand) {
      const auth = requireAuth("Sign in to join the hand.");
      if (!auth) return;
      const roomId = deps.getRoomId();
      const sessionId = deps.getSessionId();
      const liveHand = deps.getSessionCurrentHand(
        deps.getCurrentSessions().find((x) => x.id === sessionId),
      );
      const livePhase = liveHand?.phase ?? null;
      const cardsAlreadyDealt =
        livePhase === "reveal" ||
        livePhase === "decision" ||
        livePhase === "draw" ||
        livePhase === "play";
      if (cardsAlreadyDealt && inHand) {
        deps.commitLocalHandAction(LOCAL_HAND_ACTION.DECISION_PLAY, { discardCount: 0 });
        deps.setTableActionFeedback({ status: "loading", message: "Joining hand…" });
        deps
          .setHandParticipation(roomId, sessionId, {
            playerId: auth.uid,
            inHand: true,
            discardCount: 0,
            actorId: auth.uid,
          })
          .then(() => {
            deps.setTableActionFeedback({ status: "success", message: "You're in this hand." });
          })
          .catch((e) => {
            deps.clearLocalHandCommit();
            const message = setActionError(e, "Could not play this hand", "enrollment");
            if (message) deps.showRoomsError(message);
          });
        return;
      }
      deps.commitLocalHandAction(
        inHand ? LOCAL_HAND_ACTION.ENROLL_PLAY : LOCAL_HAND_ACTION.ENROLL_PASS,
      );
      deps.setTableActionFeedback({
        status: "loading",
        message: inHand ? "Joining hand…" : "Passing hand…",
      });
      deps
        .setHandParticipation(roomId, sessionId, {
          playerId: auth.uid,
          inHand,
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback({
            status: "success",
            message: inHand ? "You're in this hand." : "You passed this hand.",
          });
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          const message = setActionError(e, "Could not update hand participation", "enrollment");
          if (message) deps.showRoomsError(message);
        });
    },

    onPassEnrollment() {
      const auth = requireAuth("Sign in to pass.");
      if (!auth) return;
      const handPhase = deps.getHandPhase();
      const kind =
        handPhase === "decision"
          ? LOCAL_HAND_ACTION.DECISION_PASS
          : LOCAL_HAND_ACTION.ENROLL_PASS;
      deps.commitLocalHandAction(kind);
      deps.setTableActionFeedback({ status: "loading", message: "Passing hand…" });
      deps
        .setHandParticipation(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          inHand: false,
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback({ status: "success", message: "You passed this hand." });
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          const message = setActionError(e, "Could not pass this hand", "enrollment");
          if (message) deps.showRoomsError(message);
        });
    },

    onDecisionPlay(discardCount) {
      const auth = requireAuth("Sign in to play.");
      if (!auth) return;
      const label = discardCount > 0 ? `Playing — will draw ${discardCount}` : "Staying pat";
      deps.commitLocalHandAction(LOCAL_HAND_ACTION.DECISION_PLAY, { discardCount });
      deps.setTableActionFeedback({ status: "loading", message: `${label}…` });
      deps
        .setHandParticipation(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          inHand: true,
          discardCount,
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback({
            status: "success",
            message:
              discardCount > 0 ? `You're in — draw ${discardCount}` : "You're in — standing pat",
          });
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          const message = setActionError(e, "Could not play this hand", "enrollment");
          if (message) deps.showRoomsError(message);
        });
    },

    onAdvanceReveal() {
      const roomId = deps.getRoomId();
      const sessionId = deps.getSessionId();
      if (!roomId || !sessionId) return Promise.resolve();
      return deps.advanceHandReveal(roomId, sessionId).catch((e) => {
        if (isBenignTableActionError(e)) {
          console.warn("advanceHandReveal benign race:", e?.message ?? e);
          return;
        }
        const lower = String(e?.message ?? "").toLowerCase();
        if (lower.includes("not in reveal")) return;
        console.warn("advanceHandReveal:", e);
        const message = setActionError(e, "Could not open draw phase", "reveal");
        if (message) deps.showRoomsError(message);
      });
    },

    onTrickDelta(delta) {
      const auth = requireAuth("Sign in to update tricks.");
      if (!auth) return;
      deps
        .updateHandTrick(deps.getRoomId(), deps.getSessionId(), auth.uid, delta, auth.uid)
        .catch((e) => deps.showRoomsError(e.message || "Could not update tricks"));
    },

    onSubmitDraw(discardIndices) {
      const auth = requireAuth("Sign in to draw");
      if (!auth) return Promise.reject(new Error("Sign in to draw"));
      const currentHand = deps.getCurrentHand();
      const maxDraw = currentHand?.maxDrawDiscards ?? 5;
      if (discardIndices.length > maxDraw) {
        const err = new Error(`You may discard at most ${maxDraw} cards`);
        deps.setTableActionFeedback({ status: "error", message: err.message });
        return Promise.reject(err);
      }
      deps.commitLocalHandAction(LOCAL_HAND_ACTION.DRAW);
      deps.setTableActionFeedback({
        status: "loading",
        message: discardIndices.length ? `Drawing ${discardIndices.length}…` : "Standing pat…",
      });
      return deps
        .submitHandDraw(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          discardIndices,
          actorId: auth.uid,
        })
        .then(() => {
          if (discardIndices.length > 0) deps.markPendingDrawShuffle();
          deps.setTableActionFeedback({
            status: "success",
            message: discardIndices.length
              ? `Drew ${discardIndices.length} replacement card(s)`
              : "Standing pat",
          });
          const sessionObj = deps.getCurrentSessions().find((x) => x.id === deps.getSessionId());
          if (sessionObj) deps.wakeBotsAfterHandAction?.(sessionObj);
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          setActionError(e, "Could not submit draw", "draw");
          throw e;
        });
    },

    onPassDraw() {
      const auth = requireAuth("Sign in to draw");
      if (!auth) return Promise.reject(new Error("Sign in to draw"));
      deps.commitLocalHandAction(LOCAL_HAND_ACTION.DRAW);
      deps.setTableActionFeedback({ status: "loading", message: "Standing pat…" });
      return deps
        .submitHandDraw(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          discardIndices: [],
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback({ status: "success", message: "Standing pat" });
          const sessionObj = deps.getCurrentSessions().find((x) => x.id === deps.getSessionId());
          if (sessionObj) deps.wakeBotsAfterHandAction?.(sessionObj);
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          setActionError(e, "Could not stand pat", "draw");
          throw e;
        });
    },

    onFoldDraw() {
      const auth = requireAuth("Sign in to fold");
      if (!auth) return Promise.reject(new Error("Sign in to fold"));
      deps.commitLocalHandAction(LOCAL_HAND_ACTION.DRAW);
      deps.setTableActionFeedback({ status: "loading", message: "Folding out…" });
      return deps
        .foldHandDraw(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback({
            status: "success",
            message: "You're out this hand — ante forfeited",
          });
          const sessionObj = deps.getCurrentSessions().find((x) => x.id === deps.getSessionId());
          if (sessionObj) deps.wakeBotsAfterHandAction?.(sessionObj);
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          setActionError(e, "Could not fold out", "fold");
          throw e;
        });
    },

    onPlayCard(cardIndex) {
      const auth = requireAuth("Sign in to play");
      if (!auth) return Promise.reject(new Error("Sign in to play"));
      deps.commitLocalHandAction(LOCAL_HAND_ACTION.PLAY_CARD);
      deps.setTableActionFeedback({ status: "loading", message: "Playing card…" });
      return deps
        .playHandCard(deps.getRoomId(), deps.getSessionId(), {
          playerId: auth.uid,
          cardIndex,
          actorId: auth.uid,
        })
        .then(() => {
          deps.setTableActionFeedback(null);
          const sessionObj = deps.getCurrentSessions().find((x) => x.id === deps.getSessionId());
          if (sessionObj) deps.scheduleTableSessionSync(sessionObj);
        })
        .catch((e) => {
          deps.clearLocalHandCommit();
          setActionError(e, "Could not play card", "play");
          throw e;
        });
    },

    onSettle(choice) {
      return deps.onSettleHand(choice);
    },

    onSettleCarryover() {
      return deps.onSettleCarryover?.() ?? Promise.resolve();
    },

    onRebuy() {
      return deps.onRebuy?.() ?? Promise.resolve();
    },
  };
}
