import { describe, it, expect } from "vitest";
import {
  TWO_PI,
  normalizeAngle,
  wheelTurns,
  indexAtPointer,
  sliceMiddle,
  sliceStart,
  spinDelta,
  easeOutQuart,
} from "./geometry";

const COUNT = 12;
const SLICE = TWO_PI / COUNT;

describe("normalizeAngle", () => {
  it("mantém ângulos já normalizados", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
  });

  it("normaliza ângulos negativos para [0, 2π)", () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);
    expect(normalizeAngle(-TWO_PI)).toBeCloseTo(0);
  });

  it("normaliza ângulos acima de 2π", () => {
    expect(normalizeAngle(TWO_PI)).toBeCloseTo(0);
    expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI);
  });
});

describe("wheelTurns", () => {
  it("rotação negativa do canvas = giro horário positivo", () => {
    expect(wheelTurns(0)).toBe(0);
    expect(wheelTurns(-Math.PI / 2)).toBeCloseTo(Math.PI / 2);
  });
});

describe("indexAtPointer", () => {
  it("sem giro, ponteiro aponta para a fatia 0", () => {
    expect(indexAtPointer(0, SLICE, COUNT)).toBe(0);
  });

  it("girar exatamente uma fatia leva o ponteiro à fatia 1", () => {
    expect(indexAtPointer(-SLICE, SLICE, COUNT)).toBe(1);
  });

  it("girar uma volta completa volta à fatia 0", () => {
    expect(indexAtPointer(-TWO_PI, SLICE, COUNT)).toBe(0);
  });

  it("arredonda para a fatia mais próxima do centro", () => {
    expect(indexAtPointer(-SLICE * 0.4, SLICE, COUNT)).toBe(0);
    expect(indexAtPointer(-SLICE * 0.6, SLICE, COUNT)).toBe(1);
  });
});

describe("sliceMiddle / sliceStart", () => {
  it("fatia 0 nasce centrada no topo (-π/2)", () => {
    expect(sliceMiddle(0, SLICE)).toBeCloseTo(-Math.PI / 2);
  });

  it("início da fatia fica meia fatia antes do centro", () => {
    expect(sliceMiddle(0, SLICE) - sliceStart(0, SLICE)).toBeCloseTo(SLICE / 2);
  });

  it("fatias consecutivas são adjacentes (fim de uma = início da outra)", () => {
    for (let i = 0; i < COUNT; i++) {
      expect(sliceStart(i + 1, SLICE) - sliceStart(i, SLICE)).toBeCloseTo(SLICE);
    }
  });
});

describe("spinDelta", () => {
  it("o ponteiro sempre termina na fatia sorteada", () => {
    const rotations = [0, -1.3, -TWO_PI * 3.7, 5.1, -123.456];
    const jitters = [0, -0.3 * SLICE, 0.3 * SLICE];
    for (const rotation of rotations) {
      for (let winner = 0; winner < COUNT; winner++) {
        for (const jitter of jitters) {
          const delta = spinDelta(rotation, winner, SLICE, 5, jitter);
          const finalRotation = rotation - delta;
          expect(indexAtPointer(finalRotation, SLICE, COUNT)).toBe(winner);
        }
      }
    }
  });

  it("inclui as voltas completas pedidas", () => {
    const delta = spinDelta(0, 3, SLICE, 6, 0);
    expect(delta).toBeGreaterThanOrEqual(6 * TWO_PI);
    expect(delta).toBeLessThan(7 * TWO_PI);
  });
});

describe("easeOutQuart", () => {
  it("começa em 0 e termina em 1", () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
  });

  it("é monotônica crescente", () => {
    for (let t = 0; t < 1; t += 0.01) {
      expect(easeOutQuart(t + 0.01)).toBeGreaterThan(easeOutQuart(t));
    }
  });

  it("desacelera no final (ease-out): metade do tempo já passou de metade do caminho", () => {
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
  });
});
