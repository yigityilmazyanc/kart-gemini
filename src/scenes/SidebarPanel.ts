import { FONT, makeButton } from "@agi/kit/phaser";
import type Phaser from "phaser";
import { HAND_TYPES } from "../logic/cards";
import { BOSS_RULE_MAP, TALISMAN_MAP } from "../logic/catalog";
import type { SimyaGame } from "../logic/game";

export interface SidebarCallbacks {
  onToggleHandsModal: () => void;
  onRestart: () => void;
  onSellTalisman: (idx: number) => void;
  onInspectTalisman: (info: string) => void;
}

export function renderSidebar(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  rules: SimyaGame,
  cb: SidebarCallbacks,
): void {
  const cx = 174;

  const title = scene.add
    .text(cx, 40, "SİMYA ELİ", { fontFamily: FONT, fontSize: "30px", color: "#ffd166", fontStyle: "bold", stroke: "#000", strokeThickness: 5 })
    .setOrigin(0.5);
  const sub = scene.add
    .text(cx, 72, `Bölüm ${rules.act} • Tur ${rules.round}/${rules.maxRounds}`, {
      fontFamily: FONT,
      fontSize: "18px",
      color: "#cbd5e1",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const stageName = scene.add
    .text(cx, 97, rules.title, { fontFamily: FONT, fontSize: "20px", color: "#38bdf8", fontStyle: "bold" })
    .setOrigin(0.5);
  layer.add([title, sub, stageName]);

  const bossBox = scene.add.graphics();
  if (rules.bossRule) {
    const bDef = BOSS_RULE_MAP[rules.bossRule];
    bossBox.fillStyle(0x4a121b, 0.92).fillRoundedRect(28, 116, 292, 54, 10);
    bossBox.lineStyle(2, 0xe63946, 0.9).strokeRoundedRect(28, 116, 292, 54, 10);
    const bTitle = scene.add
      .text(cx, 131, `BOSS: ${bDef.name}`, { fontFamily: FONT, fontSize: "16px", color: "#ffb4a2", fontStyle: "bold" })
      .setOrigin(0.5);
    const bDesc = scene.add
      .text(cx, 152, bDef.desc, { fontFamily: FONT, fontSize: "13px", color: "#ffffff", wordWrap: { width: 276 }, align: "center" })
      .setOrigin(0.5);
    layer.add([bossBox, bTitle, bDesc]);
  } else {
    bossBox.fillStyle(0x1b263b, 0.75).fillRoundedRect(28, 116, 292, 54, 10);
    const bNormal = scene.add
      .text(cx, 143, "Boss Engeli Yok • Serbest Masa", { fontFamily: FONT, fontSize: "15px", color: "#94a3b8" })
      .setOrigin(0.5);
    layer.add([bossBox, bNormal]);
  }

  const scorePanel = scene.add.graphics();
  scorePanel.fillStyle(0x0b1120, 0.95).fillRoundedRect(28, 180, 292, 118, 12);
  scorePanel.lineStyle(2, 0xc98a1b, 0.8).strokeRoundedRect(28, 180, 292, 118, 12);

  const targetLbl = scene.add
    .text(cx, 202, `HEDEF: ${rules.target}`, { fontFamily: FONT, fontSize: "22px", color: "#ffd166", fontStyle: "bold" })
    .setOrigin(0.5);
  const curScoreLbl = scene.add
    .text(cx, 238, `PUAN: ${rules.score}`, { fontFamily: FONT, fontSize: "30px", color: "#ffffff", fontStyle: "bold" })
    .setOrigin(0.5);

  const ratio = Math.min(1, rules.score / Math.max(1, rules.target));
  scorePanel.fillStyle(0x1e293b, 1).fillRoundedRect(44, 268, 260, 16, 8);
  if (ratio > 0) {
    scorePanel.fillStyle(0x2ec4b6, 1).fillRoundedRect(44, 268, Math.max(14, Math.round(260 * ratio)), 16, 8);
  }
  layer.add([scorePanel, targetLbl, curScoreLbl]);

  const prevPanel = scene.add.graphics();
  prevPanel.fillStyle(0x161f33, 0.95).fillRoundedRect(28, 308, 292, 120, 12);
  prevPanel.lineStyle(1.5, 0x475569, 0.8).strokeRoundedRect(28, 308, 292, 120, 12);
  layer.add(prevPanel);

  const preview = rules.scoreSelection();
  if (preview) {
    const hTitle = scene.add
      .text(cx, 330, `${preview.handName} (Sv.${preview.level})`, { fontFamily: FONT, fontSize: "20px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);

    const chipBox = scene.add.graphics();
    chipBox.fillStyle(0x1d78c4, 1).fillRoundedRect(42, 352, 92, 40, 8);
    chipBox.fillStyle(0xd62828, 1).fillRoundedRect(154, 352, 82, 40, 8);

    const cTxt = scene.add.text(88, 372, `${preview.chips}`, { fontFamily: FONT, fontSize: "22px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5);
    const xTxt = scene.add.text(144, 372, "×", { fontFamily: FONT, fontSize: "22px", color: "#ffd166", fontStyle: "bold" }).setOrigin(0.5);
    const mTxt = scene.add.text(195, 372, `${preview.mult}`, { fontFamily: FONT, fontSize: "22px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5);
    const eqTxt = scene.add
      .text(274, 372, `=${preview.score}`, { fontFamily: FONT, fontSize: "20px", color: "#ffd166", fontStyle: "bold" })
      .setOrigin(0.5);

    const subHint = scene.add
      .text(cx, 410, preview.debuffedIds.length > 0 ? `${preview.debuffedIds.length} kart boss nedeniyle etkisiz!` : "Seçili elin net puanı", {
        fontFamily: FONT,
        fontSize: "13px",
        color: preview.debuffedIds.length > 0 ? "#ff6b6b" : "#94a3b8",
      })
      .setOrigin(0.5);
    layer.add([hTitle, chipBox, cTxt, xTxt, mTxt, eqTxt, subHint]);
  } else if (rules.lastHand) {
    const lh = rules.lastHand;
    const hTitle = scene.add
      .text(cx, 336, `Son El: ${lh.handName}`, { fontFamily: FONT, fontSize: "19px", color: "#cbd5e1", fontStyle: "bold" })
      .setOrigin(0.5);
    const fTxt = scene.add
      .text(cx, 372, `${lh.chips} Fiş × ${lh.mult} Çarpan`, { fontFamily: FONT, fontSize: "18px", color: "#38bdf8", fontStyle: "bold" })
      .setOrigin(0.5);
    const sTxt = scene.add
      .text(cx, 404, `+${lh.score} Puan`, { fontFamily: FONT, fontSize: "22px", color: "#ffd166", fontStyle: "bold" })
      .setOrigin(0.5);
    layer.add([hTitle, fTxt, sTxt]);
  } else {
    const emptyTxt = scene.add
      .text(cx, 368, "Önizleme için\nelinden kart seç", { fontFamily: FONT, fontSize: "18px", color: "#94a3b8", align: "center" })
      .setOrigin(0.5);
    layer.add(emptyTxt);
  }

  const statBg = scene.add.graphics();
  statBg.fillStyle(0x16243d, 0.95).fillRoundedRect(28, 438, 138, 66, 10);
  statBg.lineStyle(1.5, 0x38bdf8, 0.7).strokeRoundedRect(28, 438, 138, 66, 10);

  statBg.fillStyle(0x2d1622, 0.95).fillRoundedRect(182, 438, 138, 66, 10);
  statBg.lineStyle(1.5, 0xf87171, 0.7).strokeRoundedRect(182, 438, 138, 66, 10);

  statBg.fillStyle(0x1f2421, 0.95).fillRoundedRect(28, 514, 138, 58, 10);
  statBg.lineStyle(1.5, 0xffd166, 0.7).strokeRoundedRect(28, 514, 138, 58, 10);

  statBg.fillStyle(0x1e1b2e, 0.95).fillRoundedRect(182, 514, 138, 58, 10);
  statBg.lineStyle(1.5, 0xa78bfa, 0.7).strokeRoundedRect(182, 514, 138, 58, 10);

  layer.add([
    statBg,
    scene.add.text(97, 455, "EL HAKKI", { fontFamily: FONT, fontSize: "13px", color: "#93c5fd", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.text(97, 482, `${rules.handsLeft}`, { fontFamily: FONT, fontSize: "28px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.text(251, 455, "DEĞİŞTİRME", { fontFamily: FONT, fontSize: "13px", color: "#fca5a5", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.text(251, 482, `${rules.discardsLeft}`, { fontFamily: FONT, fontSize: "28px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.image(54, 543, "icon-coin").setScale(0.72),
    scene.add.text(108, 543, `${rules.gold} Altın`, { fontFamily: FONT, fontSize: "20px", color: "#ffd166", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.image(204, 543, "card-back").setScale(0.22),
    scene.add.text(262, 533, "DESTE", { fontFamily: FONT, fontSize: "12px", color: "#c4b5fd", fontStyle: "bold" }).setOrigin(0.5),
    scene.add.text(262, 554, `${rules.drawPile.length}/${rules.fullDeck.length}`, { fontFamily: FONT, fontSize: "19px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5),
  ]);

  const handsBtn = makeButton(scene, cx, 610, "El Tablosu", 0x3b4252, () => cb.onToggleHandsModal(), 280, 50);
  const restartBtn = makeButton(scene, cx, 668, "Yeni Oyun", 0x6b2d5c, () => cb.onRestart(), 280, 50);
  layer.add([handsBtn, restartBtn]);
}

export function renderTalismanShelf(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  rules: SimyaGame,
  infoMessage: string,
  cb: SidebarCallbacks,
): void {
  const label = scene.add.text(366, 26, `TILSIM RAFI (${rules.talismans.length}/5)`, {
    fontFamily: FONT,
    fontSize: "15px",
    color: "#ffd166",
    fontStyle: "bold",
  });
  const infoTxt = scene.add.text(600, 26, infoMessage, {
    fontFamily: FONT,
    fontSize: "15px",
    color: "#e2e8f0",
  });
  layer.add([label, infoTxt]);

  const startX = 438;
  const gap = 172;
  const y = 94;

  for (let i = 0; i < 5; i++) {
    const x = startX + i * gap;
    const tid = rules.talismans[i];
    const slotFrame = scene.add.image(x, y, "talisman-frame").setScale(1.18, 0.86);
    layer.add(slotFrame);

    if (tid) {
      const def = TALISMAN_MAP[tid];
      const icon = scene.add.image(x - 46, y - 6, def.icon).setScale(0.65);
      const nameTxt = scene.add
        .text(x + 14, y - 18, def.name, { fontFamily: FONT, fontSize: "14px", color: "#ffd166", fontStyle: "bold", align: "center", wordWrap: { width: 96 } })
        .setOrigin(0.5);
      const sellVal = Math.max(1, Math.floor(def.cost / 2));
      const subTxt = scene.add
        .text(x + 14, y + 14, rules.phase === "shop" ? `Sat: +${sellVal}A` : "Bilgi için dokun", {
          fontFamily: FONT,
          fontSize: "12px",
          color: rules.phase === "shop" ? "#4ade80" : "#cbd5e1",
        })
        .setOrigin(0.5);

      slotFrame.setInteractive({ useHandCursor: true });
      slotFrame.on("pointerdown", () => {
        if (rules.phase === "shop") {
          cb.onSellTalisman(i);
        } else {
          cb.onInspectTalisman(`${def.name}: ${def.desc}`);
        }
      });
      layer.add([icon, nameTxt, subTxt]);
    } else {
      const emptyLbl = scene.add.text(x, y, "Boş Yuva", { fontFamily: FONT, fontSize: "14px", color: "#64748b" }).setOrigin(0.5);
      layer.add(emptyLbl);
    }
  }
}

export function renderHandsModal(
  scene: Phaser.Scene,
  modalLayer: Phaser.GameObjects.Container,
  rules: SimyaGame,
  visible: boolean,
  width: number,
  height: number,
  onClose: () => void,
): void {
  modalLayer.removeAll(true);
  if (!visible) return;

  const shade = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setInteractive();
  shade.on("pointerdown", () => onClose());

  const box = scene.add.graphics();
  box.fillStyle(0x111827, 0.98).fillRoundedRect(290, 70, 700, 580, 18);
  box.lineStyle(3, 0xffd166, 0.9).strokeRoundedRect(290, 70, 700, 580, 18);

  const header = scene.add
    .text(640, 108, "EL TABLOSU VE SEVİYELERİ", { fontFamily: FONT, fontSize: "28px", color: "#ffd166", fontStyle: "bold" })
    .setOrigin(0.5);

  modalLayer.add([shade, box, header]);

  HAND_TYPES.forEach((ht, i) => {
    const st = rules.handStats(ht);
    const y = 158 + i * 42;
    const rowBg = scene.add.graphics();
    rowBg.fillStyle(i % 2 === 0 ? 0x1e293b : 0x172033, 0.9).fillRoundedRect(330, y - 16, 620, 36, 8);
    const nameTxt = scene.add.text(350, y, `${st.name}`, { fontFamily: FONT, fontSize: "18px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0, 0.5);
    const lvlTxt = scene.add.text(610, y, `Seviye ${st.level}`, { fontFamily: FONT, fontSize: "17px", color: "#38bdf8", fontStyle: "bold" }).setOrigin(0.5);
    const valTxt = scene.add
      .text(930, y, `${st.chips} Fiş × ${st.mult} Çarpan`, { fontFamily: FONT, fontSize: "18px", color: "#ffd166", fontStyle: "bold" })
      .setOrigin(1, 0.5);
    modalLayer.add([rowBg, nameTxt, lvlTxt, valTxt]);
  });

  const closeBtn = makeButton(scene, 640, 605, "Kapat", 0xe63946, () => onClose(), 220, 52);
  modalLayer.add(closeBtn);
}
