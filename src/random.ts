// Sorteios nomeados — esconde a aritmética do Math.random.

/** Inteiro em [0, count) — índice aleatório de uma lista */
export const randomIndex = (count: number): number => Math.floor(Math.random() * count);

/** Inteiro em [min, max], inclusivo nas duas pontas */
export const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

/** Número real em [min, max) */
export const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);
