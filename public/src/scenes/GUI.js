class GUI extends Phaser.Scene {
  constructor() {
    super({ key: "GUI", active: false });
    this.lowHealthThreshold = 75; // Define a low health threshold
    this.isVibrating = false; // Track if the health bar is currently vibrating
  }

  playSfx(key) {
    this.scene.get("AudioManager").playSfx(key);
  }

  preload() {
    // Load assets
    this.load.atlas(
      "face",
      "assets/sprites/Expressions-sheet.png",
      "assets/sprites/Expressions.json"
    );
  }

  create() {
    this.background = this.add.graphics();
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);

    // Joystick
    this.input.on("pointerdown", this.createJoystick, this);
    this.input.on("pointermove", this.updateJoystick, this);
    this.input.on("pointerup", this.removeJoystick, this);
  }

  createUI() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;

    this.score = 0;
    this.player = null;

    window.addEventListener("blur", () => {
      if (this.scene.isActive("PauseMenu") || this.scene.isActive("Settings"))
        return;
      this.registry.events.emit("pause-game");
      this.playSfx("pauseIn");
    });

    this.input.keyboard.on("keydown-ESC", () => {
      if (this.player.stress === this.player.stressCap) {
        return; // Don't allow pause if player is dead
      }
      // Ensure PauseMenu is not triggered from Settings
      if (this.scene.isActive("Settings")) return;

      // If pausemenu scene is not active, start it
      if (!this.scene.isActive("PauseMenu")) {
        this.registry.events.emit("pause-game");
        this.playSfx("pauseIn");
      } else {
        this.registry.events.emit("resume-game");
        this.playSfx("pauseOut");
        this.scene.stop("PauseMenu");
      }
    });

    // Name display (Top-left)
    this.nameText = this.add.text(10, 10, "Press ESC to Pause", {
      fontFamily: "DePixelKlein",
      fontSize: "20px",
      resolution: 10,
    });

    console.log(this.textures.exists("face")); // should be true
    console.log(this.textures.get("face").getFrameNames());
    // Character face sprite (Top-left, next to name)
    this.faceSprite = this.add.sprite(10, 40, "face", "face_idle");
    this.faceSprite.setOrigin(0, 0);
    this.faceSprite.setScale(1);

    // Stress bar background (white)
    this.stressBarBg = this.add.graphics();
    this.stressBarBg.fillStyle(0xffffff, 1);
    this.stressBarBg.fillRect(75, 40, 130, 15);

    // Stress bar foreground (red)
    this.stressBar = this.add.graphics();
    this.stressBar.fillStyle(0x00ff00, 1);
    this.stressBar.fillRect(75, 40, 0, 15);

    // Stress text (next to stress bar)
    this.stressText = this.add.text(210, 40, "", {
      fontFamily: "DePixelKlein",
      fontSize: "14px",
      resolution: 10,
    });

    this.procrastinationBarBg = this.add.graphics();
    this.procrastinationBarBg.fillStyle(0xffffff, 1);
    this.procrastinationBarBg.fillRect(75, 60, 70, 10);

    this.procrastinationBar = this.add.graphics();
    this.procrastinationBar.fillStyle(0x0000ff, 1);
    this.procrastinationBar.fillRect(75, 60, 0, 10);

    // FPS display (Top-left below health)
    this.fpsText = this.add.text(10, 110, "", {
      fontFamily: "DePixelKlein",
      fontSize: "20px",
      resolution: 10,
    });

    // Timer (Top-center)
    this.timerText = this.add
      .text(centerX, 10, "00:00", {
        fontFamily: "DePixelKlein",
        fontSize: "32px",
        resolution: 10,
      })
      .setOrigin(0.5, 0);

    // Score display (Top-center below timer)
    this.scoreText = this.add
      .text(centerX, 40, "Score: 0", {
        fontFamily: "DePixelKlein",
        fontSize: "20px",
        resolution: 10,
      })
      .setOrigin(0.5, 0);

    function returnToPreviousFace() {
      if (this.player.stress === this.player.stressCap) {
        return;
      }
      if (this.player.panic) {
        this.faceSprite.setFrame("face_panic");
      } else if (this.player.burnout) {
        this.faceSprite.setFrame("face_burnt_out");
      } else if (
        this.player.procrastination >=
        this.player.procrastinationCap / 2
      ) {
        this.faceSprite.setFrame("face_procrastinating");
      } else {
        this.faceSprite.setFrame("face_idle");
      }
    }

    this.registry.events.on("player-hurt", () => {
      if (this.player.stress === this.player.stressCap) {
        return;
      }
      if (this.faceSprite) {
        this.faceSprite.setFrame("face_panic");
        this.time.delayedCall(500, () => {
          returnToPreviousFace.call(this);
        });
      }
    });

    this.registry.events.on("procrastinating", () => {
      if (this.player.stress === this.player.stressCap) {
        return;
      }
      if (
        this.faceSprite &&
        this.player.procrastination >= this.player.procrastinationCap / 2 &&
        this.player.burnout === false &&
        this.player.panic === false
      ) {
        this.faceSprite.setFrame("face_procrastinating");
        this.time.delayedCall(500, () => {
          returnToPreviousFace.call(this);
        });
      }
    });

    this.registry.events.on("procrastination-reduced", () => {
      if (this.player.stress === this.player.stressCap) {
        return;
      }
      if (
        this.faceSprite &&
        this.player.procrastination < this.player.procrastinationCap / 2
      ) {
        returnToPreviousFace.call(this);
      }
    });

    this.registry.events.on("panic", () => {
      if (this.player.stress === this.player.stressCap) {
        return;
      }
      if (this.faceSprite) {
        this.faceSprite.setFrame("face_panic");
        this.time.delayedCall(7000, () => {
          if (this.faceSprite.frame.name === "face_panic") {
            this.faceSprite.setFrame("face_burnt_out");
          }
        });
        this.time.delayedCall(17000, () => {
          if (this.faceSprite.frame.name === "face_burnt_out") {
            this.faceSprite.setFrame("face_idle");
          }
        });
      }
    });

    // Listen for score updates
    this.registry.events.on("update-score", (value) => {
      this.score += value;
      if (value > 0) this.playSfx("point");
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // Listen for timer updates
    this.registry.events.on("update-timer", (time) => {
      const minutes = String(Math.floor(time / 60)).padStart(2, "0");
      const seconds = String(time % 60).padStart(2, "0");
      this.timerText.setText(`${minutes}:${seconds}`);
    });

    // Listen for game start
    this.registry.events.on("start-game", () => {
      this.score = 0;
    });

    // Game over event
    this.registry.events.on("game-over", () => {
      if (this.faceSprite) {
        this.faceSprite.setFrame("face_hurt");
      }
      this.handleGameOver();
    });
  }

  createJoystick(pointer) {
    if (
      this.joystickActive ||
      this.scene.isActive("PauseMenu") ||
      this.scene.isActive("Settings")
    )
      return;
    this.joystickActive = true;
    if (this.player) this.player.setJoystickActive(true);

    const { x, y } = pointer;

    // Joystick base
    this.joystickBase = this.add.circle(x, y, 50, 0x888888, 0.5);

    // Joystick thumb
    this.joystickThumb = this.add.circle(x, y, 20, 0xffffff, 0.8);
  }

  updateJoystick(pointer) {
    if (!this.joystickActive) return;

    const { x, y } = pointer;
    const dx = x - this.joystickBase.x;
    const dy = y - this.joystickBase.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 40;

    let angle = Math.atan2(dy, dx);
    let magnitude = Math.min(distance / maxDistance, 1);

    this.player.joystickVector = {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude,
    };

    if (distance > maxDistance) {
      this.joystickThumb.setPosition(
        this.joystickBase.x + Math.cos(angle) * maxDistance,
        this.joystickBase.y + Math.sin(angle) * maxDistance
      );
    } else {
      this.joystickThumb.setPosition(x, y);
    }
  }

  removeJoystick() {
    if (!this.joystickActive) return;

    this.joystickActive = false;
    if (this.player) this.player.setJoystickActive(false);
    this.player.joystickVector = { x: 0, y: 0 };

    this.joystickBase.destroy();
    this.joystickThumb.destroy();
    this.joystickBase = null;
    this.joystickThumb = null;

    // Stop player movement
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
    }
  }

  handleGameOver() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Resize background
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // Clear health bar
    this.stressBar.clear();
    this.stressBar.fillStyle(0xff0000, 1);
    this.stressBar.fillRect(10, 40, this.player.stressCap, 15);
    this.stressText.setText("0");

    // "Game Over" text (Centered)
    this.gameOverText = this.add
      .text(centerX, centerY - 70, "Game Over", {
        fontFamily: "DePixelKlein",
        fontSize: "42px",
        resolution: 10,
      })
      .setOrigin(0.5);

    // Back to Main Menu button (Centered)
    this.time.delayedCall(3300, () => {
      this.menuButton = this.add
        .text(centerX, centerY + 20, "Back to Main Menu", {
          fontFamily: "DePixelKlein",
          fontSize: "24px",
          resolution: 10,
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => {
          this.scene.stop("MainScene");
          this.scene.stop("GUI");
          this.scene.start("MainMenu");
        });
    });

    this.timerRunning = false; // Stop timer on game over
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;

    if (this.gameOverText) {
      this.background.clear();
      this.background.fillStyle(0x000000, 0.5);
      this.background.fillRect(0, 0, width, height);
    }

    // Reposition timer (Top-center)
    this.timerText.setPosition(centerX, 10);

    // Reposition score (Top-center below timer)
    this.scoreText.setPosition(centerX, 40);

    // If game over text exists, reposition it
    if (this.gameOverText) {
      this.gameOverText.setPosition(centerX, height / 2 - 70);
      this.menuButton.setPosition(centerX, height / 2 + 20);
    }
  }

  setPlayer(player) {
    this.player = player;
  }

  update() {
    const fps = this.sys.game.loop.actualFps.toFixed(1);
    this.fpsText.setText(`FPS: ${fps}`);

    if (this.player) {
      const stress = this.player.stress;
      const procrastinationBarWidth = this.player.procrastination;
      const stressBarWidth = (stress / this.player.stressCap) * 130;

      this.stressBar.clear();
      this.stressBar.fillStyle(0xff0000, 1);
      this.stressBar.fillRect(75, 40, stressBarWidth, 15);

      this.procrastinationBar.clear();
      this.procrastinationBar.fillStyle(0x0000ff, 1);
      this.procrastinationBar.fillRect(75, 60, procrastinationBarWidth, 10);

      this.stressText.setText(stress);
    }
  }
}

export default GUI;
