class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  createUI() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title text
    this.titleText = this.add
      .text(centerX, centerY - 100, "Let Me Rest!", {
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    // Start Game button
    this.startButton = this.add
      .text(centerX, centerY, "Start Game", { fontSize: "32px", fill: "#0f0" })
      .setOrigin(0.5)
      .setInteractive();

    // Quit Game button
    this.quitButton = this.add
      .text(centerX, centerY + 60, "Quit Game", { fontSize: "32px", fill: "#f00" })
      .setOrigin(0.5)
      .setInteractive();

    // Start game when clicked
    this.startButton.on("pointerdown", () => {
      this.scene.stop("MainScene");
      this.scene.stop("GUI");
      this.scene.start("GUI");
      this.scene.start("MainScene");

      this.registry.events.emit("start-game");
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

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    this.titleText.setPosition(centerX, centerY - 100);
    this.startButton.setPosition(centerX, centerY);
    this.quitButton.setPosition(centerX, centerY + 60);
  }
}

export default MainMenu;
