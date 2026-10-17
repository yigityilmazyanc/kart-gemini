import { captureErrors } from "@agi/kit";
import Phaser from "phaser";
import { GameScene, H, W } from "./scenes/GameScene";

captureErrors();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b1030",
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: [GameScene],
});
