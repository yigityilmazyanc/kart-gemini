import { exposeHook } from "@agi/kit";
import { type FloatOptions, SceneGate, coverImage, floatText, loadManifest, urlParams } from "@agi/kit/phaser";
import Phaser from "phaser";
import manifest from "../../assets/manifest.json";
import { BOSS_RULES, type BossRuleId, TALISMANS, type TalismanId } from "../logic/catalog";
import { SimyaGame } from "../logic/game";
import { HandView } from "./HandView";
import { renderEndScreen, renderShopTable } from "./ShopPanel";
import { renderHandsModal, renderSidebar, renderTalismanShelf } from "./SidebarPanel";

export const W = 1280;
export const H = 720;

export class GameScene extends Phaser.Scene {
  private rules!: SimyaGame;
  private gate = new SceneGate();
  private uiLayer!: Phaser.GameObjects.Container;
  private handLayer!: Phaser.GameObjects.Container;
  private panelLayer!: Phaser.GameObjects.Container;
  private modalLayer!: Phaser.GameObjects.Container;
  private handView!: HandView;
  private activeFloats: Phaser.GameObjects.Text[] = [];
  private showingHandsModal = false;
  private infoMessage = "";

  constructor() {
    super("game");
  }

  preload(): void {
    loadManifest(this, manifest);
  }

  create(data: { seed?: number } = {}): void {
    const q = urlParams();
    this.gate.reset();
    if (q.has("manual")) this.game.loop.sleep();

    const validTalismanIds = TALISMANS.map((t) => t.id);
    const validBossIds = BOSS_RULES.map((b) => b.id);
    const seed = data.seed ?? q.int("seed", Date.now() % 100000);
    const startTalismans = q.list("talismans", validTalismanIds) as TalismanId[];
    const bossParam = q.str("boss", "");
    const pinnedBoss = validBossIds.includes(bossParam as BossRuleId) ? (bossParam as BossRuleId) : undefined;

    this.rules = new SimyaGame(seed, {
      hands: q.has("hands") ? q.int("hands", 4, 1, 20) : undefined,
      discards: q.has("discards") ? q.int("discards", 3, 0, 20) : undefined,
      gold: q.has("gold") ? q.int("gold", 6, 0, 999) : undefined,
      target: q.has("target") ? q.int("target", 210, 10, 999999) : undefined,
      maxRounds: q.has("rounds") ? q.int("rounds", 9, 1, 30) : undefined,
      talismans: startTalismans.length > 0 ? startTalismans : undefined,
      bossRule: pinnedBoss,
    });

    this.showingHandsModal = false;
    this.activeFloats = [];
    this.infoMessage = `Kartlara dokunarak 1-${this.rules.maxSelectable()} kart seç, sonra Eli Oyna veya Değiştir.`;

    coverImage(this, W / 2, H / 2, "bg", W, H);
    this.uiLayer = this.add.container(0, 0).setDepth(10);
    this.handLayer = this.add.container(0, 0).setDepth(20);
    this.panelLayer = this.add.container(0, 0).setDepth(30);
    this.modalLayer = this.add.container(0, 0).setDepth(100);

    this.handView = new HandView(this, this.handLayer, {
      onSelectCard: (id) => this.onSelectCard(id),
      onPlayHand: () => this.onPlayHand(),
      onDiscard: () => this.onDiscard(),
      onSelectBest: () => this.onSelectBest(),
      onSortHand: () => this.onSortHand(),
    });

    this.setupKeyboard();
    this.renderAll();

    exposeHook(
      () => this.state(),
      {
        selectCard: this.gate.guard((idxOrCode: number | string) => this.onSelectCard(idxOrCode)),
        selectCards: this.gate.guard((list: (number | string)[]) => this.onSelectCards(list)),
        selectBest: this.gate.guard(() => this.onSelectBest()),
        clearSelection: this.gate.guard(() => this.onClearSelection()),
        playHand: this.gate.guard(() => this.onPlayHand()),
        discardSelected: this.gate.guard(() => this.onDiscard()),
        sortHand: this.gate.guard((mode?: "rank" | "suit") => this.onSortHand(mode)),
        buyItem: this.gate.guard((idxOrId: number | string) => this.onBuyItem(idxOrId)),
        sellTalisman: this.gate.guard((idxOrId: number | string) => this.onSellTalisman(idxOrId)),
        rerollShop: this.gate.guard(() => this.onRerollShop()),
        nextRound: this.gate.guard(() => this.onNextRound()),
        toggleHandsModal: this.gate.guard(() => this.onToggleHandsModal()),
        restart: (newSeed?: number) => this.restart(newSeed),
      },
      this.game,
    );
  }

