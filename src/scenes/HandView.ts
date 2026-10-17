import { FONT, makeButton, moveTo } from "../kit/phaser/index";
import type Phaser from "phaser";
import { type Card, cardChips, rankLabel } from "../logic/cards";
import { isCardDebuffed } from "../logic/catalog";
import type { SimyaGame } from "../logic/game";

const SUIT_COLOR: Record<string, string> = {
  H: "#e63946",
  D: "#e06d00",
  S: "#263859",
  C: "#1b7a68",
};

const ENH_TAG: Record<string, { label: string; color: string }> = {
  bonus: { label: "+30 FİŞ", color: "#1d78c4" },
  mult: { label: "+4 ÇRP", color: "#d62828" },
  steel: { label: "×1.5 ÇRP", color: "#4a5759" },
  gold: { label: "+3 ALTIN", color: "#b57c00" },
};

export interface HandViewCallbacks {
  onSelectCard: (id: string) => void;
  onPlayHand: () => void;
  onDiscard: () => void;
  onSelectBest: () => void;
  onSortHand: () => void;
}

interface CardEntry {
  container: Phaser.GameObjects.Container;
  glow: Phaser.GameObjects.Graphics;
  debuffGroup: Phaser.GameObjects.Container;
  targetX: number;
  targetY: number;
  enhancement: string;
}

export class HandView {
  private readonly scene: Phaser.Scene;
  private readonly chromeLayer: Phaser.GameObjects.Container;
  private readonly cardLayer: Phaser.GameObjects.Container;
  private readonly cb: HandViewCallbacks;
  private readonly cardsById = new Map<string, CardEntry>();

  constructor(scene: Phaser.Scene, parentLayer: Phaser.GameObjects.Container, cb: HandViewCallbacks) {
    this.scene = scene;
    this.cb = cb;
    this.chromeLayer = scene.add.container(0, 0);
    this.cardLayer = scene.add.container(0, 0);
    parentLayer.add([this.chromeLayer, this.cardLayer]);
  }

  clear(): void {
    this.chromeLayer.removeAll(true);
    this.cardLayer.removeAll(true);
    this.cardsById.clear();
  }

