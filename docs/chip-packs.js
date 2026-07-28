/**
 * Canonical consumable chip-pack catalog (IAP).
 * Synced to functions/vendor for server-side validation.
 */

/** @typedef {'popular'|'best_value'|null} ChipPackBadge */

/**
 * @typedef {object} ChipPack
 * @property {string} id
 * @property {string} name
 * @property {number} chips
 * @property {number} priceUsd
 * @property {ChipPackBadge} badge
 * @property {string} storeProductId — App Store / Play product id
 */

/** @type {readonly ChipPack[]} */
export const CHIP_PURCHASE_PACKS = Object.freeze([
  {
    id: "starter",
    name: "Starter",
    chips: 10_000,
    priceUsd: 0.99,
    badge: null,
    storeProductId: "com.booray.chips.starter",
  },
  {
    id: "popular",
    name: "Popular",
    chips: 50_000,
    priceUsd: 4.99,
    badge: "popular",
    storeProductId: "com.booray.chips.popular",
  },
  {
    id: "value",
    name: "Value",
    chips: 120_000,
    priceUsd: 9.99,
    badge: "best_value",
    storeProductId: "com.booray.chips.value",
  },
  {
    id: "big_winner",
    name: "Big Winner",
    chips: 300_000,
    priceUsd: 19.99,
    badge: null,
    storeProductId: "com.booray.chips.big_winner",
  },
  {
    id: "whale",
    name: "Whale",
    chips: 800_000,
    priceUsd: 49.99,
    badge: null,
    storeProductId: "com.booray.chips.whale",
  },
]);

const PACK_BY_ID = Object.fromEntries(CHIP_PURCHASE_PACKS.map((p) => [p.id, p]));

/**
 * @param {string} packId
 * @returns {ChipPack|null}
 */
export function getChipPackById(packId) {
  return PACK_BY_ID[packId] ?? null;
}

/**
 * @param {string} storeProductId
 * @returns {ChipPack|null}
 */
export function getChipPackByStoreProductId(storeProductId) {
  return CHIP_PURCHASE_PACKS.find((p) => p.storeProductId === storeProductId) ?? null;
}

/**
 * @param {number} chips
 * @returns {string}
 */
export function formatChipAmount(chips) {
  return new Intl.NumberFormat("en-US").format(chips);
}

/**
 * @param {number} priceUsd
 * @returns {string}
 */
export function formatPackPrice(priceUsd) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(priceUsd);
}
