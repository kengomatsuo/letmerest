class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: false });
  }

  preload() {
    // Load assets
  }

  create() {
    this.background = this.add.graphics();
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  createUI() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;

    this.score = 0;
    this.player = null;

    window.addEventListener("blur", () => {
      if (this.scene.isActive("PauseMenu")) return;
      this.registry.events.emit("pause-game");
    });

    this.input.keyboard.on("keydown-ESC", () => {
      // If pausemenu scene is not active, start it
      if (!this.scene.isActive("PauseMenu")) {
        this.registry.events.emit("pause-game");
        this.sound.play("pauseIn");
      } else {
        this.registry.events.emit("resume-game");
        this.sound.play("pauseOut");
        this.scene.stop("PauseMenu");
      }
    });

    // Name display (Top-left)
    this.nameText = this.add.bitmapText(10, 10, "textFont", "Your name", -20);

    // Health bar background (red)
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0xffffff, 1);
    this.healthBarBg.fillRect(10, 40, 100, 15);

    // Health bar foreground (green)
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(10, 40, 100, 15);

    // Health text (next to health bar)
    this.healthText = this.add.bitmapText(115, 40, "textFont", "", -14);

    // FPS display (Top-left below health)
    this.fpsText = this.add.bitmapText(10, 70, "textFont", "", -20);

    // Timer (Top-center)
    this.timerText = this.add
      .bitmapText(centerX, 10, "textFont", "", -32)
      .setOrigin(0.5, 0);

    // Score display (Top-center below timer)
    this.scoreText = this.add
      .bitmapText(centerX, 40, "textFont", "", -20)
      .setOrigin(0.5, 0);

    // Listen for score updates
    this.registry.events.on("update-score", (value) => {
      this.score += value;
      if (value > 0) this.sound.play("point", { volume: 0.6 });
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // Listen for timer updates
    this.registry.events.on("update-timer", (time) => {
      const minutes = String(Math.floor(time / 60)).padStart(2, "0");
      const seconds = String(time % 60).padStart(2, "0");
      this.timerText.setText(`${minutes}:${seconds}`);
    });

    // Listen for game start
    this.registry.events.on("start-game", () => {
      this.score = 0;
    });

    // Game over event
    this.registry.events.on("game-over", () => {
      this.handleGameOver();
    });
  }

  handleGameOver() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Resize background
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // Clear health bar
    this.healthBar.clear();
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRect(10, 40, 0, 15);
    this.healthText.setText("0");

    // "Game Over" text (Centered)
    this.gameOverText = this.add
      .bitmapText(centerX, centerY - 70, "titleFont", "Game Over", -42)
      .setOrigin(0.5);

    // Back to Main Menu button (Centered)
    this.time.delayedCall(3300, () => {
      this.menuButton = this.add
        .bitmapText(centerX, centerY + 20, "textFont", "Back to Main Menu", -24)
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => {
          this.scene.stop("MainScene");
          this.scene.stop("GUI");
          this.scene.start("MainMenu");
        });
    });

    this.timerRunning = false; // Stop timer on game over
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;

    if (this.background) {
      this.background.clear();
      this.background.fillStyle(0x000000, 0.5);
      this.background.fillRect(0, 0, width, height);
    }

    // Reposition timer (Top-center)
    this.timerText.setPosition(centerX, 10);

    // If game over text exists, reposition it
    if (this.gameOverText) {
      this.gameOverText.setPosition(centerX, height / 2 - 70);
      this.menuButton.setPosition(centerX, height / 2 + 20);
    }
  }

  setPlayer(player) {
    this.player = player;
  }

  update() {
    const fps = this.sys.game.loop.actualFps.toFixed(1);
    this.fpsText.setText(`FPS: ${fps}`);

    if (this.player) {
      const stress = Math.min(this.player.stress, 100);
      const barWidth = (stress / 100) * 100;

      this.healthBar.clear();
      this.healthBar.fillStyle(0xff0000, 1);
      this.healthBar.fillRect(10, 40, barWidth, 15);

      this.healthText.setText(stress);
    }
  }
}

export default GUI;
