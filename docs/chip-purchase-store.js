/**
 * Native / web store adapter for consumable chip packs.
 *
 * INTEGRATION POINTS (not wired in repo yet):
 * - iOS: @capacitor-community/in-app-purchases or RevenueCat Capacitor plugin
 * - Android: Google Play Billing Library via Capacitor plugin
 * - Web: not supported for real money (show message; no client grant)
 */

import { isCapacitorNative } from "./auth.js";

/**
 * @typedef {object} StorePurchaseResult
 * @property {string} platform — 'ios' | 'android' | 'dev'
 * @property {string} productId — store SKU
 * @property {string} purchaseToken — opaque receipt / purchase token for server verify
 * @property {string} [transactionId]
 */

/**
 * @param {{ storeProductId: string, packId: string }} pack
 * @returns {Promise<StorePurchaseResult>}
 */
export async function purchaseChipPackFromStore(pack) {
  if (!pack?.storeProductId) {
    throw new Error("Invalid chip pack");
  }

  if (isCapacitorNative()) {
    // INTEGRATION: invoke native IAP plugin, return purchaseToken from store receipt.
    throw new Error(
      "In-app purchases are not configured yet. Wire Capacitor IAP in chip-purchase-store.js.",
    );
  }

  const devAllowed =
    typeof location !== "undefined" &&
    (location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.search.includes("chipPurchaseDev=1"));

  if (devAllowed) {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      platform: "dev",
      productId: pack.storeProductId,
      purchaseToken: `dev-verify:${pack.packId}:${nonce}`,
      transactionId: `dev-${nonce}`,
    };
  }

  throw new Error("Chip purchases are available in the mobile app.");
}
