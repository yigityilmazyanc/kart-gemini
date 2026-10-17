import type Phaser from "phaser";

const slots = new WeakMap<object, Phaser.Tweens.Tween>();

/**
 * Tween `obj` with `config` as its one position tween: a new call stops the previous one, so overlapping
 * animations of the same object never fight over x/y/angle. Returns the new tween.
 */
export function moveTo(scene: Phaser.Scene, obj: object, config: Omit<Phaser.Types.Tweens.TweenBuilderConfig, "targets">): Phaser.Tweens.Tween {
  slots.get(obj)?.stop();
  const tween = scene.tweens.add({ targets: obj, ...config });
  slots.set(obj, tween);
  return tween;
}