  render(rules: SimyaGame): void {
    this.chromeLayer.removeAll(true);

    const centerTitle = this.scene.add
      .text(806, 178, `Elindeki Kartlar (${rules.selectedIds.size}/${rules.maxSelectable()} seçili)`, {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#cbd5e1",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.chromeLayer.add(centerTitle);

    if (rules.lastHand) {
      const lh = rules.lastHand;
      const badge = this.scene.add.graphics();
      badge.fillStyle(0x0f172a, 0.82).fillRoundedRect(536, 206, 540, 86, 14);
      badge.lineStyle(2, 0xffd166, 0.6).strokeRoundedRect(536, 206, 540, 86, 14);
      const t1 = this.scene.add
        .text(806, 232, `Son Oynanan El: ${lh.handName} (${lh.playedCodes.join(" ")})`, {
          fontFamily: FONT,
          fontSize: "19px",
          color: "#ffd166",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const t2 = this.scene.add
        .text(806, 265, `${lh.chips} Fiş × ${lh.mult} Çarpan = +${lh.score} Puan`, {
          fontFamily: FONT,
          fontSize: "22px",
          color: "#4ade80",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.chromeLayer.add([badge, t1, t2]);
    } else {
      const guide = this.scene.add
        .text(806, 248, `Masaya sürmek için aşağıdan 1 ila ${rules.maxSelectable()} kart seç`, {
          fontFamily: FONT,
          fontSize: "20px",
          color: "#94a3b8",
        })
        .setOrigin(0.5);
      this.chromeLayer.add(guide);
    }

    const cards = rules.hand;
    const activeIds = new Set(cards.map((c) => c.id));
    for (const [id, entry] of this.cardsById.entries()) {
      const currentCard = cards.find((c) => c.id === id);
      if (!activeIds.has(id) || (currentCard && currentCard.enhancement !== entry.enhancement)) {
        entry.container.destroy();
        this.cardsById.delete(id);
      }
    }

    const count = cards.length;
    const areaLeft = 420;
    const areaRight = 1192;
    const step = count > 1 ? Math.min(110, (areaRight - areaLeft) / (count - 1)) : 0;
    const totalW = step * Math.max(0, count - 1);
    const startX = 806 - totalW / 2;
    const baseY = 468;

    cards.forEach((card, idx) => {
      const isSelected = rules.selectedIds.has(card.id);
      const x = Math.round(startX + idx * step);
      const y = isSelected ? baseY - 34 : baseY;
      const debuffed = isCardDebuffed(card, rules.bossRule);

      let entry = this.cardsById.get(card.id);
      if (!entry) {
        entry = this.createCardEntry(card, x, y);
        this.cardsById.set(card.id, entry);
        this.cardLayer.add(entry.container);
      } else if (entry.targetX !== x || entry.targetY !== y) {
        entry.targetX = x;
        entry.targetY = y;
        moveTo(this.scene, entry.container, { x, y, duration: 90, ease: "Quad.out" });
      }

      entry.glow.setVisible(isSelected);
      entry.debuffGroup.setVisible(debuffed);
      this.cardLayer.bringToTop(entry.container);
    });

    const canPlay = rules.selectedIds.size > 0 && rules.handsLeft > 0;
    const canDiscard = rules.selectedIds.size > 0 && rules.discardsLeft > 0;

    const playBtn = makeButton(this.scene, 490, 650, "Eli Oyna", 0x2a9d8f, () => this.cb.onPlayHand(), 210, 58);
    playBtn.setEnabled(canPlay);

    const discardBtn = makeButton(this.scene, 710, 650, "Değiştir", 0xe63946, () => this.cb.onDiscard(), 195, 58);
    discardBtn.setEnabled(canDiscard);

    const bestBtn = makeButton(this.scene, 915, 650, "En İyi El", 0x2563eb, () => this.cb.onSelectBest(), 180, 58);
    const sortLabel = rules.sortMode === "rank" ? "Sırala: Değer" : "Sırala: Renk";
    const sortBtn = makeButton(this.scene, 1120, 650, sortLabel, 0x475569, () => this.cb.onSortHand(), 195, 58);

    this.chromeLayer.add([playBtn, discardBtn, bestBtn, sortBtn]);
  }

  private createCardEntry(card: Card, x: number, y: number): CardEntry {
    const texMap: Record<string, string> = {
      none: "card-front",
      bonus: "card-bonus",
      mult: "card-mult",
      steel: "card-steel",
      gold: "card-gold",
    };
    const bgKey = texMap[card.enhancement] ?? "card-front";
    const bg = this.scene.add.image(0, 0, bgKey).setScale(0.86);

    const glow = this.scene.add.graphics();
    glow.lineStyle(4, 0xffd166, 1).strokeRoundedRect(-60, -84, 120, 168, 12);

    const color = SUIT_COLOR[card.suit] ?? "#1e293b";
    const rText = rankLabel(card.rank);
    const topRank = this.scene.add
      .text(-48, -74, rText, { fontFamily: FONT, fontSize: "26px", color, fontStyle: "bold" })
      .setOrigin(0, 0);
    const miniSuit = this.scene.add.image(-35, -32, `suit-${card.suit}`).setScale(0.34);
    const centerSuit = this.scene.add.image(0, 4, `suit-${card.suit}`).setScale(0.76);
    const chipsLbl = this.scene.add
      .text(0, 58, `+${cardChips(card.rank)} Fiş`, { fontFamily: FONT, fontSize: "14px", color: "#334155", fontStyle: "bold" })
      .setOrigin(0.5);

    const items: Phaser.GameObjects.GameObject[] = [bg, glow, topRank, miniSuit, centerSuit, chipsLbl];

    const enh = ENH_TAG[card.enhancement];
    if (enh) {
      const eTxt = this.scene.add
        .text(0, -62, enh.label, { fontFamily: FONT, fontSize: "11px", color: enh.color, fontStyle: "bold" })
        .setOrigin(0.5);
      items.push(eTxt);
    }

    const shade = this.scene.add.rectangle(0, 0, 116, 162, 0x000000, 0.55);
    const debuffTxt = this.scene.add
      .text(0, 0, "ETKİSİZ", { fontFamily: FONT, fontSize: "18px", color: "#ff6b6b", fontStyle: "bold", stroke: "#000", strokeThickness: 4 })
      .setOrigin(0.5);
    const debuffGroup = this.scene.add.container(0, 0, [shade, debuffTxt]);
    items.push(debuffGroup);

    const container = this.scene.add.container(x, y, items).setSize(120, 168).setInteractive({ useHandCursor: true });
    container.on("pointerdown", () => this.cb.onSelectCard(card.id));

    return {
      container,
      glow,
      debuffGroup,
      targetX: x,
      targetY: y,
      enhancement: card.enhancement,
    };
  }
}
