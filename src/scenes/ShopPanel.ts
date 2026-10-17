import { FONT, makeButton } from "@agi/kit/phaser";
import type Phaser from "phaser";
import type { SimyaGame } from "../logic/game";

export interface ShopCallbacks {
  onBuyItem: (idx: number) => void;
  onRerollShop: () => void;
  onNextRound: () => void;
  onRestart: () => void;
}

export function renderShopTable(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  rules: SimyaGame,
  cb: ShopCallbacks,
): void {
  const reward = rules.lastReward;
  const rewardStr = reward
    ? `Tur Ödülü: +${reward.total} Altın (Taban ${reward.baseReward} + El ${reward.handsBonus} + Faiz ${reward.interest}${reward.talismanGold ? ` + Tılsım ${reward.talismanGold}` : ""})`
    : "Simya Pazarı";

  const header = scene.add
    .text(806, 184, "SİMYA PAZARI — DÜKKÂN", { fontFamily: FONT, fontSize: "28px", color: "#ffd166", fontStyle: "bold", stroke: "#000", strokeThickness: 5 })
    .setOrigin(0.5);
  const sub = scene.add.text(806, 218, rewardStr, { fontFamily: FONT, fontSize: "18px", color: "#4ade80", fontStyle: "bold" }).setOrigin(0.5);
  layer.add([header, sub]);

  const positions = [
    { x: 585, y: 332 },
    { x: 1025, y: 332 },
    { x: 585, y: 492 },
    { x: 1025, y: 492 },
  ];

  rules.shop.forEach((item, idx) => {
    const pos = positions[idx];
    if (!pos) return;
    const box = scene.add.graphics();
    box.fillStyle(item.bought ? 0x1e293b : 0x172036, 0.95).fillRoundedRect(pos.x - 205, pos.y - 68, 410, 136, 14);
    box.lineStyle(2, item.bought ? 0x475569 : 0xffd166, 0.8).strokeRoundedRect(pos.x - 205, pos.y - 68, 410, 136, 14);

    const icon = scene.add.image(pos.x - 152, pos.y - 10, item.icon).setScale(0.85);
    const kindTag = item.kind === "talisman" ? "TILSIM" : item.kind === "upgrade" ? "EL YAZMASI" : "İKSİR / MÜHÜR";
    const tagTxt = scene.add.text(pos.x - 105, pos.y - 52, kindTag, { fontFamily: FONT, fontSize: "12px", color: "#38bdf8", fontStyle: "bold" });
    const nameTxt = scene.add.text(pos.x - 105, pos.y - 32, item.name, { fontFamily: FONT, fontSize: "20px", color: "#ffd166", fontStyle: "bold" });
    const descTxt = scene.add.text(pos.x - 105, pos.y - 4, item.desc, {
      fontFamily: FONT,
      fontSize: "14px",
      color: "#e2e8f0",
      wordWrap: { width: 295 },
    });

    layer.add([box, icon, tagTxt, nameTxt, descTxt]);

    if (item.bought) {
      const soldLbl = scene.add
        .text(pos.x + 125, pos.y + 42, "ALINDI", { fontFamily: FONT, fontSize: "18px", color: "#94a3b8", fontStyle: "bold" })
        .setOrigin(0.5);
      layer.add(soldLbl);
    } else {
      const canAfford =
        rules.gold >= item.cost && (item.kind !== "talisman" || rules.talismans.length < 5);
      const buyBtn = makeButton(
        scene,
        pos.x + 115,
        pos.y + 40,
        `Al (${item.cost} Altın)`,
        0x2a9d8f,
        () => cb.onBuyItem(idx),
        156,
        48,
      );
      buyBtn.setEnabled(canAfford);
      layer.add(buyBtn);
    }
  });

  const rerollBtn = makeButton(
    scene,
    625,
    648,
    `Yenile (${rules.rerollCost} Altın)`,
    0xd97706,
    () => cb.onRerollShop(),
    280,
    58,
  );
  rerollBtn.setEnabled(rules.gold >= rules.rerollCost);

  const nextBtn = makeButton(scene, 975, 648, "Sonraki Sınav →", 0x2a9d8f, () => cb.onNextRound(), 290, 58);
  layer.add([rerollBtn, nextBtn]);
}

export function renderEndScreen(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  rules: SimyaGame,
  onRestart: () => void,
): void {
  const won = rules.phase === "won";
  const panel = scene.add.graphics();
  panel.fillStyle(0x090d1c, 0.92).fillRoundedRect(420, 190, 770, 460, 20);
  panel.lineStyle(3, won ? 0xffd166 : 0xe63946, 0.9).strokeRoundedRect(420, 190, 770, 460, 20);

  const icon = scene.add.image(805, 265, won ? "crown" : "orb").setScale(1.3);
  const title = scene.add
    .text(805, 340, won ? "ZAFER! SİMYA USTASI" : "SINAV BAŞARISIZ", {
      fontFamily: FONT,
      fontSize: "44px",
      color: won ? "#ffd166" : "#ff6b6b",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 6,
    })
    .setOrigin(0.5);

  const stats = scene.add
    .text(
      805,
      435,
      `Ulaşılan Tur: ${rules.round}/${rules.maxRounds}\nSon Tur Puanı: ${rules.score} / ${rules.target}\nToplam Sefer Puanı: ${rules.totalScore}`,
      { fontFamily: FONT, fontSize: "24px", color: "#e2e8f0", align: "center", lineSpacing: 8 },
    )
    .setOrigin(0.5);

  const againBtn = makeButton(scene, 805, 565, "Tekrar Oyna", 0x2a9d8f, () => onRestart(), 280, 64);
  layer.add([panel, icon, title, stats, againBtn]);
}
