// Sons gerados com Web Audio API — nenhum arquivo de áudio necessário.

let audioCtx: AudioContext | null = null;

export function ensureAudio(): void {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

export function playTick(): void {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.value = 1700;
  g.gain.setValueAtTime(0.035, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.05);
}

export function playWin(): void {
  if (!audioCtx) return;
  const ctx = audioCtx;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.12;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.4);
  });
}
