// Funções puras de geometria da roleta — sem estado, sem DOM.
// Convenção: rotation é o ângulo do canvas (negativo = roleta girando no sentido horário);
// o ponteiro fica fixo no topo e a fatia 0 nasce centralizada nele.

export const TWO_PI = Math.PI * 2;

/** Normaliza qualquer ângulo para o intervalo [0, 2π) */
export const normalizeAngle = (angle: number): number => ((angle % TWO_PI) + TWO_PI) % TWO_PI;

/** Quanto a roleta já girou no sentido horário, em [0, 2π) */
export const wheelTurns = (rotation: number): number => normalizeAngle(-rotation);

/** Índice da fatia que está sob o ponteiro */
export const indexAtPointer = (rotation: number, slice: number, count: number): number =>
  Math.round(wheelTurns(rotation) / slice) % count;

/** Ângulo central da fatia `i` (fatia 0 aponta para cima) */
export const sliceMiddle = (i: number, slice: number): number => i * slice - Math.PI / 2;

/** Ângulo onde a fatia `i` começa */
export const sliceStart = (i: number, slice: number): number => sliceMiddle(i, slice) - slice / 2;

/**
 * Ângulo total a percorrer para o ponteiro parar na fatia `winner`:
 * `fullTurns` voltas completas + o arco que falta até o alvo (com `jitter`
 * para não parar sempre no centro exato da fatia).
 */
export const spinDelta = (
  rotation: number,
  winner: number,
  slice: number,
  fullTurns: number,
  jitter: number
): number => fullTurns * TWO_PI + normalizeAngle(winner * slice + jitter - wheelTurns(rotation));

/** Easing de desaceleração: rápido no início, suave na chegada */
export const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4;
