import { createSignal, onMount, onCleanup, Show } from "solid-js";
import confetti from "canvas-confetti";
import { ITEMS, SLICE, type TransportItem } from "./items";
import { loadImages, drawWheel, type WheelImage } from "./wheel";
import { ensureAudio, playTick, playWin } from "./sounds";
import { indexAtPointer, spinDelta, easeOutQuart } from "./geometry";
import { randomIndex, randomInt, randomBetween } from "./random";

// Sequência de rajadas de confete: centro, cantos e chuviscos por cima
const CONFETTI_BURSTS: ReadonlyArray<{ delay: number; opts: confetti.Options }> = [
  { delay: 0, opts: { particleCount: 120, spread: 75, origin: { y: 0.55 } } },
  { delay: 200, opts: { particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } } },
  { delay: 350, opts: { particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } } },
  { delay: 600, opts: { particleCount: 90, spread: 100, scalar: 0.8, origin: { y: 0.4 } } },
];

const celebrate = (): void =>
  CONFETTI_BURSTS.forEach(({ delay, opts }) => window.setTimeout(() => void confetti(opts), delay));

const SPIN = {
  /** voltas completas, sorteadas neste intervalo */
  minTurns: 5,
  maxTurns: 7,
  /** desvio máximo do centro da fatia, como fração dela (< 0.5 garante a fatia certa) */
  maxJitter: 0.35,
  /** duração da animação, sorteada neste intervalo (ms) */
  minDurationMs: 4200,
  maxDurationMs: 5000,
  /** pausa entre a roleta parar e o card de resultado abrir (ms) */
  resultDelayMs: 350,
} as const;

export default function App() {
  const [ready, setReady] = createSignal(false);
  const [spinning, setSpinning] = createSignal(false);
  const [result, setResult] = createSignal<TransportItem | null>(null);
  const [hint, setHint] = createSignal("12 transportes esperando a sorte");

  let canvas!: HTMLCanvasElement;
  let pointerEl!: HTMLDivElement;
  let againBtn: HTMLButtonElement | undefined;

  // Estado do desenho fica fora da reatividade: muda a cada frame do rAF,
  // e o canvas é redesenhado imperativamente — signal aqui só geraria overhead.
  let ctx: CanvasRenderingContext2D;
  let rotation = 0;
  let images: readonly WheelImage[] = [];

  const idle = (): boolean => ready() && !spinning() && !result();
  const currentIndex = (): number => indexAtPointer(rotation, SLICE, ITEMS.length);

  function animatePointerTick(): void {
    playTick();
    pointerEl.classList.remove("tick");
    void pointerEl.offsetWidth; // força reflow para reiniciar a animação CSS
    pointerEl.classList.add("tick");
  }

  function spin(): void {
    if (spinning() || !ready()) return;
    setSpinning(true);
    ensureAudio();
    setHint("Girando…");

    const winner = randomIndex(ITEMS.length);
    const fullTurns = randomInt(SPIN.minTurns, SPIN.maxTurns);
    const jitter = randomBetween(-SPIN.maxJitter, SPIN.maxJitter) * SLICE;
    const delta = spinDelta(rotation, winner, SLICE, fullTurns, jitter);
    const duration = randomBetween(SPIN.minDurationMs, SPIN.maxDurationMs);

    const startRotation = rotation;
    const startTime = performance.now();
    let lastIndex = currentIndex();

    function frame(now: number): void {
      const progress = Math.min(1, (now - startTime) / duration);
      rotation = startRotation - delta * easeOutQuart(progress);
      drawWheel(ctx, images, rotation);

      if (currentIndex() !== lastIndex) {
        lastIndex = currentIndex();
        animatePointerTick();
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        finish(ITEMS[currentIndex()]);
      }
    }
    requestAnimationFrame(frame);
  }

  function finish(item: TransportItem): void {
    setHint(`🎉 ${item.name}!`);
    playWin();
    celebrate();
    window.setTimeout(() => {
      setResult(item);
      againBtn?.focus();
    }, SPIN.resultDelayMs);
  }

  function closeOverlay(): void {
    setResult(null);
    setHint("Quer tentar outra vez?");
  }

  function spinAgain(): void {
    closeOverlay();
    spin();
  }

  onMount(() => {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D não suportado");
    ctx = context;

    void loadImages().then((loaded) => {
      images = loaded;
      setReady(true);
      drawWheel(ctx, images, rotation);
    });

    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && result()) closeOverlay();
    };
    document.addEventListener("keydown", onKeydown);
    onCleanup(() => document.removeEventListener("keydown", onKeydown));
  });

  return (
    <>
      <main class="page">
        <header class="hero">
          <h1>Roleta dos Transportes</h1>
          <p class="sub">Toque na roleta e descubra como você vai viajar hoje ✨</p>
        </header>

        <section class="wheel-area">
          <div class="pointer" ref={pointerEl} aria-hidden="true"></div>
          <div classList={{ "wheel-wrap": true, idle: idle() }}>
            <canvas
              ref={canvas}
              class="wheel-canvas"
              width="1280"
              height="1280"
              aria-label="Roleta de sorteio"
              onClick={spin}
            ></canvas>
            <button class="hub" disabled={spinning()} onClick={spin} aria-label="Girar a roleta">
              GIRAR
            </button>
          </div>
        </section>

        <p class="hint">{hint()}</p>
      </main>

      <Show when={result()}>
        {(item) => (
          <div class="overlay" onClick={(e) => e.target === e.currentTarget && closeOverlay()}>
            <div class="card" role="dialog" aria-modal="true" aria-label={item().name}>
              <button class="close" onClick={closeOverlay} aria-label="Fechar">
                &times;
              </button>
              <span class="card-kicker">Deu sorte! Você vai de…</span>
              <div class="card-photo">
                <img src={item().img} alt={item().name} />
              </div>
              <h2>{item().name}</h2>
              <button class="again" ref={againBtn} onClick={spinAgain}>
                Girar de novo 🎡
              </button>
            </div>
          </div>
        )}
      </Show>
    </>
  );
}
