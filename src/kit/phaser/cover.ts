import type Phaser from "phaser";

export interface CoverFit {
  /** Uniform scale that makes the image cover the window. */
  scale: number;
  /** Crop rectangle in source-image pixels (what stays visible after scaling). */
  crop: { x: number; y: number; w: number; h: number };
}

/** Scale and crop for an iw x ih image to fill a w x h window (aspect ratio kept, overflow cropped symmetrically). */
export function coverFit(w: number, h: number, iw: number, ih: number): CoverFit {
  for (const [label, v] of [["window width", w], ["window height", h], ["image width", iw], ["image height", ih]] as const) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError(`coverFit: ${label} must be a positive number, got ${v}`);
  }
  const scale = Math.max(w / iw, h / ih);
  const cw = w / scale;
  const ch = h / scale;
  return { scale, crop: { x: (iw - cw) / 2, y: (ih - ch) / 2, w: cw, h: ch } };
}

/**
 * Image centered on (x, y) that fills a w x h window: scaled until both sides are covered (aspect ratio kept),
 * then the overflow is cropped away symmetrically. Throws when the window or the texture has no size.
 */
export function coverImage(scene: Phaser.Scene, x: number, y: number, key: string, w: number, h: number): Phaser.GameObjects.Image {
  const img = scene.add.image(x, y, key);
  const { scale, crop } = coverFit(w, h, img.width, img.height);
  return img.setScale(scale).setCrop(crop.x, crop.y, crop.w, crop.h);
}
