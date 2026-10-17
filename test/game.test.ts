import { describe, expect, it } from "vitest";
import { StarGame } from "../src/logic/game";
import { SpawnPlan, X_MARGIN, bombChanceAt, gapAt, speedAt } from "../src/logic/spawn";

const take = (plan: SpawnPlan, n: number) => Array.from({ length: n }, () => plan.next());

describe("difficulty curve", () => {
  it("speeds up over time and then stays at a cap", () => {
    expect(speedAt(10000)).toBeGreaterThan(speedAt(0));
    expect(speedAt(60000)).toBeGreaterThan(speedAt(10000));
    expect(speedAt(10 * 60000)).toBe(speedAt(20 * 60000));
  });
  it("spawns more often and with more bombs, within limits", () => {
    expect(gapAt(30000)).toBeLessThan(gapAt(0));
    expect(gapAt(10 * 60000)).toBeGreaterThan(0);
    expect(bombChanceAt(30000)).toBeGreaterThan(bombChanceAt(0));
    expect(bombChanceAt(10 * 60000)).toBeLessThan(1);
  });
});

describe("SpawnPlan", () => {
  it("is deterministic per seed", () => {
    expect(take(new SpawnPlan(7), 40)).toEqual(take(new SpawnPlan(7), 40));
    expect(take(new SpawnPlan(7), 40)).not.toEqual(take(new SpawnPlan(8), 40));
  });
  it("keeps x inside the margins and time increasing", () => {
    const plan = take(new SpawnPlan(3), 200);
    for (const s of plan) {
      expect(s.x).toBeGreaterThanOrEqual(X_MARGIN);
      expect(s.x).toBeLessThanOrEqual(1 - X_MARGIN);
    }
    for (let i = 1; i < plan.length; i++) expect(plan[i]!.at).toBeGreaterThan(plan[i - 1]!.at);
  });
  it("pinned bomb chance changes the kinds but not the positions", () => {
    const stars = take(new SpawnPlan(5, 0), 50);
    const bombs = take(new SpawnPlan(5, 1), 50);
    expect(stars.every((s) => s.kind === "star")).toBe(true);
    expect(bombs.every((s) => s.kind === "bomb")).toBe(true);
    expect(stars.map((s) => s.x)).toEqual(bombs.map((s) => s.x));
  });
});

describe("StarGame", () => {
  it("starts with 3 lives and no score", () => {
    const g = new StarGame(1);
    expect([g.score, g.lives, g.phase]).toEqual([0, 3, "playing"]);
  });
  it("tick returns the due spawns exactly once", () => {
    const g = new StarGame(1);
    expect(g.tick(100)).toEqual([]);
    const first = g.tick(5000);
    expect(first.length).toBeGreaterThan(2);
    expect(first.every((s) => s.at <= g.elapsed)).toBe(true);
    expect(new StarGame(1).tick(5100)).toEqual(first);
  });
  it("same seed and same ticks give the same game", () => {
    const run = (seed: number) => {
      const g = new StarGame(seed);
      const out = [];
      for (let i = 0; i < 600; i++) out.push(...g.tick(1000 / 60));
      return out;
    };
    expect(run(9)).toEqual(run(9));
  });
  it("stars add score", () => {
    const g = new StarGame(1);
    g.catchStar();
    g.catchStar();
    expect(g.score).toBe(2);
  });
  it("bombs cost a life and the third ends the round", () => {
    const g = new StarGame(1);
    g.catchBomb();
    g.catchBomb();
    expect([g.lives, g.phase]).toEqual([1, "playing"]);
    g.catchBomb();
    expect([g.lives, g.phase]).toEqual([0, "over"]);
  });
  it("is frozen once over", () => {
    const g = new StarGame(1, { lives: 1 });
    g.catchBomb();
    g.catchStar();
    g.catchBomb();
    const at = g.elapsed;
    expect(g.tick(5000)).toEqual([]);
    expect([g.score, g.lives, g.elapsed]).toEqual([0, 0, at]);
  });
});
