import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleAdvanceBots,
  handleAdvanceHandReveal,
  handleEnsureHandEnrollment,
  handlePlayCard,
  handleRecordHand,
  handleSetHandParticipation,
  handleSubmitDraw,
  handleTimeoutEnrollment,
  handleVoteCoWinSettlement,
} from "./gameHandlers.js";

initializeApp();

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

/** Play one card during trick play (may auto-settle when hand completes). */
export const gamePlayCard = wrap(handlePlayCard);

/** Record hand settlement (pot, bourré, next-hand reset). */
export const gameRecordHand = wrap(handleRecordHand);

/** Co-winner split / decline vote. */
export const gameVoteCoWinSettlement = wrap(handleVoteCoWinSettlement);
