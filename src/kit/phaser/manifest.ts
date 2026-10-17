import type Phaser from "phaser";

/** The part of games/<game>/assets/manifest.json the loader needs. */
export interface AssetManifest {
  assets: readonly { id: string }[];
}

/**
 * Queue every asset of the manifest as an image under its id, from `<dir>/<id>.png` (default "assets",
 * i.e. public/assets/ built by `npm run assets -- <game>`). Call from `preload()`.
 */
export function loadManifest(scene: Phaser.Scene, manifest: AssetManifest, dir = "assets"): void {
  for (const a of manifest.assets) scene.load.image(a.id, `${dir}/${a.id}.png`);
}