  private setupKeyboard(): void {
    this.input.keyboard?.on("keydown-ENTER", this.gate.guard(() => this.onPlayHand()));
    this.input.keyboard?.on("keydown-SPACE", this.gate.guard(() => this.onSelectBest()));
    this.input.keyboard?.on("keydown-BACKSPACE", this.gate.guard(() => this.onDiscard()));
    this.input.keyboard?.on("keydown-S", this.gate.guard(() => this.onSortHand()));
  }

  private showFloat(
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle = {},
    opts?: FloatOptions,
  ): void {
    const t = floatText(this, x, y, text, style, opts);
    this.activeFloats.push(t);
  }

  private clearFloats(): void {
    for (const t of this.activeFloats) {
      if (t.active) t.destroy();
    }
    this.activeFloats = [];
  }

  // ---------- Agent Hook State ----------

  private state() {
    const preview = this.rules.scoreSelection();
    const last = this.rules.lastHand;
    return {
      seed: this.rules.seed,
      phase: this.rules.phase,
      round: this.rules.round,
      act: this.rules.act,
      maxRounds: this.rules.maxRounds,
      bossRule: this.rules.bossRule,
      score: this.rules.score,
      target: this.rules.target,
      totalScore: this.rules.totalScore,
      handsLeft: this.rules.handsLeft,
      discardsLeft: this.rules.discardsLeft,
      gold: this.rules.gold,
      rerollCost: this.rules.rerollCost,
      hand: this.rules.hand.map((c) => c.code),
      selected: this.rules.selectedCards().map((c) => c.code),
      preview: preview
        ? {
            handType: preview.handType,
            handName: preview.handName,
            chips: preview.chips,
            mult: preview.mult,
            score: preview.score,
          }
        : null,
      lastHand: last
        ? {
            handType: last.handType,
            handName: last.handName,
            chips: last.chips,
            mult: last.mult,
            score: last.score,
          }
        : null,
      talismans: [...this.rules.talismans],
      shop:
        this.rules.phase === "shop"
          ? this.rules.shop.map((s) => ({
              id: s.id,
              kind: s.kind,
              name: s.name,
              cost: s.cost,
              bought: s.bought,
            }))
          : [],
      deckCount: this.rules.drawPile.length,
      sortMode: this.rules.sortMode,
      handsModal: this.showingHandsModal,
    };
  }

  // ---------- Actions ----------

  private onSelectCard(idxOrCode: number | string): boolean {
    if (this.rules.phase !== "playing") return false;
    const card = this.rules.resolveHandCard(idxOrCode);
    if (!card) return false;
    if (!this.rules.selectedIds.has(card.id) && this.rules.selectedIds.size >= this.rules.maxSelectable()) {
      this.showFloat(800, 410, `En fazla ${this.rules.maxSelectable()} kart!`, { color: "#ff6b6b", fontSize: "26px" });
      return false;
    }
    const ok = this.rules.toggleSelect(card.id);
    if (!ok) return false;
    this.renderAll();
    return true;
  }

  private onSelectCards(list: (number | string)[]): boolean {
    const ok = this.rules.selectCards(list);
    this.renderAll();
    return ok;
  }

  private onSelectBest(): boolean {
    const ok = this.rules.selectBest();
    if (ok) {
      const p = this.rules.scoreSelection();
      if (p) this.infoMessage = `En iyi el seçildi: ${p.handName} (${p.chips} Fiş × ${p.mult} Çarpan = ${p.score} Puan)`;
      this.renderAll();
    }
    return ok;
  }

  private onClearSelection(): boolean {
    const ok = this.rules.clearSelection();
    this.renderAll();
    return ok;
  }

  private onSortHand(mode?: "rank" | "suit"): boolean {
    const ok = this.rules.sortHand(mode);
    if (ok) this.renderAll();
    return ok;
  }

  private onPlayHand(): boolean {
    if (this.rules.phase !== "playing") return false;
    if (this.rules.selectedIds.size === 0) {
      this.showFloat(800, 420, "Önce en az 1 kart seç!", { color: "#ffd166", fontSize: "28px" });
      return false;
    }
    const report = this.rules.playHand();
    if (!report) return false;

    this.infoMessage = `${report.handName}: ${report.chips} Fiş × ${report.mult} Çarpan = +${report.score} Puan!`;
    if (this.rules.phase !== "playing") {
      this.clearFloats();
    }
    this.renderAll();
    if (this.rules.phase === "playing") {
      this.showFloat(800, 270, `${report.handName}! +${report.score}`, { color: "#ffd166", fontSize: "38px" }, { rise: -55, duration: 950 });
    }
    return true;
  }

