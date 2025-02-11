const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("enemy", "assets/enemy.png");
  this.load.image("bullet", "assets/bullet.png");
  this.load.image("background", "assets/background.jpg");
}

function create() {
  // Set world size larger than screen

  // Create a repeating background
  background = this.add.tileSprite(0, 0, 800, 600, "background");

  player = this.physics.add.image(400, 300, "player");

  this.cameras.main.startFollow(player);

  // Fullscreen button
  let fullscreenButton = this.add
    .text(20, 20, "🔳 Fullscreen", { fontSize: "20px", fill: "#fff" })
    .setInteractive()
    .on("pointerdown", () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
        fullscreenButton.setText("❌ Exit Fullscreen");
      } else {
        this.scale.stopFullscreen();
        fullscreenButton.setText("🔳 Fullscreen");
      }
    }).setScrollFactor(0)

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  } else {
    player.setVelocityY(0);
  }
}
