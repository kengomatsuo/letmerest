class Settings extends Phaser.Scene {
  constructor() {
    super({ key: "Settings" });
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title text
    this.add
      .text(centerX, centerY - 100, "Settings", {
        fontFamily: "DePixelHalbfett",
        fontSize: "48px",
        resolution: 10
      })
      .setOrigin(0.5);

    // Back button
    this.backButton = this.add
      .text(centerX, centerY + 100, "Back", {
        fontFamily: "DePixelKlein",
        fontSize: "32px",
        resolution: 10
      })
      .setTintFill(0xff0000)
      .setOrigin(0.5)
      .setInteractive();

    // Navigate back to MainMenu
    this.backButton.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.6 });
      this.scene.start("MainMenu");
    });
  }
}

export default Settings;
