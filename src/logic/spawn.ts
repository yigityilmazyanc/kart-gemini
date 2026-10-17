import { Rng } from "@agi/kit";

export type Kind = "star" | "bomb";

/** One falling object: `at` = game time in ms, `x` = horizontal position as a 0..1 fraction of the screen width. */
export interface Spawn {
  at: number;
  kind: Kind;
  x: number;
}

/** First spawn, ms after the round starts. */
export const START_DELAY = 500;
/** Spawns stay this far from the side edges (fraction of the width). */
export const X_MARGIN = 0.08;

const BASE_SPEED = 300;
const SPEED_GAIN = 10;
const MAX_SPEED = 800;
const START_GAP = 1000;
const GAP_DROP = 12;
const MIN_GAP = 450;
const START_BOMBS = 0.2;
const BOMBS_GAIN = 0.004;
const MAX_BOMBS = 0.45;

/** Fall speed in px/s after `ms` of play: grows steadily, then stays at a cap. */
export function speedAt(ms: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + (SPEED_GAIN * ms) / 1000);
}

/** Time between two spawns, ms: shrinks as the round goes on. */
export function gapAt(ms: number): number {
  return Math.max(MIN_GAP, START_GAP - (GAP_DROP * ms) / 1000);
}

/** Chance that a spawn is a bomb (0..1). */
export function bombChanceAt(ms: number): number {
  return Math.min(MAX_BOMBS, START_BOMBS + (BOMBS_GAIN * ms) / 1000);
}

/**
 * Endless, seeded sequence of spawns: same seed -> same sequence.
 * `bombChance` pins the bomb probability (tests, `?bombs=` in the URL); it never changes how many random numbers are drawn,
 * so x positions stay the same either way.
 */
export class SpawnPlan {
  private rng: Rng;
  private at = START_DELAY;

  constructor(seed: number, private readonly bombChance?: number) {
    this.rng = new Rng(seed);
  }

  /** Time of the spawn `next()` will return. */
  get nextAt(): number {
    return this.at;
  }

  next(): Spawn {
    const at = this.at;
    const roll = this.rng.next();
    const x = X_MARGIN + (1 - 2 * X_MARGIN) * this.rng.next();
    this.at += gapAt(at);
    return { at, kind: roll < (this.bombChance ?? bombChanceAt(at)) ? "bomb" : "star", x };
  }
}
