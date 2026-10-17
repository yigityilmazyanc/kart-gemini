import { captureErrors } from "@agi/kit";
import Phaser from "phaser";
import { GameScene, H, W } from "./scenes/GameScene";

captureErrors();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#090d1c",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: [GameScene],
});
