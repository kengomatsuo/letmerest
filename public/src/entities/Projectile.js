class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, angle, playerMissed, playerHitEnemy) {
    super(scene, x, y, "projectile").setScale(2);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 300;
    this.lifespan = 2000; 
    this.pierce = 1;
    this.damage = 20; 
    this.procrastinationDamage = 5;
    this.knockback = 200;

    this.hitEnemies = new Set(); 

    // Angle
    this.setRotation(angle);
    this.body.setCircle(15);
    
    // Calculate velocity to move toward target
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // Destroy projectile after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      if(this.hitEnemies.size === 0)
        playerMissed(this.procrastinationDamage);
      this.destroy();
    });

    // Handle collision with enemies
    scene.physics.add.overlap(this, scene.enemies, (projectile, enemy) => {
      if (!this.hitEnemies.has(enemy)) {
        playerHitEnemy(1);
        this.hitEnemies.add(enemy);
        enemy.takeDamage(this.damage, this.knockback); 
        if (this.pierce == 0) this.destroy(); 
        this.pierce--;
      }
    });
  }
}

export default Projectile;
