/**
 * Cloud Functions scaffolding for National Bourré League.
 *
 * PRODUCTION TODO: Wire callable HTTPS handlers and move deal / draw / play
 * validation server-side. The client (`docs/firestore.js`) currently runs
 * honor-system Firestore transactions for dev/testing.
 *
 * Setup when implementing:
 *   npm install firebase-functions firebase-admin
 *   npm run build:game   # bundle src/game for shared validation logic
 *
 * Handlers to implement (see functions/README.md):
 *   - validateDeal        — enrollment completion → dealInitialHand + privateHands
 *   - validateDraw        — applyDraw + advanceAfterDraw
 *   - validatePlayCard    — applyPlayCard + trick resolution + hand finalize
 *   - validateTrickResolution (optional if play is atomic)
 *   - runBotTurn (optional) — server-authoritative bot draw/play
 *
 * Example skeleton (requires firebase-functions v2):
 *
 *   import { onCall, HttpsError } from "firebase-functions/v2/https";
 *   import { applyPlayCard, validatePlayIndex } from "./game-engine.js";
 *
 *   export const validatePlayCard = onCall(async (request) => {
 *     if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
 *     // load session + private hand in transaction, run applyPlayCard, commit
 *   });
 */

export {};
