/** Imperative callbacks from useHandPresentation for parallel motion hooks. */

export interface HandPresentationApi {
  notifyDealPresentationComplete: () => void;
  notifySettlePayoutComplete: () => void;
  notifySettlePenaltyComplete: () => void;
}
