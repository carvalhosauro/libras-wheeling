import { describe, it, expect } from "vitest";
import { randomIndex, randomInt, randomBetween } from "./random";

const RUNS = 1000;

describe("randomIndex", () => {
  it("retorna inteiros em [0, count)", () => {
    for (let i = 0; i < RUNS; i++) {
      const v = randomIndex(12);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(12);
    }
  });

  it("cobre todo o intervalo", () => {
    const seen = new Set(Array.from({ length: RUNS }, () => randomIndex(12)));
    expect(seen.size).toBe(12);
  });
});

describe("randomInt", () => {
  it("retorna inteiros em [min, max] inclusivo", () => {
    const seen = new Set<number>();
    for (let i = 0; i < RUNS; i++) {
      const v = randomInt(5, 7);
      expect([5, 6, 7]).toContain(v);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([5, 6, 7]));
  });
});

describe("randomBetween", () => {
  it("retorna reais em [min, max)", () => {
    for (let i = 0; i < RUNS; i++) {
      const v = randomBetween(-0.35, 0.35);
      expect(v).toBeGreaterThanOrEqual(-0.35);
      expect(v).toBeLessThan(0.35);
    }
  });
});
