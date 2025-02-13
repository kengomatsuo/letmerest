class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, targetX, targetY) {
    super(scene, x, y, "projectile");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 300;
    this.lifespan = 2000; // 1 second before disappearing
    this.damage = 20; // Damage dealt on collision

    // Calculate velocity to move toward target
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // Destroy projectile after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      this.destroy();
    });

    // Handle collision with enemies
    scene.physics.add.overlap(this, scene.enemies, (projectile, enemy) => {
      enemy.takeDamage(this.damage); // Deal 20 damage
      projectile.destroy(); // Remove projectile on impact
    });
  }
}

export default Projectile;
