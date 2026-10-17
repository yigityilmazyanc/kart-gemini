import type Phaser from "phaser";
import { FONT } from "./button";

export interface FloatOptions {
  /** Pixels to drift; negative = up (default -40). */
  rise?: number;
  /** Fade-out time, ms (default 800). */
  duration?: number;
  depth?: number;
}

/**
 * Text that drifts `rise` px while fading out, then destroys itself. It is shifted so the whole text
 * and its end position stay inside the game area.
 */
export function floatText(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle = {}, { rise = -40, duration = 800, depth = 90 }: FloatOptions = {}): Phaser.GameObjects.Text {
  const { width: W, height: H } = scene.scale.gameSize;
  const t = scene.add.text(0, 0, text, { fontFamily: FONT, fontSize: "32px", color: "#ffffff", fontStyle: "bold", stroke: "#0d0a1a", strokeThickness: 6, ...style }).setOrigin(0.5).setDepth(depth);
  const clamp = (v: number, size: number, max: number) => Math.min(Math.max(v, size / 2), Math.max(max - size / 2, size / 2));
  t.setPosition(clamp(x, t.width, W), clamp(y, t.height, H));
  scene.tweens.add({ targets: t, y: clamp(y + rise, t.height, H), alpha: 0, duration, ease: "Quad.out", onComplete: () => t.destroy() });
  return t;
}
