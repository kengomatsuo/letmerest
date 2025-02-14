class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 100;
    this.damage = 2;
    this.maxSpeed = 100;
    this.acceleration = 5;
    this.health = 50;
    this.stunned = false;

    scene.physics.add.overlap(this, scene.player, (enemy, player) => {
      player.takeDamage(this.damage);
    });
  }

  chasePlayer(player) {
    if (this.stunned) {
      this.speed = 0;
      return;
    }
    // Acceleration
    if (this.speed != this.maxSpeed)
      this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);

    this.scene.physics.moveToObject(this, player, this.speed);
  }

  takeDamage(amount, knockback) {
    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    }

    if (knockback) {
      this.stunned = true;
      this.setVelocity(-this.body.velocity.x, -this.body.velocity.y);
      // Add a short delay before allowing movement again
      this.scene.time.delayedCall(100, () => {
        this.stunned = false;
      });
    }
  }

  die() {
    const text = this.scene.add
      .text(this.x, this.y, "Done!", {
        fontSize: "16px",
        fill: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.setVisible(false); // Hide enemy
    this.body.enable = false; // Disable physics

    this.scene.time.delayedCall(500, () => {
      text.destroy(); // Remove text
      this.destroy(); // Remove enemy
    });
  }
}

export default Enemy;