  private onDiscard(): boolean {
    if (this.rules.phase !== "playing") return false;
    if (this.rules.discardsLeft <= 0) {
      this.showFloat(800, 420, "Değiştirme hakkın kalmadı!", { color: "#ff6b6b", fontSize: "28px" });
      return false;
    }
    if (this.rules.selectedIds.size === 0) {
      this.showFloat(800, 420, "Değiştirmek için kart seç!", { color: "#ffd166", fontSize: "28px" });
      return false;
    }
    const ok = this.rules.discardSelected();
    if (ok) {
      if (this.rules.phase !== "playing") {
        this.clearFloats();
        this.infoMessage = "Destede ve elde kart kalmadı! Sınav başarısız.";
      } else {
        this.infoMessage = "Seçilen kartlar değiştirildi ve yeni kartlar çekildi.";
      }
      this.renderAll();
      if (this.rules.phase === "playing") {
        this.showFloat(800, 390, "Kartlar Değiştirildi", { color: "#a8dadc", fontSize: "28px" });
      }
    }
    return ok;
  }

  private onBuyItem(idxOrId: number | string): boolean {
    const ok = this.rules.buyItem(idxOrId);
    if (!ok) {
      this.showFloat(800, 340, "Satın alınamadı (Yetersiz altın veya dolu raf)!", { color: "#ff6b6b", fontSize: "26px" });
      return false;
    }
    this.infoMessage = "Eşya satın alındı ve masana eklendi!";
    this.renderAll();
    this.showFloat(800, 290, "Satın Alındı!", { color: "#ffd166", fontSize: "32px" });
    return true;
  }

  private onSellTalisman(idxOrId: number | string): boolean {
    const ok = this.rules.sellTalisman(idxOrId);
    if (!ok) return false;
    this.infoMessage = "Tılsım satıldı.";
    this.renderAll();
    this.showFloat(800, 140, "Tılsım Satıldı", { color: "#ffd166", fontSize: "26px" });
    return true;
  }

  private onRerollShop(): boolean {
    const ok = this.rules.rerollShop();
    if (!ok) {
      this.showFloat(800, 580, "Yenilemek için yeterli altın yok!", { color: "#ff6b6b", fontSize: "26px" });
      return false;
    }
    this.infoMessage = "Simya Pazarı ürünleri yenilendi!";
    this.renderAll();
    return true;
  }

  private onNextRound(): boolean {
    const ok = this.rules.nextRound();
    if (!ok) return false;
    this.clearFloats();
    this.infoMessage = `Tur ${this.rules.round} (${this.rules.title}) başladı! 1-${this.rules.maxSelectable()} kart seç, hedef: ${this.rules.target}`;
    this.renderAll();
    return true;
  }

  private onToggleHandsModal(): boolean {
    this.showingHandsModal = !this.showingHandsModal;
    renderHandsModal(this, this.modalLayer, this.rules, this.showingHandsModal, W, H, () => this.onToggleHandsModal());
    return this.showingHandsModal;
  }

  private restart(seed?: number): boolean {
    this.clearFloats();
    const s = Number.isInteger(seed) && (seed as number) >= 0 ? seed : Math.floor(Math.random() * 100000);
    return this.gate.leave(() => this.scene.restart({ seed: s }));
  }

  // ---------- Rendering ----------

  private renderAll(): void {
    this.uiLayer.removeAll(true);
    this.panelLayer.removeAll(true);

    const sidebarCb = {
      onToggleHandsModal: () => this.onToggleHandsModal(),
      onRestart: () => this.restart(),
      onSellTalisman: (idx: number) => this.onSellTalisman(idx),
      onInspectTalisman: (info: string) => {
        this.infoMessage = info;
        this.renderAll();
      },
    };

    renderSidebar(this, this.uiLayer, this.rules, sidebarCb);
    renderTalismanShelf(this, this.uiLayer, this.rules, this.infoMessage, sidebarCb);

    if (this.rules.phase === "playing") {
      this.handView.render(this.rules);
    } else {
      this.handView.clear();
      if (this.rules.phase === "shop") {
        renderShopTable(this, this.panelLayer, this.rules, {
          onBuyItem: (idx) => this.onBuyItem(idx),
          onRerollShop: () => this.onRerollShop(),
          onNextRound: () => this.onNextRound(),
          onRestart: () => this.restart(),
        });
      } else {
        renderEndScreen(this, this.panelLayer, this.rules, () => this.restart());
      }
    }

    renderHandsModal(this, this.modalLayer, this.rules, this.showingHandsModal, W, H, () => this.onToggleHandsModal());
  }
}
