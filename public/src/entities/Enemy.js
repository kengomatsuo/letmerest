class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 100;
    this.health = 50;

    scene.physics.add.overlap(this, scene.player, (enemy, player) => {
      scene.registry.events.emit("update-health", -10);
    });
  }

  chasePlayer(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(this.health);
    if (this.health <= 0) {
      this.die();
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

    this.scene.time.delayedCall(500, () => {
      text.destroy(); // Remove text
      this.destroy(); // Remove enemy
    });
  }
}

export default Enemy;
