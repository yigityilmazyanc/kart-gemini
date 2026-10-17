import type Phaser from "phaser";

/** Default UI font stack; shared by the kit helpers so a game's text looks consistent. */
export const FONT = "Trebuchet MS, Verdana, sans-serif";

/** Smallest touch target, px. */
export const MIN_TOUCH = 48;

export type Button = Phaser.GameObjects.Container & { setEnabled(on: boolean): void; setLabel(text: string): void };

/**
 * Rounded button centered on (x, y). Width and height are raised to at least MIN_TOUCH (48 px) so it stays tappable.
 * A disabled button is only dimmed and still calls `onClick`, so the handler can explain why nothing happens.
 */
export function makeButton(scene: Phaser.Scene, x: number, y: number, label: string, color: number, onClick: () => void, w = 220, h = 50): Button {
  w = Math.max(w, MIN_TOUCH);
  h = Math.max(h, MIN_TOUCH);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.4).fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 14);
  g.fillStyle(color).fillRoundedRect(-w / 2, -h / 2, w, h, 14);
  const t = scene.add.text(0, 0, label, { fontFamily: FONT, fontSize: "24px", color: "#ffffff", fontStyle: "bold", align: "center" }).setOrigin(0.5);
  const c = scene.add.container(x, y, [g, t]).setSize(w, h).setInteractive({ useHandCursor: true }) as Button;
  c.setEnabled = (on) => c.setAlpha(on ? 1 : 0.4);
  c.setLabel = (text) => t.setText(text);
  let press: Phaser.Tweens.Tween | undefined;
  c.on("pointerdown", () => {
    // a double tap must not start from a half-shrunk scale and leave the button small
    press?.stop();
    c.setScale(1);
    press = scene.tweens.add({ targets: c, scale: 0.92, duration: 60, yoyo: true });
    onClick();
  });
  return c;
}
