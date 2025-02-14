class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    // Title text
    this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.centerY - 100, 
      "Let Me Rest!", 
      { fontSize: "48px", fill: "#fff" }
    ).setOrigin(0.5);

    // Start Game button
    this.startButton = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.centerY, 
      "Start Game", 
      { fontSize: "32px", fill: "#0f0" }
    ).setOrigin(0.5).setInteractive();

    // Quit Game button
    this.quitButton = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.centerY + 60, 
      "Quit Game", 
      { fontSize: "32px", fill: "#f00" }
    ).setOrigin(0.5).setInteractive();

    // Start game when clicked
    this.startButton.on("pointerdown", () => {
      this.scene.start("MainScene");
    });

    // Quit game (only works in Electron or native app)
    this.quitButton.on("pointerdown", () => {
      if (navigator.userAgent.includes("Electron")) {
        window.close();
      } else {
        alert("Quit functionality only works in a native app!");
      }
    });
  }
}

export default MainMenu;
