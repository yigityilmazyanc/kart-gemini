/**
 * Closes a scene's actions once it asked to leave. `scene.start` / `scene.restart` are queued, so for the rest
 * of the tick the old scene is still alive and an agent or a second tap could act on it.
 *
 *   private gate = new SceneGate();
 *   create() { this.gate.reset(); ... exposeHook(state, { go: this.gate.guard(() => this.next()) }) }
 *   next() { this.gate.leave(() => this.scene.start("other")); }
 */
export class SceneGate {
  private left = false;

  /** True until `leave()` was called. */
  get open(): boolean {
    return !this.left;
  }

  /** Reopen; call at the start of `create()`, because Phaser reuses the scene instance on restart. */
  reset(): void {
    this.left = false;
  }

  /** Close the gate and run `go` (the queued scene change). Returns false, doing nothing, if already left. */
  leave(go: () => void): boolean {
    if (this.left) return false;
    this.left = true;
    go();
    return true;
  }

  /** Wrap an action: once the gate is closed it is not run and returns false. */
  guard<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R | false {
    return (...args) => (this.left ? false : fn(...args));
  }
}
