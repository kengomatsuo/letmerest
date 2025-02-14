class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: true });
  }

  create() {
    this.score = 0;
    this.player = null;
    this.gameTime = 0; // Game time in seconds
    this.timerRunning = true; // Track timer state

    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.fpsText = this.add.text(10, 70, "FPS: 0", {
      fontSize: "20px",
      fill: "#0f0",
    });

    this.timerText = this.add.text(10, 100, "Time: 0s", {
      fontSize: "20px",
      fill: "#ff0",
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.registry.events.emit("pause-game");
    });

    // Health bar background (red)
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x800000, 1);
    this.healthBarBg.fillRect(10, 40, 100, 15);

    // Health bar foreground (green)
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(10, 40, 100, 15);

    // Health text
    this.healthText = this.add.text(115, 40, "100%", {
      fontSize: "14px",
      fill: "#fff",
    });

    // Listen for score updates
    this.registry.events.on("update-score", (value) => {
      this.score += value;
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // Game over event
    this.registry.events.on("game-over", () => {
      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 40, 0, 15);
      this.healthText.setText("0");

      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Game Over",
        { fontSize: "40px", fill: "#f00" }
      ).setOrigin(0.5);

      this.timerRunning = false; // Stop timer when game is over
    });

    // Pause game event
    this.registry.events.on("pause-game", () => {
      this.timerRunning = false;
    });

    // Resume game event
    this.registry.events.on("resume-game", () => {
      this.timerRunning = true;
    });

    // Timer that increments every second
    this.time.addEvent({
      delay: 1000, // 1 second
      callback: () => {
        if (this.timerRunning) {
          this.gameTime++;
          this.timerText.setText(`Time: ${this.gameTime}s`);
        }
      },
      loop: true,
    });
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
