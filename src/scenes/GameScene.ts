import { exposeHook } from "@agi/kit";
import { FONT, SceneGate, coverImage, floatText, loadManifest, makeButton, moveTo, urlParams } from "@agi/kit/phaser";
import Phaser from "phaser";
import manifest from "../../assets/manifest.json";
import { StarGame } from "../logic/game";
import { type Kind, type Spawn, speedAt } from "../logic/spawn";

export const W = 720;
export const H = 1280;

const BASKET_Y = 1110;
const BASKET_HALF = 90;
/** Basket speed toward its target, px/s. */
const BASKET_SPEED = 1400;
/** Distance of one left()/right() step, px. */
const STEP = 140;
const SPAWN_Y = -50;

interface Item {
  kind: Kind;
  sprite: Phaser.Physics.Arcade.Image;
}

export class GameScene extends Phaser.Scene {
  private rules!: StarGame;
  private gate = new SceneGate();
  private items = new Set<Item>();
  /** Invisible physics body: moves only inside the fixed step. */
  private basket!: Phaser.Physics.Arcade.Image;
  /** What the player sees; follows the body in x, and only this one gets the real-clock "caught" tween. */
  private basketView!: Phaser.GameObjects.Image;
  private itemGroup!: Phaser.Physics.Arcade.Group;
  private targetX = W / 2;
  /** `?lane=0..100` puts every spawn on one vertical line (test setups). */
  private lane?: number;
  private scoreText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];

  constructor() {
    super("game");
  }

  /** Every asset in assets/manifest.json is loaded under its id (built by: npm run assets -- <game>). */
  preload(): void {
    loadManifest(this, manifest);
  }

  create(data: { seed?: number } = {}): void {
    const q = urlParams();
    this.gate.reset();
    // `?manual`: no real-time frames at all, the game only moves through advance() (exact, repeatable numbers in play-check)
    if (q.has("manual")) this.game.loop.sleep();
    this.items.clear();
    this.hearts = [];
    this.targetX = W / 2;
    this.lane = q.has("lane") ? q.int("lane", 50, 0, 100) / 100 : undefined;
    this.rules = new StarGame(data.seed ?? q.int("seed", Date.now() % 100000), {
      lives: q.int("lives", 3, 1, 9),
      bombChance: q.has("bombs") ? q.int("bombs", 25, 0, 100) / 100 : undefined,
    });

    coverImage(this, W / 2, H / 2, "bg", W, H);
    this.basket = this.physics.add.image(W / 2, BASKET_Y, "basket").setImmovable(true).setVisible(false);
    this.basketView = this.add.image(W / 2, BASKET_Y, "basket").setDepth(10);
    (this.basket.body as Phaser.Physics.Arcade.Body).setSize(150, 30).setOffset(15, 8);
    this.drawHud();

    this.itemGroup = this.physics.add.group();
    this.physics.add.overlap(this.basket, this.itemGroup, (_b, o) => this.onCatch(o as Phaser.Physics.Arcade.Image));
    // The world steps at a fixed 60 Hz whatever the display does: all game time and movement run from here,
    // so the same seed plays out the same way on every device (and under advance()).
    this.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, (dt: number) => this.step(dt * 1000));

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.moveBasket(p.x));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => p.isDown && this.moveBasket(p.x));
    this.input.keyboard?.on("keydown-LEFT", () => this.left());
    this.input.keyboard?.on("keydown-A", () => this.left());
    this.input.keyboard?.on("keydown-RIGHT", () => this.right());
    this.input.keyboard?.on("keydown-D", () => this.right());

    const hint = this.add.text(W / 2, 960, "Sepeti sürükle", { fontFamily: FONT, fontSize: "30px", color: "#ffffff" }).setOrigin(0.5).setAlpha(0.7).setDepth(20);
    this.tweens.add({ targets: hint, alpha: 0, delay: 2500, duration: 600 });

    exposeHook(() => this.state(), {
      moveTo: this.gate.guard((x: number) => this.moveBasket(x)),
      left: this.gate.guard(() => this.left()),
      right: this.gate.guard(() => this.right()),
      restart: (seed?: number) => this.restart(seed),
    }, this.game);
  }

  // ---------- state ----------

  /** Small text-friendly snapshot for agents: the 10 lowest objects are the ones that matter. */
  private state() {
    const objects = [...this.items]
      .map((i) => ({ kind: i.kind, x: Math.round(i.sprite.x), y: Math.round(i.sprite.y) }))
      .sort((a, b) => b.y - a.y)
      .slice(0, 10);
    return {
      seed: this.rules.seed,
      phase: this.rules.phase,
      score: this.rules.score,
      lives: this.rules.lives,
      speed: Math.round(this.rules.speed),
      basketX: Math.round(this.basket.x),
      elapsed: Math.round(this.rules.elapsed),
      objects,
    };
  }

  // ---------- actions (touch, keyboard and agent hook all come through here) ----------

  /** Send the basket toward x (clamped to the screen). False when the round is over, x is not a number, or the scene is leaving. */
  private moveBasket(x: number): boolean {
    if (!this.gate.open || this.rules.phase !== "playing" || !Number.isFinite(x)) return false;
    this.targetX = Math.min(Math.max(x, BASKET_HALF), W - BASKET_HALF);
    return true;
  }

  private left(): boolean {
    return this.moveBasket(this.targetX - STEP);
  }

  private right(): boolean {
    return this.moveBasket(this.targetX + STEP);
  }

  /** Start a new round; with a seed it replays that exact round. */
  private restart(seed?: number): boolean {
    const s = Number.isInteger(seed) && (seed as number) >= 0 ? seed : undefined;
    return this.gate.leave(() => this.scene.restart({ seed: s }));
  }

  // ---------- game loop ----------

  /** One fixed physics step of `ms`: move the basket, spawn what is due, drop what left the screen. */
  private step(ms: number): void {
    if (this.rules.phase !== "playing") return;
    const dx = this.targetX - this.basket.x;
    const reach = (BASKET_SPEED * ms) / 1000;
    this.basket.x += Math.abs(dx) <= reach ? dx : Math.sign(dx) * reach;
    this.basketView.x = this.basket.x;
    for (const s of this.rules.tick(ms)) this.spawn(s);
    for (const item of [...this.items]) {
      if (item.sprite.y > H + 60) this.remove(item);
    }
  }

  private spawn(s: Spawn): void {
    const sprite: Phaser.Physics.Arcade.Image = this.itemGroup.create((this.lane ?? s.x) * W, SPAWN_Y, s.kind);
    sprite.setDepth(5).setVelocityY(speedAt(s.at));
    sprite.body?.setCircle(26, 10, 10);
    this.items.add({ kind: s.kind, sprite });
  }

  private remove(item: Item): void {
    this.items.delete(item);
    item.sprite.destroy();
  }

  private onCatch(sprite: Phaser.Physics.Arcade.Image): void {
    const item = [...this.items].find((i) => i.sprite === sprite);
    if (!item || this.rules.phase !== "playing") return;
    const { x, y } = sprite;
    this.remove(item);
    moveTo(this, this.basketView, { y: BASKET_Y + 12, duration: 70, yoyo: true });
    if (item.kind === "star") {
      this.rules.catchStar();
      floatText(this, x, y - 40, "+1", { color: "#ffd166" });
    } else {
      this.rules.catchBomb();
      floatText(this, x, y - 40, "-1 can", { color: "#ff6b6b" }, { rise: -60 });
      this.cameras.main.shake(180, 0.012);
    }
    this.refreshHud();
    if (this.rules.lives === 0) this.showGameOver();
  }

  // ---------- drawing ----------

  private drawHud(): void {
    this.scoreText = this.add.text(30, 28, "", { fontFamily: FONT, fontSize: "48px", color: "#ffffff", fontStyle: "bold", stroke: "#0d0a1a", strokeThickness: 6 }).setDepth(20);
    for (let i = 0; i < this.rules.lives; i++) {
      this.hearts.push(this.add.image(W - 50 - i * 58, 56, "heart").setDepth(20));
    }
    this.refreshHud();
  }

  private refreshHud(): void {
    this.scoreText.setText(`Puan ${this.rules.score}`);
    this.hearts.forEach((h, i) => h.setAlpha(i < this.rules.lives ? 1 : 0.2));
  }

  private showGameOver(): void {
    this.physics.pause();
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(50);
    this.add.text(W / 2, 480, "Oyun Bitti", { fontFamily: FONT, fontSize: "76px", color: "#ffffff", fontStyle: "bold", stroke: "#0d0a1a", strokeThickness: 8 }).setOrigin(0.5).setDepth(51);
    this.add.text(W / 2, 590, `Puan ${this.rules.score}`, { fontFamily: FONT, fontSize: "52px", color: "#ffd166", fontStyle: "bold" }).setOrigin(0.5).setDepth(51);
    makeButton(this, W / 2, 740, "Tekrar", 0x1b998b, () => this.restart(), 280, 80).setDepth(51);
  }
}
