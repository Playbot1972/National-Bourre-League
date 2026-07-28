/**
 * Store receipt verification for consumable chip packs.
 *
 * INTEGRATION POINTS:
 * - Apple App Store Server API (signed transactions / JWS)
 * - Google Play Developer API (purchases.products.get)
 * - RevenueCat REST API (recommended cross-platform wrapper)
 */

import { getChipPackById, getChipPackByStoreProductId } from "./vendor/chip-packs.js";

/**
 * @param {object} input
 * @param {string} input.platform
 * @param {string} input.productId
 * @param {string} input.packId
 * @param {string} input.purchaseToken
 * @returns {Promise<{ transactionId: string, productId: string, packId: string }>}
 */
export async function verifyChipPurchase(input) {
  const { platform, productId, packId, purchaseToken } = input;
  if (!purchaseToken || !productId || !packId) {
    throw new Error("Missing purchase verification payload");
  }

  const pack = getChipPackById(packId);
  if (!pack || pack.storeProductId !== productId) {
    throw new Error("Pack does not match store product");
  }

  if (
    process.env.CHIP_PURCHASE_ALLOW_DEV_VERIFY === "true" &&
    platform === "dev" &&
    purchaseToken.startsWith("dev-verify:")
  ) {
    const parts = purchaseToken.split(":");
    if (parts[1] !== packId) throw new Error("Dev token pack mismatch");
    return {
      transactionId: purchaseToken,
      productId,
      packId,
    };
  }

  // INTEGRATION: replace with real store verification before production IAP.
  throw new Error("STORE_VERIFICATION_NOT_CONFIGURED");
}

export { getChipPackByStoreProductId };
