class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  createUI() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Semi-transparent black background
    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // "Game Paused" text
    this.titleText = this.add
      .text(centerX, centerY - 70, "Game Paused", {
        fontFamily: "DePixelHalbfett",
        fontSize: "40px",
        resolution: 10
      })
      .setOrigin(0.5);

    // Resume button
    this.resumeButton = this.add
      .text(centerX, centerY, "Resume Game", {
        fontFamily: "DePixelKlein",
        fontSize: "24px",
        color: "#00ff00",
        resolution: 10
      })
      .setOrigin(0.5)
      .setInteractive();

    // Restart button
    this.restartButton = this.add
      .text(centerX, centerY + 50, "Restart", {
        fontFamily: "DePixelKlein",
        fontSize: "24px",
        color: "#ffff00",
        resolution: 10
      })
      .setOrigin(0.5)
      .setInteractive();

    // Quit button
    this.quitButton = this.add
      .text(centerX, centerY + 100, "Quit to Main Menu", {
        fontFamily: "DePixelKlein",
        fontSize: "24px",
        color: "#ff0000",
        resolution: 10
      })
      .setOrigin(0.5)
      .setInteractive();

    // Add interactivity
    this.resumeButton.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.6 });
      this.resumeGame();
    });
    this.input.keyboard.on("keydown-ESC", () => {
      this.sound.play("click", { volume: 0.6 });
      this.resumeGame();
    });

    this.restartButton.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.6 });

      this.registry.events.emit("start-game");
      this.restartGame();
    });

    this.quitButton.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.6 });
      this.quitToMainMenu();
    });
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    // Resize background
    this.background.clear();
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // Reposition UI elements
    this.titleText.setPosition(centerX, centerY - 70);
    this.resumeButton.setPosition(centerX, centerY);
    this.restartButton.setPosition(centerX, centerY + 50);
    this.quitButton.setPosition(centerX, centerY + 100);
  }

  resumeGame() {
    this.registry.events.emit("resume-game");
    this.scene.stop("PauseMenu");
  }

  restartGame() {
    this.scene.stop("MainScene");
    this.scene.start("MainScene");
    this.registry.events.emit("start-game");
  }

  quitToMainMenu() {
    console.log("It's me");
    this.registry.events.emit("main-menu");
    this.scene.stop("MainScene");
    this.scene.stop("GUI");
    this.scene.start("MainMenu");
  }
}

export default PauseMenu;
