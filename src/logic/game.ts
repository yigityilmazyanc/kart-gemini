import { type Spawn, SpawnPlan, speedAt } from "./spawn";

export type Phase = "playing" | "over";

export interface GameOptions {
  /** Starting lives (default 3). */
  lives?: number;
  /** Pin the bomb probability 0..1 instead of the difficulty curve. */
  bombChance?: number;
}

export const START_LIVES = 3;

/** Rules of one round, without Phaser: score, lives, clock and what falls when. */
export class StarGame {
  score = 0;
  lives: number;
  /** Game time in ms, advanced by `tick`. */
  elapsed = 0;
  phase: Phase = "playing";
  private plan: SpawnPlan;

  constructor(readonly seed: number, opts: GameOptions = {}) {
    this.lives = opts.lives ?? START_LIVES;
    this.plan = new SpawnPlan(seed, opts.bombChance);
  }

  /** Current fall speed, px/s. */
  get speed(): number {
    return speedAt(this.elapsed);
  }

  /** Advance the clock by `dtMs` and return the objects that became due. Nothing spawns once the round is over. */
  tick(dtMs: number): Spawn[] {
    if (this.phase !== "playing") return [];
    this.elapsed += dtMs;
    const due: Spawn[] = [];
    while (this.plan.nextAt <= this.elapsed) due.push(this.plan.next());
    return due;
  }

  catchStar(): void {
    if (this.phase === "playing") this.score += 1;
  }

  catchBomb(): void {
    if (this.phase !== "playing") return;
    this.lives = Math.max(0, this.lives - 1);
    if (this.lives === 0) this.phase = "over";
  }
}
