import Projectile from "./Projectile.js";

class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    // this.body = this.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(32, 32); // Adjust size as needed
    this.body.setOffset(-16, -16); // Center the body properly

    this.stress = 0;
    this.stressCap = 100;
    this.procrastination = 0;
    this.procrastinationCap = 70;
    this.highStress = false;

    this.panic = false;
    this.panicCooldown = 0;
    this.burnout = false;

    this.detectionRadius = 50;
    this.shield = 0;
    this.speed = 200;
    this.projectiles = scene.add.group();

    this.joystickActive = false;
    this.joystickVector = { x: 0, y: 0 }; // Initialize joystick vector

    this.setJoystickActive = (active) => {
      this.joystickActive = active;
    };

    // Attack properties
    this.attackSpeed = 1; // Shots per second
    this.shootEvent = null;
    this.firingAngle = 0; // Store the last cursor angle

    // Create pointer sprite
    this.pointerSprite = scene.add.sprite(0, 0, "pointer");
    this.pointerSprite.setVisible(false);

    // Create circular hitbox using an invisible physics sprite
    this.pointerHitbox = scene.physics.add.sprite(
      this.x - 50,
      this.y - 50,
      "circleHitbox"
    );
    this.pointerHitbox.body.moves = false; // Prevent physics from moving it
    this.scene.physics.add.existing(this.pointerHitbox);
    this.pointerHitbox.setOrigin(0.5, 0.5); // Center the hitbox
    this.pointerHitbox.setCircle(this.detectionRadius); // Makes the physics body behave like a circle
    this.pointerHitbox.setVisible(false); // Hide if it's just for collisions
    this.pointerHitbox.body.enable = false;

    // Sync hitbox with pointer movement
    scene.events.on("update", () => {
      this.pointerHitbox.setPosition(
        this.x - this.detectionRadius / 1.5,
        this.y - this.detectionRadius / 1.5
      );
    });

    // Create the player sprite
    this.playerSprite = scene.add.sprite(0, 0, "player");
    this.playerSprite.setOrigin(0.5, 0.9);

    // Create the aura sprite (initially invisible)
    this.auraSprite = scene.add.sprite(0, 0, "aura");
    this.auraSprite.tint = 0x500000;
    this.auraSprite.setOrigin(0.5, 0.9);
    this.auraSprite.setVisible(false);

    // Create the radius indicator
    this.radiusGraphics = scene.add.graphics();
    this.radiusGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    this.radiusGraphics.strokeCircle(0, 0, this.detectionRadius);
    this.radiusGraphics.setVisible(false);

    // Add both sprites to this container
    this.add(this.radiusGraphics);      // Add radius indicator first (bottom-most)
    this.add(this.auraSprite);          // Then aura
    this.add(this.playerSprite);        // Then player
    this.add(this.pointerSprite);       // Then pointer

    // Define animations
    this.defineAnimations(scene);

    // Keyboard Input Handling
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

    scene.input.on("pointermove", (pointer) => {
      if (!this.joystickActive) {
        this.firingAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          pointer.worldX,
          pointer.worldY
        );
        this.pointerSprite.setRotation(this.firingAngle);
      }
    });

    this.scene.time.delayedCall(6000, () => {
      this.pointerHitbox.body.enable = true;
      this.radiusGraphics.setVisible(true);
      this.startShooting();
    });

    this.updateFiringAngle = () => {
      if (this.joystickActive) {
        this.firingAngle = Phaser.Math.Angle.Between(
          0,
          0,
          this.joystickVector.x,
          this.joystickVector.y
        );
        this.pointerSprite.setRotation(this.firingAngle);
      }
    };

    // on register event panic increase attack speed by 3x and set procrastination to 0
    this.scene.registry.events.on("panic", () => {
      this.playSfx("panic");
      this.panic = true;
      this.attackSpeed = 4;
      this.procrastination = 0;
      this.updateShootingSpeed();
      this.panicCooldown = 60;

      // Show and play aura animation
      this.auraSprite.setVisible(true);
      this.auraSprite.setScale(5); // Scale the aura
      this.auraSprite.setAlpha(0.7); // Set aura opacity to 70%
      this.auraSprite.play("aura-loop");

      // disable hitbox collision
      this.pointerHitbox.body.enable = false;
      this.radiusGraphics.setVisible(false);

      // Prevent stacking: clear any existing panicCooldownEvent
      if (this.panicCooldownEvent) {
        this.panicCooldownEvent.remove();
      }
      this.panicCooldownEvent = this.scene.time.addEvent({
        delay: 1000, // 1 second
        callback: () => {
          if (this.panicCooldown > 0) {
        this.panicCooldown--;
        console.log(`Panic Cooldown: ${this.panicCooldown}`);
          }
          if (this.panicCooldown === 0) {
        this.pointerHitbox.body.enable = true;
        // Stop the event once cooldown is done
        if (this.panicCooldownEvent) {
          this.panicCooldownEvent.remove();
          this.panicCooldownEvent = null;
        }
          }
        },
        callbackScope: this,
        loop: true,
      });

      // burnt out
      this.scene.time.delayedCall(7000, () => {
        this.panic = false;
        this.attackSpeed = 1;

        // Hide aura animation
        this.auraSprite.setVisible(false);
        this.auraSprite.stop();

        // burnout
        this.burnout = true;
        this.playSfx("burnout")
        this.updateShootingSpeed();
      });

      this.scene.time.delayedCall(17000, () => {
        this.burnout = false;
        this.updateShootingSpeed();
      });
    });

    // Call updateFiringAngle in the update method or wherever appropriate
    this.scene.events.on("update", this.updateFiringAngle, this);

    this.movementPaused = false;

    // Listen for pause-game and resume-game events
    this.scene.registry.events.on("pause-game", () => {
      this.movementPaused = true;
      this.body.setVelocity(0);
      this.playerSprite.play("idle", true);
    });

    this.scene.registry.events.on("resume-game", () => {
      this.movementPaused = false;
    });

    // Update movement logic
    this.scene.events.on("update", () => {
      if (!this.movementPaused) {
        this.move();
      }
    });
  }

  playSfx(key, options = {}) {
    this.scene.scene.get("AudioManager").playSfx(key, options);
  }

  defineAnimations(scene) {
    scene.anims.create({
      key: "idle",
      frames: [
        { key: "player", frame: "Idle 0.aseprite" },
        { key: "player", frame: "Idle 1.aseprite" },
        { key: "player", frame: "Idle 2.aseprite" },
        { key: "player", frame: "Idle 2.aseprite" },
        { key: "player", frame: "Idle 1.aseprite" },
        { key: "player", frame: "Idle 0.aseprite" },
      ],
      frameRate: 5,
      repeat: -1,
    });

    scene.anims.create({
      key: "run",
      frames: scene.anims.generateFrameNames("player", {
        prefix: "Run ",
        start: 0,
        end: 5,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Define aura animation
    scene.anims.create({
      key: "aura-loop",
      frames: [
        { key: "aura", frame: "aura1" },
        { key: "aura", frame: "aura2" },
        { key: "aura", frame: "aura3" },
        { key: "aura", frame: "aura4" },
        { key: "aura", frame: "aura5" },
        { key: "aura", frame: "aura6" },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }

  move() {
    if (this.movementPaused) return;
    let moveX = 0;
    let moveY = 0;

    // Add joystick movement
    if (this.joystickActive) {
      moveX += this.joystickVector.x;
      moveY += this.joystickVector.y;
    } else {
      // Keyboard movement
      if (this.cursors.left.isDown || this.keys.A.isDown) moveX = -1;
      if (this.cursors.right.isDown || this.keys.D.isDown) moveX = 1;
      if (this.cursors.up.isDown || this.keys.W.isDown) moveY = -1;
      if (this.cursors.down.isDown || this.keys.S.isDown) moveY = 1;

      // Handle cases where both left and right keys are pressed
      if (
        (this.cursors.left.isDown || this.keys.A.isDown) &&
        (this.cursors.right.isDown || this.keys.D.isDown)
      ) {
        moveX = 0;
      }

      // Handle cases where both up and down keys are pressed
      if (
        (this.cursors.up.isDown || this.keys.W.isDown) &&
        (this.cursors.down.isDown || this.keys.S.isDown)
      ) {
        moveY = 0;
      }
    }

    // Normalize diagonal movement
    if (moveX !== 0 || moveY !== 0) {
      const angle = Math.atan2(moveY, moveX);
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
      this.playerSprite.play("run", true);

      // Flip the sprite based on movement direction
      if (moveX < 0) {
        this.playerSprite.flipX = true;
      } else if (moveX > 0) {
        this.playerSprite.flipX = false;
      }
    } else {
      this.body.setVelocity(0);
      this.playerSprite.play("idle", true);
    }
  }

  showFloatingText(amount, color = "#ff0000") {
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

  takeDamage(amount) {
    if (this.damageCooldown) return;
    this.scene.registry.events.emit("player-hurt", amount);
    this.stress = Math.min(this.stress + amount, 100);

    // Show floating damage text in red
    this.showFloatingText(-amount, "#ff0000");

    if (
      this.stress >= this.stressCap * 0.9 ||
      (this.stress >= this.stressCap * 0.75 && !this.highStress)
    ) {
      this.highStress = true;
      this.playSfx("playerHighStress");
    }
    // Play hit sound
    if (this.stress < this.stressCap * 0.75) this.highStress = false;
    this.playSfx("playerHit", {
      detune: (this.stress / this.stressCap) * 1000,
    });

    if (this.stress === 100) {
      this.die();
    } else {
      this.playerSprite.setTintFill(0xff0000);
      this.scene.time.delayedCall(150, () => {
        this.playerSprite.clearTint();
      });

      this.damageCooldown = true;
      this.scene.time.delayedCall(300, () => {
        this.damageCooldown = false;
      });
    }
  }

  heal(amount) {
    this.stress = Math.max(this.stress - amount, 0);
    // Show floating heal text in green
    this.showFloatingText(amount, "#00ff00");
  }

  die() {
    this.scene.registry.events.emit("game-over");

    // Remove pointer movement event
    this.scene.input.off("pointermove");
  }

  startShooting() {
    if (this.shootEvent) this.shootEvent.remove();

    this.shootEvent = this.scene.time.addEvent({
      delay:
        (1000 / this.attackSpeed) *
        (1 - this.procrastination / this.procrastinationCap),
      callback: () => this.shoot(),
      callbackScope: this,
      loop: true,
    });
  }

  getAttackDelay() {
    const procrastinationFactor =
      1 - this.procrastination / this.procrastinationCap; // Ranges from 1 to 0.3
    return 1000 / (this.attackSpeed * procrastinationFactor);
  }

  updateShootingSpeed() {
    if (this.shootEvent) {
      this.shootEvent.delay = this.getAttackDelay() * (this.burnout ? 2 : 1);
    }
  }

  playerMissed = (amount) => {
    this.procrastination = Math.min(
      this.procrastination + amount,
      this.procrastinationCap
    );
    this.updateShootingSpeed();
    this.scene.registry.events.emit("procrastinating", this.procrastination);
  };

  playerHitEnemy = (amount) => {
    this.procrastination = Math.max(this.procrastination - amount, 0);
    this.updateShootingSpeed();
    this.scene.registry.events.emit("procrastination-reduced", this.procrastination);
  };

  shoot() {
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      this.firingAngle,
      this.panic,
      this.playerMissed,
      this.playerHitEnemy
    );
    this.projectiles.add(projectile);
    this.playSfx("shoot", {
      detune: Phaser.Math.Between(-200, 200),
    });
  }

  increaseAttackSpeed(amount) {
    this.attackSpeed = Math.min(this.attackSpeed + amount, 10);
    this.startShooting();
  }
}

export default Player;
