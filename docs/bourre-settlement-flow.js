// bourre-settlement-flow.js — thin re-export layer for integration tests and legacy imports.
export {
  recordHandSettlement,
  simulateRecordHandSettlement,
  startNextHandFunding,
  simulatePagatHandStartFunding,
  runHandMoneyFlow,
  runProductionSettlementDealFlow,
  applyRecordHandFundingToScores,
  mergeNextDealFundingIntoScoreById,
  bourreIdsFromTricks,
} from "./money-engine.js";
