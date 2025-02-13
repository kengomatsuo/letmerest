class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: true });
  }

  create() {
    this.score = 0;
    this.player = null;

    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.fpsText = this.add.text(10, 70, "FPS: 0", {
      fontSize: "20px",
      fill: "#0f0",
    });

    // Health bar background (red)
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x800000, 1); // Dark red
    this.healthBarBg.fillRect(10, 40, 100, 15); // (x, y, width, height)

    // Health bar foreground (green)
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1); // Green
    this.healthBar.fillRect(10, 40, 100, 15); // Initial full health bar

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

    this.registry.events.on("game-over", () => {
      this.scene.pause();
      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 40, 0, 15);
      this.healthText.setText("0");
      this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Game Over", {
        fontSize: "40px",
        fill: "#f00",
      }).setOrigin(0.5);
    })
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

      // Clear old health bar
      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 40, barWidth, 15);

      // Update health text
      this.healthText.setText(health);
    }
  }
}

export default GUI;
