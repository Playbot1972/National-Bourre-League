export {
  initGameFeedback,
  playShuffleFeedback,
  playDrawFeedback,
  playTrickWinFeedback,
  playPotWinFeedback,
  playBigWinFeedback,
  playHandWinFeedback,
  playBourreFeedback,
  playGameStartFeedback,
  playOpenRoomFeedback,
  playDeleteRoomFeedback,
  playFoldFeedback,
  playIllegalActionFeedback,
  playCardSelectFeedback,
  playUiButtonFeedback,
  playActionSuccessFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  prefersReducedMotion,
  shouldPlaySoundEvent,
  resetSoundAssetCache,
  DEAL_ANIM_STAGGER_MS,
  DEAL_ANIM_DURATION_MS,
  type ShuffleFeedbackOptions,
} from "./service";

export { audioSupported, isTableAudioDebugEnabled, logTableAudio, unlockAudio } from "./audio";
export {
  resetTableAudioAudit,
  getTableAudioAudit,
  printTableAudioAuditSummary,
  resetAudioPlayMonitor,
  getAudioPlayMonitor,
  playActionSound,
  playAnimationSound,
  playOutcomeSound,
} from "./audio";
export { hapticsSupported } from "./haptics";
export {
  SOUND_PACK_LABELS,
  ALL_SOUND_ASSET_IDS,
  SOUND_EVENT_TRIGGER_TYPE,
  type SoundAssetId,
  type SoundPackId,
} from "./soundPacks";
export type { FeedbackPrefs, HapticsMode, SoundMode } from "./prefs";
