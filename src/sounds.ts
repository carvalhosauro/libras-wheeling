// Sons gerados com Web Audio API — nenhum arquivo de áudio necessário.
// Cada som é descrito como dado (Tone) e tocado por uma única função genérica.

interface Tone {
  /** Forma de onda do oscilador */
  type: OscillatorType;
  /** Frequência em Hz */
  freq: number;
  /** Volume de pico (0–1) */
  peak: number;
  /** Duração do decaimento, em segundos */
  duration: number;
  /** Atraso até começar a tocar, em segundos */
  delay?: number;
}

const TICK: Tone = { type: "square", freq: 1700, peak: 0.035, duration: 0.04 };

// Arpejo de vitória: C5 → E5 → G5 → C6, uma nota a cada 120ms
const WIN_ARPEGGIO: readonly Tone[] = [523.25, 659.25, 783.99, 1046.5].map((freq, i) => ({
  type: "triangle",
  freq,
  peak: 0.12,
  duration: 0.35,
  delay: i * 0.12,
}));

let audioCtx: AudioContext | null = null;

export function ensureAudio(): void {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

function playTone(ctx: AudioContext, { type, freq, peak, duration, delay = 0 }: Tone): void {
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function playTick(): void {
  if (audioCtx) playTone(audioCtx, TICK);
}

export function playWin(): void {
  const ctx = audioCtx;
  if (ctx) WIN_ARPEGGIO.forEach((tone) => playTone(ctx, tone));
}
