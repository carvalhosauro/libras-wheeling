import { ITEMS, SLICE } from "./items.js";
import { loadImages, drawWheel } from "./wheel.js";
import { ensureAudio, playTick, playWin } from "./sounds.js";

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const wheelWrap = document.getElementById("wheelWrap");
const spinBtn = document.getElementById("spinBtn");
const pointer = document.getElementById("pointer");
const overlay = document.getElementById("overlay");
const resultImg = document.getElementById("resultImg");
const resultName = document.getElementById("resultName");
const againBtn = document.getElementById("againBtn");
const closeBtn = document.getElementById("closeBtn");
const hint = document.getElementById("hint");

let rotation = 0; // current wheel rotation in radians
let spinning = false;
let images = [];

function currentIndex() {
  // pointer sits at the top; slice 0 is centered there when rotation = 0
  const turns = ((-rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.round(turns / SLICE) % ITEMS.length;
}

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function spin() {
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
  const current = ((-rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const delta = fullTurns * Math.PI * 2 + ((targetTurns - current + Math.PI * 2) % (Math.PI * 2));

  const startRotation = rotation;
  const duration = 4200 + Math.random() * 800;
  const startTime = performance.now();
  let lastIdx = currentIndex();

  function frame(now) {
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

function finish(idx) {
  const item = ITEMS[idx];
  hint.textContent = "🎉 " + item.name + "!";
  playWin();
  celebrate();

  resultImg.src = item.img;
  resultImg.alt = item.name;
  resultName.textContent = item.name;
  setTimeout(() => {
    overlay.hidden = false;
    againBtn.focus();
  }, 350);
}

function celebrate() {
  const confetti = window.confetti;
  if (typeof confetti !== "function") return;
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.55 } });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 350);
  setTimeout(
    () => confetti({ particleCount: 90, spread: 100, scalar: 0.8, origin: { y: 0.4 } }),
    600
  );
}

function closeOverlay() {
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

loadImages().then((loaded) => {
  images = loaded;
  wheelWrap.classList.add("idle");
  drawWheel(ctx, images, rotation);
});
