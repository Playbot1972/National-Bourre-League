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

initializeApp();

const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  "national-bourre-league";

// Gen2 defaults to the Compute Engine SA; our deploy SA already has actAs on App Engine default.
setGlobalOptions({
  serviceAccount: `${projectId}@appspot.gserviceaccount.com`,
});

const db = getFirestore();

function wrap(handler) {
  return onCall({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
      const { HttpsError } = await import("firebase-functions/v2/https");
      throw new HttpsError("unauthenticated", "Sign in required");
    }
    const data = request.data ?? {};
    const actorId = request.auth.uid;
    return handler(db, { ...data, actorId });
  });
}

/** Nudge bot enrollment / draw / play when the table is waiting on robots. */
export const gameAdvanceBots = wrap(handleAdvanceBots);

/** Start enrollment when the session is between hands. */
export const gameEnsureHandEnrollment = wrap(handleEnsureHandEnrollment);

/** Enrollment timeout — auto sit-out for current seat. */
export const gameTimeoutEnrollment = wrap(handleTimeoutEnrollment);

/** Advance Pagat reveal → play/pass decision after trump/hand presentation. */
export const gameAdvanceHandReveal = wrap(handleAdvanceHandReveal);

/** I'm in / sit-out during enrollment (may deal when round completes). */
export const gameSetHandParticipation = wrap(handleSetHandParticipation);

/** Draw / stand pat during draw phase. */
export const gameSubmitDraw = wrap(handleSubmitDraw);

/** Fold out during draw phase (forfeit ante, skip tricks). */
export const gameFoldDraw = wrap(handleFoldDraw);

/** Play one card during trick play (may auto-settle when hand completes). */
export const gamePlayCard = wrap(handlePlayCard);

/** Record hand settlement (pot, bourré, next-hand reset). */
export const gameRecordHand = wrap(handleRecordHand);

/** Co-winner split / decline vote. */
export const gameVoteCoWinSettlement = wrap(handleVoteCoWinSettlement);
