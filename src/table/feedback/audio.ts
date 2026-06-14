/**
 * Procedural placeholder audio — replace with final assets in public/sounds/ when ready.
 * TODO(sound): swap playShuffleSound / playTrickWinSound / playBigWinSound to load
 *   shuffle.mp3, trick-win.mp3, big-win.mp3 once art-directed assets land.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export async function unlockAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* user gesture may be required */
    }
  }
}

function scheduleTone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function scheduleNoiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  start: number,
  duration: number,
  gainPeak: number,
): void {
  const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainPeak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + duration + 0.01);
}

let shufflePlaying = false;

/** Short card-riffle placeholder (~320ms). */
export function playShuffleSound(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain || shufflePlaying) return;
  shufflePlaying = true;
  const t0 = ctx.currentTime;
  const bursts = [0, 0.06, 0.12, 0.2, 0.28];
  for (const offset of bursts) {
    scheduleNoiseBurst(ctx, masterGain, t0 + offset, 0.05, 0.08 + Math.random() * 0.04);
  }
  window.setTimeout(() => {
    shufflePlaying = false;
  }, 360);
}

let trickWinPlaying = false;

/** Crisp slot-like chime — subtle, not casino-cheesy (~280ms). */
export function playTrickWinSound(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain || trickWinPlaying) return;
  trickWinPlaying = true;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, 880, t0, 0.12, 0.09, "sine");
  scheduleTone(ctx, masterGain, 1174.66, t0 + 0.07, 0.16, 0.07, "triangle");
  scheduleTone(ctx, masterGain, 1760, t0 + 0.14, 0.1, 0.04, "sine");
  window.setTimeout(() => {
    trickWinPlaying = false;
  }, 320);
}

let bigWinPlaying = false;

/** Richer hand/pot win (~520ms). */
export function playBigWinSound(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain || bigWinPlaying) return;
  bigWinPlaying = true;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, 659.25, t0, 0.14, 0.08, "sine");
  scheduleTone(ctx, masterGain, 830.61, t0 + 0.1, 0.18, 0.09, "triangle");
  scheduleTone(ctx, masterGain, 987.77, t0 + 0.22, 0.22, 0.1, "sine");
  scheduleTone(ctx, masterGain, 1318.51, t0 + 0.34, 0.28, 0.06, "triangle");
  window.setTimeout(() => {
    bigWinPlaying = false;
  }, 580);
}

export function audioSupported(): boolean {
  return typeof window !== "undefined" && Boolean(window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
}
