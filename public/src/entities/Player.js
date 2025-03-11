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
    this.detectionRadius = 100;
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

    // Create the pointer sprite (attack direction indicator)
    this.pointerSprite = scene.add.sprite(0, 0, "pointer");
    this.pointerSprite.setVisible(false); // Change for when weapon sprite ready
    this.pointerSprite.setOrigin(0.5);

    // Create the player sprite
    this.playerSprite = scene.add.sprite(0, 0, "player");
    this.playerSprite.setOrigin(0.5, 0.9);

    // Create the radius indicator
    this.radiusGraphics = scene.add.graphics();
    this.radiusGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    this.radiusGraphics.strokeCircle(0, 0, this.detectionRadius);

    // Add both sprites to this container
    this.add(this.playerSprite);
    this.add(this.pointerSprite);
    this.add(this.radiusGraphics);

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
      this.firingAngle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        pointer.worldX,
        pointer.worldY
      );
      this.pointerSprite.setRotation(this.firingAngle);
    });
    this.scene.time.delayedCall(6000, () => {
      this.startShooting();
    });
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
  }

  move() {
    let moveX = 0;
    let moveY = 0;

    // Add joystick movement
    if (this.joystickActive) {
      moveX += this.joystickVector.x;
      moveY += this.joystickVector.y;
    } else {
      console.log('movement not detected')
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

  takeDamage(amount) {
    if (this.damageCooldown) return;

    this.stress = Math.min(this.stress + amount, 100);

    if (
      this.stress >= this.stressCap * 0.9 ||
      (this.stress >= this.stressCap * 0.75 && !this.highStress)
    ) {
      this.highStress = true;
      this.scene.sound.play("playerHighStress");
    }
    // Play hit sound
    if (this.stress < this.stressCap * 0.75) this.highStress = false;
    this.scene.sound.play("playerHit", {
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
      this.shootEvent.delay = this.getAttackDelay();
    }
  }

  playerMissed = (amount) => {
    // console.log("You are procrastinating!");
    this.procrastination = Math.min(
      this.procrastination + amount,
      this.procrastinationCap
    );
    this.updateShootingSpeed();
  };

  playerHitEnemy = (amount) => {
    this.procrastination = Math.max(this.procrastination - amount, 0);
    this.updateShootingSpeed();
  };

  shoot() {
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      this.firingAngle,
      this.playerMissed,
      this.playerHitEnemy
    );
    this.projectiles.add(projectile);
    this.scene.sound.play("shoot", {
      volume: 0.6,
      detune: Phaser.Math.Between(-200, 200),
    });
  }

  increaseAttackSpeed(amount) {
    this.attackSpeed = Math.min(this.attackSpeed + amount, 10);
    this.startShooting();
  }
}

export default Player;
