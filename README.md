# Simya Eli (Kart Gemini)

Tablet odaklı (1280×720 yatay), Balatro benzeri simya temalı poker ve sinerji roguelike kart oyunu.
52 kartlık desteden 1–5 kartlık eller oynayarak **Fiş × Çarpan** puanı üret, **Tılsım Rafı**'ndaki tılsımlar, **El Yazmaları** (el seviyesi geliştirmeleri) ve **Kart Efsunları** (Kristal, Ateş, Çelik, Altın) ile sinerji kurarak 3 Bölüm (9 Sınav) boyunca artan hedef puanları ve **Başsimyager (Boss)** engellerini aş.

## Çalıştırma
Bu repo AGI'nin ortak kitini (`@agi/kit`) ve araçlarını kullanır.

```bash
npm run dev -- kart-gemini
```

Kontroller (AGI kökünden):
- `npm run typecheck`
- `npm test`
- `npm run playcheck -- kart-gemini`
- `npm run assets -- kart-gemini`

## Yapı
- `src/logic/cards.ts`: Saf TS kart/deste modeli ve 10 poker eli değerlendirici (`evaluateHand`).
- `src/logic/catalog.ts`: 16 özgün Tılsım (`TALISMANS`), 6 Boss kuralı (`BOSS_RULES`), hedef eğrisi (`targetScoreForRound`) ve Simya Pazarı üreticisi (`generateShopItems`).
- `src/logic/game.ts`: Saf TS oyun durum makinesi (`SimyaGame`), sıradan bağımsız iki aşamalı puanlama motoru (`scoreSelection`), el seçimi (`selectBest`), dükkân ve tur geçişleri.
- `src/scenes/GameScene.ts`, `SidebarPanel.ts`, `HandView.ts`, `ShopPanel.ts`: Phaser 3 yatay tablet arayüzü, id tabanlı kalıcı kart görünümleri (`HandView`), kenar paneli ve El Tablosu penceresi (`SidebarPanel`), dükkân ve son ekranları (`ShopPanel`), `window.__agi` ajan kancası.
- `assets/manifest.json` + `assets/svg/`: SVG şablonlarından üretilen masa, kart yüzleri, renk sembolleri ve her tılsıma özel ayırt edilebilir ikonlar.
- `playcheck/*.json`: Otomatik oynanış ve doğrulama senaryoları (`round-to-shop`, `controls`, `determinism`, `idle-over`, `moves-replay`).

## Test için URL parametreleri
- `?seed=42`: Deterministik RNG tohumu.
- `?target=100`: 1. tur hedef puanını sabitler.
- `?gold=25`: Başlangıç altın miktarını belirler.
- `?hands=4` / `?discards=3`: Tur başına el ve değiştirme haklarını belirler.
- `?rounds=2`: Toplam sınav (tur) sayısını belirler.
- `?talismans=kizil_yakut,simyaci_feneri`: Belirtilen tılsımlarla başlatır.
- `?boss=max_4_cards`: Belirtilen boss kuralını (`debuff_H`, `debuff_S`, `debuff_D`, `debuff_C`, `debuff_face`, `max_4_cards`) aktif eder.
- `?manual`: Oyun döngüsünü yalnızca `advance(ms)` ile ilerletir.

## Ajan kancası (`window.__agi`)
- `state()`: `seed, phase, round, act, maxRounds, bossRule, score, target, totalScore, handsLeft, discardsLeft, gold, rerollCost, hand, selected, preview, lastHand, talismans, shop, deckCount, sortMode, handsModal`.
- Eylemler: `selectCard(idxOrCode)`, `selectCards(list)`, `selectBest()`, `clearSelection()`, `playHand()`, `discardSelected()`, `sortHand(mode?)`, `buyItem(idxOrId)`, `sellTalisman(idxOrId)`, `rerollShop()`, `nextRound()`, `toggleHandsModal()`, `restart(seed?)`, `advance(ms)`.
