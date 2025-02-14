class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    // Semi-transparent black background
    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.5); // Black with 50% opacity
    this.background.fillRect(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height
    );

    // Show "Paused" text
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        "Game Paused",
        { fontSize: "40px", fill: "#fff" }
      )
      .setOrigin(0.5);

    // Resume button
    this.resumeButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Resume Game",
        { fontSize: "24px", fill: "#0f0" }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Restart button
    this.restartButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 50,
        "Restart",
        { fontSize: "24px", fill: "#ff0" }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Quit button
    this.quitButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        "Quit to Main Menu",
        { fontSize: "24px", fill: "#f00" }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Listen for ESC key to resume
    this.resumeButton.on("pointerdown", () => this.resumeGame());
    this.input.keyboard.on("keydown-ESC", () => this.resumeGame());

    // Restart game on button click
    this.restartButton.on("pointerdown", () => this.restartGame());

    // Quit game
    this.quitButton.on("pointerdown", () => this.quitToMainMenu());
  }

  resumeGame() {
    this.registry.events.emit("resume-game");
    this.scene.stop("PauseMenu");
  }

  restartGame() {
    this.scene.stop("MainScene");
    this.scene.start("MainScene");
    this.registry.events.emit("resume-game");
  }

  quitToMainMenu() {
    this.scene.stop("MainScene");
    this.scene.start("MainMenu"); // Ensure "MainMenu" exists
  }
}

export default PauseMenu;
