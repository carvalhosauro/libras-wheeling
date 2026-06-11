import { describe, it, expect } from "vitest";
import { ITEMS, SLICE, COLORS } from "./items";
import { TWO_PI } from "./geometry";

describe("ITEMS", () => {
  it("tem 12 transportes", () => {
    expect(ITEMS).toHaveLength(12);
  });

  it("nomes e imagens são únicos", () => {
    expect(new Set(ITEMS.map((i) => i.name)).size).toBe(ITEMS.length);
    expect(new Set(ITEMS.map((i) => i.img)).size).toBe(ITEMS.length);
  });

  it("todas as imagens são .webp dentro de assets/img/", () => {
    for (const item of ITEMS) {
      expect(item.img).toMatch(/^assets\/img\/[a-z-]+\.webp$/);
    }
  });
});

describe("SLICE", () => {
  it("as fatias somam o círculo completo", () => {
    expect(SLICE * ITEMS.length).toBeCloseTo(TWO_PI);
  });
});

describe("COLORS", () => {
  it("fatias vizinhas nunca repetem cor (inclusive a última com a primeira)", () => {
    for (let i = 0; i < ITEMS.length; i++) {
      const current = COLORS[i % COLORS.length];
      const next = COLORS[(i + 1) % ITEMS.length % COLORS.length];
      expect(current).not.toBe(next);
    }
  });
});
