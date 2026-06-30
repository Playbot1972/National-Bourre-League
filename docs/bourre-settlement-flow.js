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
  SETTLEMENT_STAGES,
  runSettlementLifecycle,
  resolveHandOutcome,
  isSoleSurvivor,
  solventPlayerIds,
} from "./money-engine.js";
