import confetti from "canvas-confetti";
import { ITEMS, SLICE } from "./items";
import { loadImages, drawWheel, type WheelImage } from "./wheel";
import { ensureAudio, playTick, playWin } from "./sounds";
import { indexAtPointer, spinDelta, easeOutQuart } from "./geometry";
import { randomIndex, randomInt, randomBetween } from "./random";
import "./style.css";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento #${id} não encontrado`);
  return node as T;
}

const canvas = el<HTMLCanvasElement>("wheel");
const canvasCtx = canvas.getContext("2d");
if (!canvasCtx) throw new Error("Canvas 2D não suportado");
const ctx: CanvasRenderingContext2D = canvasCtx;

const wheelWrap = el<HTMLDivElement>("wheelWrap");
const spinBtn = el<HTMLButtonElement>("spinBtn");
const pointer = el<HTMLDivElement>("pointer");
const overlay = el<HTMLDivElement>("overlay");
const resultImg = el<HTMLImageElement>("resultImg");
const resultName = el<HTMLHeadingElement>("resultName");
const againBtn = el<HTMLButtonElement>("againBtn");
const closeBtn = el<HTMLButtonElement>("closeBtn");
const hint = el<HTMLParagraphElement>("hint");

let rotation = 0; // ângulo atual da roleta, em radianos
let spinning = false;
let images: readonly WheelImage[] = [];

/** Fatia atualmente sob o ponteiro */
const currentIndex = (): number => indexAtPointer(rotation, SLICE, ITEMS.length);

function animatePointerTick(): void {
  playTick();
  pointer.classList.remove("tick");
  void pointer.offsetWidth; // força reflow para reiniciar a animação CSS
  pointer.classList.add("tick");
}

function spin(): void {
  if (spinning) return;
  spinning = true;
  ensureAudio();
  spinBtn.disabled = true;
  wheelWrap.classList.remove("idle");
  hint.textContent = "Girando…";

  const winner = randomIndex(ITEMS.length);
  const fullTurns = randomInt(5, 7);
  // até ±35% da fatia: para fora do centro, mas nunca em cima da linha
  const jitter = randomBetween(-0.35, 0.35) * SLICE;
  const delta = spinDelta(rotation, winner, SLICE, fullTurns, jitter);
  const duration = randomBetween(4200, 5000);

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
      spinning = false;
      finish(currentIndex());
    }
  }
  requestAnimationFrame(frame);
}

function finish(index: number): void {
  const item = ITEMS[index];
  hint.textContent = `🎉 ${item.name}!`;
  playWin();
  celebrate();

  resultImg.src = item.img;
  resultImg.alt = item.name;
  resultName.textContent = item.name;
  window.setTimeout(() => {
    overlay.hidden = false;
    againBtn.focus();
  }, 350);
}

// Sequência de rajadas de confete: centro, cantos e chuviscos por cima
const CONFETTI_BURSTS: ReadonlyArray<{ delay: number; opts: confetti.Options }> = [
  { delay: 0, opts: { particleCount: 120, spread: 75, origin: { y: 0.55 } } },
  { delay: 200, opts: { particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } } },
  { delay: 350, opts: { particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } } },
  { delay: 600, opts: { particleCount: 90, spread: 100, scalar: 0.8, origin: { y: 0.4 } } },
];

function celebrate(): void {
  CONFETTI_BURSTS.forEach(({ delay, opts }) =>
    window.setTimeout(() => void confetti(opts), delay)
  );
}

function closeOverlay(): void {
  overlay.hidden = true;
  spinBtn.disabled = false;
  wheelWrap.classList.add("idle");
  hint.textContent = "Quer tentar outra vez?";
}

spinBtn.addEventListener("click", spin);
canvas.addEventListener("click", spin);
againBtn.addEventListener("click", () => {
  closeOverlay();
  spin();
});
closeBtn.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeOverlay();
});

void loadImages().then((loaded) => {
  images = loaded;
  wheelWrap.classList.add("idle");
  drawWheel(ctx, images, rotation);
});
