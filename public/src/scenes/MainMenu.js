class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
    this.isMusicPlaying = true;
  }

  preload() {
    this.load.bitmapFont(
      "titleFont",
      "assets/fonts/DePixelHalbfett_0.png",
      "assets/fonts/DePixelHalbfett.fnt"
    );
    this.load.bitmapFont(
      "textFont",
      "assets/fonts/DePixelKlein_0.png",
      "assets/fonts/DePixelKlein.fnt"
    );
  }

  create() {
    if (!this.scene.isActive("AudioManager")) {
      this.scene.launch("AudioManager");
    }

    this.audioManager = this.scene.get("AudioManager"); // Get AudioManager scene
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  createUI() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title text
    this.titleText = this.add
      .text(centerX, centerY - 100, "Let Me Rest!", {
        fontFamily: "DePixelHalbfett",
        fontSize: "48px",
        resolution: 10
      })
      .setOrigin(0.5);

    if (!this.audioManager.currentMusic) {
      this.continueText = this.add
        .text(
          centerX,
          centerY + 60,
          "Click anywhere to continue", {
            fontFamily: "DePixelKlein",
            fontSize: "32px",
            resolution: 10
          }
        )
        .setAlpha(0.8)
        .setOrigin(0.5);
      // Listener for clicking anywhere to continue
      this.input.once("pointerdown", () => {
        this.mainSettings();
      });
    } else this.mainSettings();
  }

  mainSettings() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    if (this.audioManager && this.continueText) {
      this.continueText.destroy();
      this.registry.events.emit("main-menu");

      // Speaker button
      this.speakerButton = this.add
        .text(
          centerX,
          centerY,
          this.isMusicPlaying ? "Sound: on" : "Sound: off",
          {
            fontFamily: "DePixelKlein",
            fontSize: "32px",
            resolution: 10
          }
        )
        .setOrigin(0.5)
        .setInteractive();

      // Start Game button
      this.startButton = this.add
        .text(centerX, centerY + 60, "Start Game", {
          fontFamily: "DePixelKlein",
          fontSize: "32px",
          resolution: 10
        })
        .setTintFill(0x00ff00)
        .setOrigin(0.5)
        .setInteractive();

      // Quit Game button
      this.quitButton = this.add
        .text(centerX, centerY + 120, "Quit Game", {
          fontFamily: "DePixelKlein",
          fontSize: "32px",
          resolution: 10
        })
        .setTintFill(0xff0000)
        .setOrigin(0.5)
        .setInteractive();

      // Toggle music when clicked
      this.speakerButton.on("pointerdown", () => {
        this.sound.play("click", { volume: 0.6 });
        if (!this.isMusicPlaying) {
          this.sound.setMute(false);
          this.speakerButton.setText("Sound: on");
        } else {
          this.sound.setMute(true);
          this.speakerButton.setText("Sound: off");
        }
        this.isMusicPlaying = !this.isMusicPlaying;
      });

      // Start game when clicked
      this.startButton.on("pointerdown", () => {
        this.sound.play("gameStart");
        this.scene.start("GUI");
        this.scene.start("MainScene");

        this.registry.events.emit("start-game");
      });

      // Quit game (only works in Electron or native app)
      this.quitButton.on("pointerdown", () => {
        this.sound.play("click", { volume: 0.6 });
        if (navigator.userAgent.includes("Electron")) {
          window.close();
        } else {
          alert("Quit functionality only works in a native app!");
        }
      });
    }
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    this.titleText.setPosition(centerX, centerY - 100);
    if (this.continueText) this.continueText.setPosition(centerX, centerY + 60);
    if (this.speakerButton) this.speakerButton.setPosition(centerX, centerY);
    if (this.startButton) this.startButton.setPosition(centerX, centerY + 60);
    if (this.quitButton) this.quitButton.setPosition(centerX, centerY + 120);
  }
}

export default MainMenu;
