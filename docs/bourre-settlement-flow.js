// Thin re-exports — settlement/deal funding logic lives in bourre-rules.js (src/game/money/).

export {
  applyRecordHandFundingToScores,
  recordHandSettlement,
  simulateRecordHandSettlement,
  startNextHandFunding,
  simulatePagatHandStartFunding,
  runHandMoneyFlow,
  runProductionSettlementDealFlow,
  bourreIdsFromTricks,
  buildNextDealFundingSnapshot,
  mergeNextDealFundingIntoScoreById,
  settlementShortfall,
  bourrePlayerIds,
} from "./bourre-rules.js";
