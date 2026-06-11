// Sons gerados com Web Audio API — nenhum arquivo de áudio necessário.

let audioCtx = null;

export function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

export function playTick() {
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

export function playWin() {
  if (!audioCtx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = audioCtx.currentTime + i * 0.12;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + 0.4);
  });
}
