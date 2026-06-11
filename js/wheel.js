import { ITEMS, SLICE, COLORS } from "./items.js";

export function loadImages() {
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

export function drawWheel(ctx, images, rotation) {
  const size = ctx.canvas.width;
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
