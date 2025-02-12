import { createGUI } from "./gui.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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

let background
let player
let cursors

function create() {
  // Create a repeating background
  background = this.add.tileSprite(0, 0, 2000, 2000, "background");
  player = this.physics.add.image(400, 300, "player");

  this.cameras.main.startFollow(player);

  // Add GUI elements
  createGUI(this); 

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
