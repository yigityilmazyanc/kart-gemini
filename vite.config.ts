import { defineConfig } from "vite";

// Relative base: the built game in dist/ runs from any folder or URL path (GitHub Pages, itch.io, a zip).
export default defineConfig({
  base: "./",
  // Phaser alone is ~1.2 MB minified; one chunk is fine for a game that loads once.
  build: { chunkSizeWarningLimit: 2000 },
});
