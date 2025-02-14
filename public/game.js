import MainScene from "./src/scenes/MainScene.js";
import GUI from "./src/scenes/GUI.js";
import PauseMenu from "./src/scenes/PauseMenu.js"
import MainMenu from "./src/scenes/MainMenu.js"

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainMenu, MainScene, GUI, PauseMenu],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      fps: 60, // Set physics FPS limit
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    target: 60, // Set game FPS limit
    // forceSetTimeOut: true, // Force the use of setTimeout to cap FPS
  },
};

const game = new Phaser.Game(config);
