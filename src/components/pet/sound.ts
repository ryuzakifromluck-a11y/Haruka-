/** Tiny synthesized sounds (no audio files). Only used when the owner turns sound on. */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call from a click so browsers allow sound later. */
export function unlockAudio() {
  audio();
}

function tone(freq: number, start: number, dur: number, gain = 0.05, type: OscillatorType = "sine") {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sounds = {
  love() {
    tone(784, 0, 0.5, 0.045);
    tone(1046.5, 0.12, 0.55, 0.04);
    tone(1318.5, 0.24, 0.7, 0.035);
  },
  boop() {
    tone(660, 0, 0.16, 0.04, "triangle");
    tone(880, 0.06, 0.18, 0.03, "triangle");
  },
  happy() {
    tone(587, 0, 0.2, 0.035, "triangle");
    tone(880, 0.1, 0.3, 0.035, "triangle");
  },
};
