/**
 * Agent hook: every game exposes `window.__agi` so tools (play-check, the agent's browser)
 * can read game state as JSON and drive the game with named actions instead of pixels.
 * Reading a small JSON state is far cheaper in tokens than reading screenshots.
 */
export interface AgiHook {
  /** True once the game finished booting and accepts actions. */
  ready: boolean;
  /** Small, JSON-serialisable snapshot of what matters for checks. */
  state(): unknown;
  /** Run a named game action (same path the touch UI uses). */
  act(name: string, ...args: unknown[]): unknown;
  /** Names of available actions. */
  actions(): string[];
  /** Uncaught errors seen since boot. */
  errors: string[];
}

declare global {
  interface Window {
    __agi?: AgiHook;
  }
}

export type ActionMap = Record<string, (...args: never[]) => unknown>;

/** Game time skipped ahead by advance(); Date.now() stays monotonic and includes it. */
let dateOffset = 0;
function installVirtualDate(): void {
  const realNow = Date.now.bind(Date);
  if ((Date.now as { agi?: boolean }).agi) return;
  const now = () => realNow() + dateOffset;
  (now as { agi?: boolean }).agi = true;
  Date.now = now;
}

/** Anything with Phaser.Game's step(time, delta). */
export interface Steppable {
  step(time: number, delta: number): void;
}

/**
 * Built-in actions added when a game is passed:
 *  - advance(ms): run ms of game time right now in 60 fps steps and return the new state.
 *    Browsers throttle requestAnimationFrame in hidden tabs, so checks must not wait on real time.
 */
export function exposeHook(getState: () => unknown, actions: ActionMap, game?: Steppable): AgiHook {
  const errors: string[] = window.__agi?.errors ?? [];
  if (game) {
    let clock = performance.now();
    actions = {
      ...actions,
      advance: (ms: number = 1000) => {
        const dt = 1000 / 60;
        clock = Math.max(clock, performance.now());
        for (let t = 0; t < ms; t += dt) {
          // Phaser's TweenManager measures time with Date.now(), not the step delta.
          dateOffset += dt;
          game.step((clock += dt), dt);
        }
        return getState();
      },
    };
    installVirtualDate();
  }
  const hook: AgiHook = {
    ready: true,
    state: getState,
    actions: () => Object.keys(actions),
    act(name, ...args) {
      const fn = actions[name] as ((...a: unknown[]) => unknown) | undefined;
      if (!fn) throw new Error(`unknown action "${name}", available: ${Object.keys(actions).join(", ")}`);
      return fn(...args);
    },
    errors,
  };
  window.__agi = hook;
  return hook;
}

/** Call first thing in main.ts so boot errors are captured too. */
export function captureErrors(): void {
  const errors: string[] = [];
  window.__agi = { ready: false, state: () => null, act: () => undefined, actions: () => [], errors };
  window.addEventListener("error", (e) => errors.push(String(e.error?.stack ?? e.message)));
  window.addEventListener("unhandledrejection", (e) => errors.push(String(e.reason?.stack ?? e.reason)));
}
