import Projectile from "./Projectile.js";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = 100;
    this.shield = 0;
    this.setCollideWorldBounds(false);
    this.speed = 200;
    this.projectiles = scene.add.group();

    // Attack properties
    this.attackSpeed = 1; // Shots per second
    this.shootEvent = null;
    this.angle = 0; // Store the last cursor angle

    this.startShooting(); // Start auto-shooting

    // Input handling
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Touch control setup
    this.joystick = scene.input.activePointer;
    this.isTouching = false;

    scene.input.on("pointermove", (pointer) => {
      this.angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
    });

    scene.input.on("pointerdown", () => {
      this.isTouching = true;
    });

    scene.input.on("pointerup", () => {
      this.isTouching = false;
      this.setVelocity(0);
    });
  }

  move() {
    let moveX = 0;
    let moveY = 0;

    // Keyboard movement
    if (this.cursors.left.isDown || this.keys.A.isDown) moveX = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) moveX = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) moveY = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) moveY = 1;

    // Normalize diagonal movement
    if (moveX !== 0 || moveY !== 0) {
      const angle = Math.atan2(moveY, moveX);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    } else {
      this.setVelocity(0);
    }

    // Touch movement
    if (this.isTouching) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.joystick.worldX,
        this.joystick.worldY
      );
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    }
  }

  takeDamage(amount) {
    if (this.damageCooldown) return;

    this.health = Math.max(this.health - amount, 0);
    console.log(this.health);
    if (this.health == 0) {
      this.die();
    }

    this.damageCooldown = true;
    this.scene.time.delayedCall(100, () => {
      this.damageCooldown = false;
    });
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, 100);
  }

  die() {
    this.scene.registry.events.emit("game-over");
  }

  startShooting() {
    if (this.shootEvent) this.shootEvent.remove();

    this.shootEvent = this.scene.time.addEvent({
      delay: 1000 / this.attackSpeed,
      callback: () => this.shoot(),
      callbackScope: this,
      loop: true,
    });
  }

  shoot() {
    // Use last stored angle instead of pointer position
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      this.x + Math.cos(this.angle) * 100,
      this.y + Math.sin(this.angle) * 100
    );
    this.projectiles.add(projectile);
  }

  increaseAttackSpeed(amount) {
    this.attackSpeed = Math.min(this.attackSpeed + amount, 10);
    this.startShooting();
  }
}

export default Player;
