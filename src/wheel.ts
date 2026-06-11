import { ITEMS, SLICE, COLORS, type TransportItem } from "./items";
import { sliceStart, sliceMiddle, TWO_PI } from "./geometry";

export type WheelImage = HTMLImageElement | null;

type Ctx = CanvasRenderingContext2D;

// Proporções do desenho, relativas ao raio da roleta
const WHEEL = {
  /** folga entre a borda do canvas e a roleta, em px do canvas */
  marginPx: 8,
  /** lado do quadrado da foto */
  photoSize: 0.78,
  /** distância do centro da roleta ao centro da foto */
  photoCenter: 0.62,
  /** opacidade da foto sobre a cor da fatia */
  photoAlpha: 0.92,
  /** tamanho da fonte do rótulo */
  labelFont: 0.068,
  /** rótulo termina aqui (lado direito da roleta) */
  labelOuter: 0.96,
  /** rótulo começa aqui quando invertido (lado esquerdo) */
  labelInner: 0.34,
  /** largura da linha entre fatias, em px do canvas */
  separatorPx: 3,
  /** largura do aro externo, em px do canvas */
  ringPx: 10,
} as const;

export function loadImages(): Promise<WheelImage[]> {
  return Promise.all(
    ITEMS.map(
      (item) =>
        new Promise<WheelImage>((resolve) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = () => resolve(null);
          im.src = item.img;
        })
    )
  );
}

/** Executa `draw` entre save() e restore(), garantindo que o estado do canvas não vaze */
function withCtx(ctx: Ctx, draw: () => void): void {
  ctx.save();
  draw();
  ctx.restore();
}

function clipSlice(ctx: Ctx, i: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, sliceStart(i, SLICE), sliceStart(i + 1, SLICE));
  ctx.closePath();
  ctx.clip();
}

function paintSliceBackground(ctx: Ctx, i: number): void {
  ctx.fillStyle = COLORS[i % COLORS.length];
  ctx.fill();
}

/** Foto recortada em quadrado (cover) e centrada no meio da fatia */
function paintSlicePhoto(ctx: Ctx, image: HTMLImageElement, i: number, radius: number): void {
  const size = radius * WHEEL.photoSize;
  const centerX = Math.cos(sliceMiddle(i, SLICE)) * radius * WHEEL.photoCenter;
  const centerY = Math.sin(sliceMiddle(i, SLICE)) * radius * WHEEL.photoCenter;
  const cropSide = Math.min(image.naturalWidth, image.naturalHeight);
  const cropX = (image.naturalWidth - cropSide) / 2;
  const cropY = (image.naturalHeight - cropSide) / 2;

  ctx.globalAlpha = WHEEL.photoAlpha;
  ctx.drawImage(image, cropX, cropY, cropSide, cropSide, centerX - size / 2, centerY - size / 2, size, size);
  ctx.globalAlpha = 1;
}

/** Escurece centro e borda da fatia para o rótulo branco continuar legível */
function paintReadabilityShade(ctx: Ctx, radius: number): void {
  const shade = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  shade.addColorStop(0, "rgba(43,36,64,0.55)");
  shade.addColorStop(0.55, "rgba(43,36,64,0.05)");
  shade.addColorStop(1, "rgba(43,36,64,0.25)");
  ctx.fillStyle = shade;
  ctx.fill();
}

function paintSeparator(ctx: Ctx, i: number, radius: number): void {
  ctx.rotate(sliceStart(i, SLICE));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius, 0);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = WHEEL.separatorPx;
  ctx.stroke();
}

/** Rótulo ao longo do raio; nas fatias do lado esquerdo, vira 180° para não ficar de cabeça para baixo */
function paintLabel(ctx: Ctx, item: TransportItem, i: number, radius: number): void {
  const middle = sliceMiddle(i, SLICE);
  const upsideDown = middle > Math.PI / 2 || middle < -Math.PI / 2;

  ctx.rotate(middle);
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.font = `800 ${radius * WHEEL.labelFont}px Nunito, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 6;

  if (upsideDown) {
    ctx.rotate(Math.PI);
    ctx.textAlign = "left";
    ctx.fillText(item.name, -radius * WHEEL.labelInner, 0);
  } else {
    ctx.textAlign = "right";
    ctx.fillText(item.name, radius * WHEEL.labelOuter, 0);
  }
}

function paintOuterRing(ctx: Ctx, radius: number): void {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TWO_PI);
  ctx.lineWidth = WHEEL.ringPx;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
}

export function drawWheel(ctx: Ctx, images: readonly WheelImage[], rotation: number): void {
  const center = ctx.canvas.width / 2;
  const radius = center - WHEEL.marginPx;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  withCtx(ctx, () => {
    ctx.translate(center, center);
    ctx.rotate(rotation);

    ITEMS.forEach((item, i) => {
      withCtx(ctx, () => {
        clipSlice(ctx, i, radius);
        paintSliceBackground(ctx, i);
        const image = images[i];
        if (image) {
          paintSlicePhoto(ctx, image, i, radius);
          paintReadabilityShade(ctx, radius);
        }
      });
      withCtx(ctx, () => paintSeparator(ctx, i, radius));
      withCtx(ctx, () => paintLabel(ctx, item, i, radius));
    });

    paintOuterRing(ctx, radius);
  });
}
