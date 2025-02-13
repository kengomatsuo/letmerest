class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: true });
  }

  create() {
    this.score = 0;
    this.health = 100;

    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.healthText = this.add.text(10, 40, "Health: 100", {
      fontSize: "20px",
      fill: "#f00",
    });

    this.fpsText = this.add.text(10, 70, "FPS: 0", {
      fontSize: "20px",
      fill: "#0f0",
    });

    // Listen for score updates
    this.registry.events.on("update-score", (value) => {
      this.score += value;
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // Listen for health updates
    this.registry.events.on("update-health", (value) => {
      this.health += value;
      this.healthText.setText(`Health: ${this.health}`);
    });
  }

  update() {
    const fps = this.sys.game.loop.actualFps.toFixed(1);
    this.fpsText.setText(`FPS: ${fps}`);
  }
}

export default GUI;
