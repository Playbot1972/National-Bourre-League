/**
 * Client coordinator — store purchase + server grant.
 */

import { getChipPackById, formatChipAmount, formatPackPrice } from "./chip-packs.js";
import { purchaseChipPackFromStore } from "./chip-purchase-store.js";
import { gameGrantChipPurchase, gameApplyFreeSessionRebuy } from "./game-functions.js";

export { CHIP_PURCHASE_PACKS, formatChipAmount, formatPackPrice, getChipPackById };

/**
 * @param {object} input
 * @param {string} input.roomId
 * @param {string} input.sessionId
 * @param {string} input.packId
 * @returns {Promise<object>}
 */
export async function purchaseChipPackAndGrant({ roomId, sessionId, packId }) {
  const pack = getChipPackById(packId);
  if (!pack) throw new Error("Unknown chip pack");

  const storeResult = await purchaseChipPackFromStore({
    packId: pack.id,
    storeProductId: pack.storeProductId,
  });

  return gameGrantChipPurchase({
    roomId,
    sessionId,
    packId: pack.id,
    platform: storeResult.platform,
    productId: storeResult.productId,
    purchaseToken: storeResult.purchaseToken,
  });
}

/**
 * @param {object} input
 * @param {string} input.roomId
 * @param {string} input.sessionId
 */
export async function applyFreeSessionRebuy({ roomId, sessionId }) {
  return gameApplyFreeSessionRebuy({ roomId, sessionId });
}
