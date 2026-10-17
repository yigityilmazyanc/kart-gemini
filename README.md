# Kart Gemini

Gerçek zamanlı, Arcade fizikli bir yakalama oyunu iskeleti: yukarıdan düşen yıldızları sepetle yakala (+1),
bombalardan kaçın (3 can). Hız zamanla artar. Phaser 3 + TypeScript, [AGI](https://github.com/yigityilmazyanc/AGI) 2D oyun atölyesiyle yapıldı.

## Çalıştırma
Bu repo tek başına derlenmez; AGI'nin ortak kitini (`@agi/kit`) ve araçlarını kullanır.

```bash
git clone https://github.com/yigityilmazyanc/AGI.git
git clone <bu-repo-adresi> AGI/games/kart-gemini
cd AGI && npm install
npm run dev -- kart-gemini
```

Kontroller (AGI kökünden): `npm run typecheck`, `npm test`, `npm run playcheck -- kart-gemini`, `npm run assets -- kart-gemini`.

## Yapı
- `src/logic/`: Phaser'sız kurallar (`game.ts` puan/can, `spawn.ts` zorluk eğrisi ve seed'li düşen nesne planı), `test/` altında testli.
- `src/scenes/GameScene.ts`: Arcade fizik, dokunma/klavye girişi, `window.__agi` kancası.
- `assets/manifest.json` + `assets/svg/`: görseller (SVG şablonları); `assets/provenance.json` kaynak/lisans kaydı.
- `playcheck/*.json`: headless oynanış senaryoları.

## Test için URL parametreleri
`?seed=7` (aynı seed aynı oyun), `?lives=1`, `?bombs=0..100` (bomba yüzdesini sabitler), `?lane=0..100` (nesneler tek dikey çizgide düşer), `?manual` (gerçek zamanlı kare yok, oyun yalnız `advance` ile ilerler: play-check'te birebir tekrarlanan `elapsed`/`score` için).

## Ajan kancası (`window.__agi`)
`state()`: `seed, phase, score, lives, speed, basketX, elapsed, objects[{kind,x,y}]`.
Eylemler: `moveTo(x)`, `left()`, `right()`, `restart(seed?)`, `advance(ms)`.
