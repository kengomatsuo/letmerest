import Projectile from "./Projectile.js";

class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    // this.body = this.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(false);
    this.body.setSize(32, 32); // Adjust size as needed
    this.body.setOffset(-16, -16); // Center the body properly

    this.stress = 0;
    this.stressCap = 100;
    this.highStress = false;
    this.shield = 0;
    this.speed = 200;
    this.projectiles = scene.add.group();

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
    this.playerSprite.setOrigin(0.5);

    // Add both sprites to this container
    this.add(this.playerSprite);
    this.add(this.pointerSprite);

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

    this.startShooting();
  }

  defineAnimations(scene) {
    scene.anims.create({
      key: 'idle',
      frames: [
        { key: 'player', frame: 'Idle 0.aseprite' },
        { key: 'player', frame: 'Idle 1.aseprite' },
        { key: 'player', frame: 'Idle 2.aseprite' },
        { key: 'player', frame: 'Idle 1.aseprite' },
      ],
      frameRate: 5,
      repeat: -1,
    });

    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNames('player', {
        prefix: 'Run ',
        start: 0,
        end: 5,
        suffix: '.aseprite',
      }),
      frameRate: 10,
      repeat: -1,
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
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
      this.playerSprite.play('run', true);

      // Flip the sprite based on movement direction
      if (moveX < 0) {
        this.playerSprite.flipX = true;
      } else if (moveX > 0) {
        this.playerSprite.flipX = false;
      }
    } else {
      this.body.setVelocity(0);
      this.playerSprite.play('idle', true);
    }
  }

  takeDamage(amount) {
    if (this.damageCooldown) return;

    this.stress = Math.min(this.stress + amount, 100);

    if (this.stress >= this.stressCap * 0.9 || (this.stress >= this.stressCap * 0.75 && !this.highStress)) {
      this.highStress = true;
      this.scene.sound.play("playerHighStress");
    }
    // Play hit sound
    else {
      if (this.stress < this.stressCap * 0.75) this.highStress = false;
      this.scene.sound.play("playerHit", {detune: this.stress / this.stressCap * 1000});
    }

    if (this.stress === 100) {
      this.die();
    }

    this.damageCooldown = true;
    this.scene.time.delayedCall(300, () => {
      this.damageCooldown = false;
    });
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
      delay: 1000 / this.attackSpeed,
      callback: () => this.shoot(),
      callbackScope: this,
      loop: true,
    });
  }

  shoot() {
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      this.firingAngle
    );
    this.projectiles.add(projectile);
    this.scene.sound.play("shoot", { volume: 0.6, detune: Phaser.Math.Between(-200, 200) });
  }

  increaseAttackSpeed(amount) {
    this.attackSpeed = Math.min(this.attackSpeed + amount, 10);
    this.startShooting();
  }
}

export default Player;
