// Sound effects are synthesized locally; the spoken win cheer uses browser speech synthesis.
let ctx: AudioContext | null = null;
let soundOn = true;
let musicTimer: ReturnType<typeof setInterval> | undefined;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const play = (fn: () => void) => () => {
  if (soundOn) fn();
};

export const sfx = {
  pop: play(() => tone(700, 0, 0.08, "triangle", 0.1)),
  correct: play(() => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.25, "sine", 0.14))),
  wrong: play(() => {
    tone(260, 0, 0.16, "sine", 0.08);
    tone(220, 0.1, 0.2, "sine", 0.07);
  }),
  star: play(() => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.06, 0.2, "triangle", 0.06))),
  unlock: play(() => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, i * 0.05, 0.3, "sine", 0.07))),
  celebrate: play(() =>
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.11)),
  ),
  whoosh: play(() => tone(420, 0, 0.14, "sine", 0.05)),
  /** Bright celebratory flourish with the device's most feminine available voice. */
  yey: play(() => {
    [659, 784, 988, 1319, 1568, 1976].forEach((f, i) => tone(f, i * 0.055, 0.4, "triangle", 0.09));
    [1047, 1319].forEach((f, i) => tone(f, 0.28 + i * 0.1, 0.45, "sine", 0.05));
    try {
      const u = new SpeechSynthesisUtterance("Yaaay!!");
      u.pitch = 2.4;
      u.rate = 1.12;
      u.volume = 1;
      u.voice = window.speechSynthesis.getVoices().find((voice) => /zira|samantha|victoria|female/i.test(voice.name)) ?? null;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* speech not available: the cheer sound still plays */
    }
  }),
  drag: play(() => tone(520, 0, 0.05, "sine", 0.04)),
};

export function unlockAudio() {
  ac();
}

export function setSoundEnabled(on: boolean) {
  soundOn = on;
}

/** Very soft pentatonic background music. */
export function setMusicEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  if (on && !musicTimer) {
    const notes = [262, 294, 330, 392, 440, 523];
    musicTimer = setInterval(() => {
      if (!ctx || ctx.state !== "running") return;
      const f = notes[Math.floor(Math.random() * notes.length)]!;
      tone(f, 0, 1.6, "sine", 0.02);
      if (Math.random() > 0.6) tone(f * 1.5, 0.4, 1.2, "sine", 0.012);
    }, 950);
  } else if (!on && musicTimer) {
    clearInterval(musicTimer);
    musicTimer = undefined;
  }
}
