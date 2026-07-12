export {
  initGameFeedback,
  playShuffleFeedback,
  playDrawFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
  playBourreFeedback,
  playGameStartFeedback,
  playIllegalActionFeedback,
  playOpenRoomFeedback,
  playDeleteRoomFeedback,
  playCardSelectFeedback,
  playUiButtonFeedback,
  playFoldFeedback,
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

export { audioSupported } from "./audio";
export { hapticsSupported } from "./haptics";
export { SOUND_PACK_LABELS, type SoundPackId } from "./soundPacks";
export type { FeedbackPrefs, HapticsMode, SoundMode } from "./prefs";
