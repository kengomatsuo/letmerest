/// <reference types="phaser" />
import { registerScene, registerTimer } from "./components/gameManager.js"
import { createGUI } from "./components/gui.js";

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
      fps: 30,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,

  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  fps: {
    target: 30,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("enemy", "assets/enemy.png");
  this.load.image("bullet", "assets/bullet.png");
  this.load.image("floor", "assets/background.jpg");
  this.load.image("crosshair", "assets/crosshair.png"); // Add a crosshair sprite
}

// Create
let floor;
let player;
let cursors;
let wasd;
let bullets;

function create() {
  registerScene(this);
  // Background
  floor = this.add.tileSprite(450, 300, 1920, 1080, "floor");
  floor.setScrollFactor(0);
  
  // Player
  player = this.physics.add.image(400, 300, "player");

  // Camera
  this.cameras.main.startFollow(player);

  // Projectiles
  bullets = this.physics.add.group({
    defaultKey: "bullet",
    maxSize: 50, // Increased bullet pool
    runChildUpdate: true,
  });

  let bulletTimer = this.time.addEvent({
    delay: 1000,
    callback: shootBullet,
    callbackScope: this,
    loop: true,
  });
  registerTimer(bulletTimer);

  // Add GUI elements
  createGUI(this);

  // Inputs
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });
}

function shootBullet() {
  const bullet = bullets.get(player.x, player.y);

  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;

    // Get world coordinates of the pointer relative to the camera
    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main);

    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      worldPoint.x,
      worldPoint.y
    );
    this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);

    bullet.setRotation(angle);

    // Schedule despawn after estimated travel time
    let bulletDespawnTimer = this.time.delayedCall(2000, () => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.enable = false;
    }); // Adjust based on bullet speed and max distance
    registerTimer(bulletDespawnTimer);
  }
}

const speed = 160;
const diagonalSpeed = speed * Math.sqrt(2) / 2;
// let scrollFactor = 30;

function update(time, delta) {
  // Prevent player movement when the game is paused
  if (this.physics.world.isPaused) return;

  
  let velocityX = 0;
  let velocityY = 0;

  if (cursors.left.isDown || wasd.left.isDown) {
    velocityX = -speed;
  } else if (cursors.right.isDown || wasd.right.isDown) {
    velocityX = speed;
  }

  if (cursors.up.isDown || wasd.up.isDown) {
    velocityY = -speed;
  } else if (cursors.down.isDown || wasd.down.isDown) {
    velocityY = speed;
  }

  // Normalize diagonal movement
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX = velocityX > 0 ? diagonalSpeed : -diagonalSpeed;
    velocityY = velocityY > 0 ? diagonalSpeed : -diagonalSpeed;
  }

  player.setVelocity(velocityX, velocityY);

  floor.tilePositionX += velocityX/75
  floor.tilePositionY += velocityY/75
}