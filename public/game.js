import AudioManager from "./src/controllers/AudioManager.js";
import MainScene from "./src/scenes/MainScene.js";
import GUI from "./src/scenes/GUI.js";
import PauseMenu from "./src/scenes/PauseMenu.js";
import MainMenu from "./src/scenes/MainMenu.js";

const config = {

  type: Phaser.AUTO,
  width: 800,
  height: 600,
  render: {
    smoothPixelArt: true,
  },
  scene: [MainMenu, AudioManager, MainScene, GUI, PauseMenu],
  audio: {
    disableWebAudio: false, // Ensure WebAudio API is used
    noAudio: false, // Ensure audio is enabled
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3, // Prevent input issues
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      fps: 60, // Set physics FPS limit
    },
  },
  fps: {
    target: 60, // Set game FPS limit
    // forceSetTimeOut: true, // Force the use of setTimeout to cap FPS
  },
  autoPause: false, // Keep game running when tab is inactive
};

const game = new Phaser.Game(config);

this.load.setDefaultTextureFilter(Phaser.Textures.FilterMode.NEAREST);
