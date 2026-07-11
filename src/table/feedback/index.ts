export {
  initGameFeedback,
  playShuffleFeedback,
  playDrawFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
  playBourreFeedback,
  playGameStartFeedback,
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

export { audioSupported, isTableAudioDebugEnabled, logTableAudio } from "./audio";
export {
  resetTableAudioAudit,
  getTableAudioAudit,
  printTableAudioAuditSummary,
  playActionSound,
  playAnimationSound,
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
