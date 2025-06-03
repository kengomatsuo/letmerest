class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 100;
    this.damage = 8;
    this.maxSpeed = 100;
    this.acceleration = 5;
    this.health = 50;
    this.stunned = false;

    // Adjust the hitbox size and offset
    this.body.setSize(this.width * 0.7, this.height * 0.7); // Adjust the size as needed
    this.body.setOffset(this.width * 0.15, this.height * 0.20); // Adjust the offset as needed

    // Define the animation
    this.defineAnimations(scene);

    // Play the animation
    this.play("enemyFloat");

    scene.physics.add.overlap(this, scene.player, (enemy, player) => {
      player.takeDamage(this.damage);
    });

    console.log(scene.player.pointerHitbox);

    scene.physics.add.overlap(this, scene.player.pointerHitbox, (enemy, pointerHitbox) => {
      this.scene.registry.events.emit("panic")
    } );
  }

  defineAnimations(scene) {
    scene.anims.create({
      key: "enemyFloat",
      frames: scene.anims.generateFrameNames("enemy", {
        prefix: "FolderFloat ",
        start: 0,
        end: 13,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: -1,
    });

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
    // Use AudioManager's playSfx with detune
    if (this.scene.scene && this.scene.scene.get && this.scene.scene.get("AudioManager")) {
      this.scene.scene.get("AudioManager").playSfx("enemyHit", {
        detune: Phaser.Math.Between(-1000, 1000),
      });
    }
    this.health -= amount;

    // Show floating damage text in white
    this.showFloatingText(amount, "#ffffff");

    if (this.health <= 0) {
      this.die();
    } else {
      // Flash white effect
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(150, () => {
        this.clearTint();
      });

      if (knockback) {
        this.stunned = true;
        this.setVelocity(-this.body.velocity.x, -this.body.velocity.y);
        // Add a short delay before allowing movement again
        this.scene.time.delayedCall(100, () => {
          this.stunned = false;
        });
      }
    }
  }

  showFloatingText(amount, color = "#ffffff") {
    const text = this.scene.add.text(this.x, this.y - 40, `${amount > 0 ? "+" : ""}${amount}`, {
      fontSize: "28px",
      fontFamily: "DePixelKlein",
      fontStyle: "bold",
      color: color,
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1500,
      ease: "Cubic.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  die() {
    this.scene.registry.events.emit("update-score", 5);

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
