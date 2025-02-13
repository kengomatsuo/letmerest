import Projectile from "./Projectile.js";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.speed = 200;
    this.projectiles = scene.add.group();

    // Attack properties
    this.attackSpeed = 1; // Shots per second (Default: 1 shot per second)
    this.shootEvent = null; // Store the shooting timer

    // Start automatic shooting
    this.startShooting();

    // Input handling
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  move() {
    this.setVelocity(0);

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.setVelocityX(this.speed);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.setVelocityY(this.speed);
    }
  }

  startShooting() {
    if (this.shootEvent) this.shootEvent.remove(); // Remove previous timer if it exists

    this.shootEvent = this.scene.time.addEvent({
      delay: 1000 / this.attackSpeed, // Convert shots per second to milliseconds per shot
      callback: () => this.shoot(),
      callbackScope: this,
      loop: true,
    });
  }

  shoot() {
    const pointer = this.scene.input.activePointer; // Get cursor position
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      pointer.worldX,
      pointer.worldY
    );
    this.projectiles.add(projectile);
  }

  increaseAttackSpeed(amount) {
    this.attackSpeed += amount; // Increase shots per second
    this.attackSpeed = Math.min(this.attackSpeed, 10); // Cap at 10 shots per second
    this.startShooting(); // Restart the shooting loop with new speed
  }
}

export default Player;
