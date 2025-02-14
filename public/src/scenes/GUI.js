class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: false });
  }

  create() {
    this.score = 0;
    this.player = null;

    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.fpsText = this.add.text(10, 70, "FPS:", {
      fontSize: "20px",
      fill: "#0f0",
    });

    this.timerText = this.add
      .text(this.cameras.main.centerX, 10, "00:00", {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5, 0);

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
    this.healthText = this.add.text(115, 40, "", {
      fontSize: "14px",
      fill: "#fff",
    });

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

    // Listen for game start event
    this.registry.events.on("start-game", () => {
      this.score = 0;
      this.scoreText.setText("Score: 0");
      this.timerText.setText("00:00");
    });

    // Game over event
    this.registry.events.on("game-over", () => {
      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 40, 0, 15);
      this.healthText.setText("0");

      const gameOverText = this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY - 50,
          "Game Over",
          { fontSize: "40px", fill: "#f00" }
        )
        .setOrigin(0.5);

      const menuButton = this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY + 20,
          "Back to Main Menu",
          {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
          }
        )
        .setOrigin(0.5)
        .setInteractive()
        // .on("pointerover", () => menuButton.setStyle({ fill: "#ff0" })) // Hover effect
        // .on("pointerout", () => menuButton.setStyle({ fill: "#fff" }))
        .on("pointerdown", () => {
          // Destroy gameOverText and mainMenuButton
          gameOverText.destroy();
          menuButton.destroy();
          this.scene.stop("MainScene");
          this.scene.stop("GUI");
          this.scene.start("MainMenu");
        });

      this.timerRunning = false; // Stop timer when game is over
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
