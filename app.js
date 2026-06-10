"use strict";

const ITEMS = [
  { name: "Caminhão", img: "assets/img/caminhao.jpg" },
  { name: "Bicicleta", img: "assets/img/bicicleta.jpg" },
  { name: "Carro particular", img: "assets/img/carro.jpg" },
  { name: "Canoa", img: "assets/img/canoa.jpg" },
  { name: "Avião", img: "assets/img/aviao.jpg" },
  { name: "Voadeira", img: "assets/img/voadeira.jpg" },
  { name: "Moto", img: "assets/img/moto.jpg" },
  { name: "Táxi", img: "assets/img/taxi.jpg" },
  { name: "Lotação", img: "assets/img/lotacao.jpg" },
  { name: "Uber", img: "assets/img/uber.jpg" },
  { name: "Ônibus", img: "assets/img/onibus.jpg" },
  { name: "Bicicleta elétrica", img: "assets/img/bike-eletrica.jpg" },
];

const SLICE = (Math.PI * 2) / ITEMS.length;
const COLORS = ["#ff5d73", "#ffc145", "#5b8cff", "#43c59e", "#b388ff", "#ff8e3c"];

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

/* ---------- drawing ---------- */

function loadImages() {
  return Promise.all(
    ITEMS.map(
      (item) =>
        new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = () => resolve(null);
          im.src = item.img;
        })
    )
  );
}

function drawWheel() {
  const size = canvas.width;
  const c = size / 2;
  const radius = c - 8;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(c, c);
  ctx.rotate(rotation);

  ITEMS.forEach((item, i) => {
    const start = i * SLICE - Math.PI / 2 - SLICE / 2;
    const end = start + SLICE;
    const mid = start + SLICE / 2;

    // slice background
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.clip();

    // photo, cover-cropped to a square centered on the slice
    const im = images[i];
    if (im) {
      const s = radius * 0.78;
      const px = Math.cos(mid) * radius * 0.62;
      const py = Math.sin(mid) * radius * 0.62;
      const srcSide = Math.min(im.naturalWidth, im.naturalHeight);
      const sx = (im.naturalWidth - srcSide) / 2;
      const sy = (im.naturalHeight - srcSide) / 2;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(im, sx, sy, srcSide, srcSide, px - s / 2, py - s / 2, s, s);
      ctx.globalAlpha = 1;

      // darken toward center so labels stay readable
      const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      grad.addColorStop(0, "rgba(43,36,64,0.55)");
      grad.addColorStop(0.55, "rgba(43,36,64,0.05)");
      grad.addColorStop(1, "rgba(43,36,64,0.25)");
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();

    // separator
    ctx.save();
    ctx.rotate(start);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // label along the slice
    ctx.save();
    ctx.rotate(mid);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `800 ${radius * 0.068}px Nunito, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 6;
    if (mid > Math.PI / 2 || mid < -Math.PI / 2) {
      ctx.rotate(Math.PI);
      ctx.textAlign = "left";
      ctx.fillText(item.name, -radius * 0.34, 0);
    } else {
      ctx.fillText(item.name, radius * 0.96, 0);
    }
    ctx.restore();
  });

  // outer ring
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  ctx.restore();
}

/* ---------- sounds (WebAudio, no assets) ---------- */

let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTick() {
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

function playWin() {
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

/* ---------- spin ---------- */

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
    drawWheel();

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

/* ---------- wire up ---------- */

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
  drawWheel();
});
