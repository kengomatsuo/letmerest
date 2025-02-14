class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: false });
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

    this.score = 0;
    this.player = null;

    this.input.keyboard.on("keydown-ESC", () => {
      this.registry.events.emit("pause-game");
    });

    // Name display (Top-left)
    this.nameText = this.add.text(10, 10, "Your name", {
      fontSize: "20px",
      fill: "#fff",
    });

    // Health bar background (red)
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x800000, 1);
    this.healthBarBg.fillRect(10, 40, 100, 15);

    // Health bar foreground (green)
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(10, 40, 100, 15);

    // Health text (next to health bar)
    this.healthText = this.add.text(115, 40, "", {
      fontSize: "14px",
      fill: "#fff",
    });

    // FPS display (Top-left below health)
    this.fpsText = this.add.text(10, 70, "FPS:", {
      fontSize: "20px",
      fill: "#0f0",
    });

    // Timer (Top-center)
    this.timerText = this.add
      .text(centerX, 10, "00:00", {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5, 0);

    // Score display (Top-center below timer)
    this.scoreText = this.add
      .text(centerX, 40, "Score: 0", {
        fontSize: "20px",
        fill: "#fff",
      })
      .setOrigin(0.5, 0);

    // Listen for score updates
    this.registry.events.on("update-score", (value) => {
      this.score += value;
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

    // Clear health bar
    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(10, 40, 0, 15);
    this.healthText.setText("0");

    // "Game Over" text (Centered)
    this.gameOverText = this.add
      .text(centerX, centerY - 50, "Game Over", {
        fontSize: "40px",
        fill: "#f00",
      })
      .setOrigin(0.5);

    // Back to Main Menu button (Centered)
    this.menuButton = this.add
      .text(centerX, centerY + 20, "Back to Main Menu", {
        fontSize: "24px",
        fill: "#fff",
        backgroundColor: "#000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.stop("MainScene");
        this.scene.stop("GUI");
        this.scene.start("MainMenu");
      });

    this.timerRunning = false; // Stop timer on game over
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;

    // Reposition timer (Top-center)
    this.timerText.setPosition(centerX, 10);

    // If game over text exists, reposition it
    if (this.gameOverText) {
      this.gameOverText.setPosition(centerX, height / 2 - 50);
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
      const health = Math.max(this.player.health, 0);
      const barWidth = (health / 100) * 100;

      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 40, barWidth, 15);

      this.healthText.setText(health);
    }
  }
}

export default GUI;
