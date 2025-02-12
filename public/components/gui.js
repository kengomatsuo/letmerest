import { pauseGame, resumeGame } from "./gameManager.js"


export function createGUI(scene) {
  
  // Create a fullscreen button
  let fullscreenButton = scene.add
    .text(20, 20, "🔳 Fullscreen", { fontSize: "20px", fill: "#fff" })
    .setInteractive()
    .on("pointerdown", () => {
      if (!scene.scale.isFullscreen) {
        scene.scale.startFullscreen();
        fullscreenButton.setText("❌ Exit Fullscreen");
      } else {
        scene.scale.stopFullscreen();
        fullscreenButton.setText("🔳 Fullscreen");
      }
    })
    .setScrollFactor(0);

  // Create a pause button
  let pauseButton = scene.add
    .text(20, 60, "⏸ Pause", { fontSize: "20px", fill: "#fff" })
    .setInteractive()
    .on("pointerdown", () => {
      if (scene.physics.world.isPaused) {
        resumeGame()
        pauseButton.setText("⏸ Pause");
      } else {
        pauseGame()
        pauseButton.setText("▶️ Resume");
      }
    })
    .setScrollFactor(0);

  // Hide the cursor
  scene.input.setDefaultCursor("none");
  // Create a crosshair sprite
  let crosshair = scene.add
    .image(0, 0, "crosshair")
    .setDepth(10)
    .setScale(0.5)
    .setScrollFactor(0);
  crosshair.setOrigin(0.5);
  // Update the crosshair position on pointer move
  scene.input.on("pointermove", (pointer) => {
    crosshair.setPosition(pointer.x, pointer.y);
  });
}
