import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleAdvanceBots,
  handleAdvanceHandReveal,
  handleEnsureHandEnrollment,
  handlePlayCard,
  handleRecordHand,
  handleSetHandParticipation,
  handleSubmitDraw,
  handleFoldDraw,
  handleTimeoutEnrollment,
  handleVoteCoWinSettlement,
} from "./gameHandlers.js";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  handleLeavePublicTable,
} from "./publicTable.js";

initializeApp();

const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  "national-bourre-league";

const runtimeServiceAccount = `${projectId}@appspot.gserviceaccount.com`;

// Gen2 defaults to the Compute Engine SA; our deploy SA already has actAs on App Engine default.
setGlobalOptions({
  serviceAccount: runtimeServiceAccount,
});

const db = getFirestore();

function wrap(handler, callableName) {
  // Gen2 callables run on Cloud Run; invoker must be public so the Firebase
  // client (httpsCallable from booray.win) can reach the handler. Auth is
  // enforced inside the wrapper below — not at the Cloud Run IAM layer.
  return onCall(
    { cors: true, invoker: "public", serviceAccount: runtimeServiceAccount },
    async (request) => {
      const origin = request.rawRequest?.headers?.origin ?? null;
      const meta = {
        callable: callableName,
        origin,
        invocation: "onCall",
        auth: Boolean(request.auth?.uid),
      };
      if (!request.auth?.uid) {
        console.warn(
          "[game-callable] rejected",
          JSON.stringify({ ...meta, reason: "unauthenticated" }),
        );
        const { HttpsError } = await import("firebase-functions/v2/https");
        throw new HttpsError("unauthenticated", "Sign in required");
      }
      const data = request.data ?? {};
      const actorId = request.auth.uid;
      return handler(db, { ...data, actorId });
    },
  );
}

/** Nudge bot enrollment / draw / play when the table is waiting on robots. */
export const gameAdvanceBots = wrap(handleAdvanceBots, "gameAdvanceBots");

/** Start enrollment when the session is between hands. */
export const gameEnsureHandEnrollment = wrap(handleEnsureHandEnrollment, "gameEnsureHandEnrollment");

/** Enrollment timeout — auto sit-out for current seat. */
export const gameTimeoutEnrollment = wrap(handleTimeoutEnrollment, "gameTimeoutEnrollment");

/** Advance Pagat reveal → play/pass decision after trump/hand presentation. */
export const gameAdvanceHandReveal = wrap(handleAdvanceHandReveal, "gameAdvanceHandReveal");

/** I'm in / sit-out during enrollment (may deal when round completes). */
export const gameSetHandParticipation = wrap(handleSetHandParticipation, "gameSetHandParticipation");

/** Draw / stand pat during draw phase. */
export const gameSubmitDraw = wrap(handleSubmitDraw, "gameSubmitDraw");

/** Fold out during draw phase (forfeit ante, skip tricks). */
export const gameFoldDraw = wrap(handleFoldDraw, "gameFoldDraw");

/** Play one card during trick play (may auto-settle when hand completes). */
export const gamePlayCard = wrap(handlePlayCard, "gamePlayCard");

/** Record hand settlement (pot, bourré, next-hand reset). */
export const gameRecordHand = wrap(handleRecordHand, "gameRecordHand");

/** Co-winner split / decline vote. */
export const gameVoteCoWinSettlement = wrap(handleVoteCoWinSettlement, "gameVoteCoWinSettlement");

/** Public mixed-table matchmaking (Phase 3). */
export const gameFindOrCreatePublicTable = wrap(
  handleFindOrCreatePublicTable,
  "gameFindOrCreatePublicTable",
);
export const gameJoinPublicTable = wrap(handleJoinPublicTable, "gameJoinPublicTable");
export const gameLeavePublicTable = wrap(handleLeavePublicTable, "gameLeavePublicTable");
