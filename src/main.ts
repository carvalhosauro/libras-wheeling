import confetti from "canvas-confetti";
import { ITEMS, SLICE } from "./items";
import { loadImages, drawWheel, type WheelImage } from "./wheel";
import { ensureAudio, playTick, playWin } from "./sounds";
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

let rotation = 0; // current wheel rotation in radians
let spinning = false;
let images: readonly WheelImage[] = [];

const TWO_PI = Math.PI * 2;

function currentIndex(): number {
  // pointer sits at the top; slice 0 is centered there when rotation = 0
  const turns = ((-rotation % TWO_PI) + TWO_PI) % TWO_PI;
  return Math.round(turns / SLICE) % ITEMS.length;
}

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

function spin(): void {
  if (spinning) return;
  spinning = true;
  ensureAudio();
  spinBtn.disabled = true;
  wheelWrap.classList.remove("idle");
  hint.textContent = "Girando…";

  const winner = Math.floor(Math.random() * ITEMS.length);
  const fullTurns = 5 + Math.floor(Math.random() * 3); // 5–7 turns
  const jitter = (Math.random() - 0.5) * SLICE * 0.7; // land off-center, never on a line
  const targetTurns = winner * SLICE + jitter;
  const current = ((-rotation % TWO_PI) + TWO_PI) % TWO_PI;
  const delta = fullTurns * TWO_PI + ((targetTurns - current + TWO_PI) % TWO_PI);

  const startRotation = rotation;
  const duration = 4200 + Math.random() * 800;
  const startTime = performance.now();
  let lastIdx = currentIndex();

  function frame(now: number): void {
    const t = Math.min(1, (now - startTime) / duration);
    rotation = startRotation - delta * easeOutQuart(t);
    drawWheel(ctx, images, rotation);

    const idx = currentIndex();
    if (idx !== lastIdx) {
      lastIdx = idx;
      playTick();
      pointer.classList.remove("tick");
      void pointer.offsetWidth; // restart animation
      pointer.classList.add("tick");
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      spinning = false;
      finish(currentIndex());
    }
  }
  requestAnimationFrame(frame);
}

function finish(idx: number): void {
  const item = ITEMS[idx];
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

function celebrate(): void {
  void confetti({ particleCount: 120, spread: 75, origin: { y: 0.55 } });
  window.setTimeout(
    () => void confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }),
    200
  );
  window.setTimeout(
    () => void confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }),
    350
  );
  window.setTimeout(
    () => void confetti({ particleCount: 90, spread: 100, scalar: 0.8, origin: { y: 0.4 } }),
    600
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
