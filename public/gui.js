export function createGUI(scene) {
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
}