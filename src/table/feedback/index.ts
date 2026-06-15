export {
  initGameFeedback,
  playShuffleFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  prefersReducedMotion,
  DEAL_ANIM_STAGGER_MS,
  DEAL_ANIM_DURATION_MS,
  type ShuffleFeedbackOptions,
} from "./service";

export { audioSupported } from "./audio";
export { hapticsSupported } from "./haptics";
export type { FeedbackPrefs, HapticsMode } from "./prefs";
